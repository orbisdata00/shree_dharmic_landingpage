"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError, api, formatINR, formatMobile, friendlyError,
  type Fee, type PaymentStatus, type Registration,
} from "@/lib/membershipApi";
import { openCheckout } from "@/lib/razorpay";

type Props = {
  registration: Registration;
  token: string;
  fee: Fee | null;
  onActivated: () => void;
  onEdit: () => void;
  onNeedsVerification: () => void;
  onAuthError: (err: unknown) => boolean;
};

type Phase =
  | { kind: "checking" }                      // looking up any earlier payment
  | { kind: "idle"; lastFailed?: boolean }
  | { kind: "creating" }                      // creating the Razorpay order
  | { kind: "checkout" }                      // Checkout window open
  | { kind: "verifying" }                     // confirming with the backend
  | { kind: "pending"; reason: string | null } // polling until captured
  | { kind: "slow" }                          // still unconfirmed after ~2 minutes
  | { kind: "failed"; message: string }
  | { kind: "error"; message: string };

const POLL_MS = 4000;
const POLL_LIMIT_MS = 120_000;

const PENDING_TEXT: Record<string, string> = {
  awaiting_capture: "Your bank has authorised the payment. We're waiting for it to be captured.",
  awaiting_mobile_verification: "Payment received. Your mobile number needs to be verified again to finish.",
  provider_unreachable: "We're confirming your payment with Razorpay.",
  awaiting_payment: "We're waiting for confirmation of your payment.",
};

export default function PaymentStep({ registration, token, fee, onActivated, onEdit, onNeedsVerification, onAuthError }: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: "checking" });
  const [testMode, setTestMode] = useState(false);
  const pollTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; window.clearTimeout(pollTimer.current); }, []);

  /**
   * Decide what to show from a backend payment status. Returns true when settled (nothing to poll for).
   * `expectingPayment`: Checkout just reported a payment, so "awaiting_payment" means confirmation is
   * still on its way. Otherwise it only means an order exists and nothing has been paid yet.
   */
  const apply = useCallback((s: PaymentStatus, expectingPayment = false): boolean => {
    if (s.membership_status === "active") { onActivated(); return true; }
    if (s.pending_reason === "awaiting_mobile_verification") { onNeedsVerification(); return true; }
    if (s.pending_reason && (s.pending_reason !== "awaiting_payment" || expectingPayment)) {
      setPhase({ kind: "pending", reason: s.pending_reason });
      return false;
    }
    if (s.payment_status === "failed" || s.latest_attempt_status === "failed") {
      setPhase({ kind: "idle", lastFailed: true });
      return true;
    }
    setPhase({ kind: "idle" });
    return true;
  }, [onActivated, onNeedsVerification]);

  /** Poll payment-status every few seconds until settled or the time limit passes. */
  const poll = useCallback((startedAt = Date.now()) => {
    window.clearTimeout(pollTimer.current);
    pollTimer.current = window.setTimeout(async () => {
      if (!mounted.current) return;
      try {
        const s = await api.paymentStatus(token);
        if (!mounted.current || apply(s, true)) return;
      } catch (err) {
        if (onAuthError(err)) return;
      }
      if (Date.now() - startedAt > POLL_LIMIT_MS) setPhase({ kind: "slow" });
      else poll(startedAt);
    }, POLL_MS);
  }, [token, apply, onAuthError]);

  // On arrival: pick up a payment made earlier (e.g. the browser closed before confirmation)
  useEffect(() => {
    api.paymentStatus(token)
      .then((s) => { if (mounted.current && !apply(s)) poll(); })
      .catch((err) => { if (!onAuthError(err) && mounted.current) setPhase({ kind: "idle" }); });
  }, []);

  const pay = async () => {
    setPhase({ kind: "creating" });
    let order;
    try {
      order = await api.createOrder(token);
      setTestMode(order.payment_env === "test");
    } catch (err) {
      if (onAuthError(err)) return;
      if (err instanceof ApiError && (err.code === "MEMBERSHIP_ALREADY_ACTIVE" || err.code === "PAYMENT_ALREADY_CAPTURED")) {
        setPhase({ kind: "verifying" });
        try { if (!apply(await api.paymentStatus(token))) poll(); } catch { onActivated(); }
        return;
      }
      if (err instanceof ApiError && err.code === "MOBILE_NOT_VERIFIED") { onNeedsVerification(); return; }
      setPhase({ kind: "error", message: friendlyError(err) });
      return;
    }

    setPhase({ kind: "checkout" });
    let outcome;
    try {
      outcome = await openCheckout(order);
    } catch {
      setPhase({ kind: "error", message: "We couldn't open the payment window. Please check your connection and try again." });
      return;
    }

    if (outcome.kind === "completed") {
      setPhase({ kind: "verifying" });
      try {
        const s = await api.verifyPayment(token, outcome.response);
        if (!apply(s, true)) poll();
      } catch (err) {
        if (onAuthError(err)) return;
        // The signature check failed or the call didn't arrive; the backend also reconciles
        // with Razorpay, so keep checking the status instead of declaring failure.
        setPhase({ kind: "pending", reason: null });
        poll();
      }
    } else if (outcome.kind === "failed") {
      setPhase({ kind: "failed", message: outcome.message });
    } else {
      // Closed the window: they may still have paid (e.g. by UPI on another device)
      setPhase({ kind: "verifying" });
      try { if (!apply(await api.paymentStatus(token))) poll(); } catch { setPhase({ kind: "idle" }); }
    }
  };

  const busy = ["checking", "creating", "checkout", "verifying", "pending"].includes(phase.kind);
  const amount = fee ? formatINR(fee.amount_paise) : null;

  return (
    <div className="step-form">
      <header className="step-head">
        <h2>Complete your membership</h2>
        <p>Your mobile number is verified. Review your details and pay the membership fee to activate your membership.</p>
      </header>

      <dl className="summary">
        <div><dt>Name</dt><dd>{registration.full_name}</dd></div>
        <div><dt>Mobile</dt><dd>{formatMobile(registration.mobile)} <span className="badge badge--ok">Verified</span></dd></div>
        <div><dt>Email</dt><dd className="break">{registration.email}</dd></div>
        <div className="summary__total"><dt>Membership fee</dt><dd>{amount ?? <span className="skeleton" />}</dd></div>
      </dl>

      {phase.kind === "idle" && phase.lastFailed && (
        <p className="form-error" role="alert">Your last payment attempt didn&apos;t go through. No membership was activated — you can try again.</p>
      )}
      {phase.kind === "failed" && (
        <p className="form-error" role="alert">{phase.message} Please try again.</p>
      )}
      {phase.kind === "error" && <p className="form-error" role="alert">{phase.message}</p>}

      {(phase.kind === "verifying" || phase.kind === "pending") && (
        <div className="status-box" role="status">
          <span className="spinner" />
          <div>
            <strong>Confirming your payment…</strong>
            <span>{phase.kind === "pending" && phase.reason ? PENDING_TEXT[phase.reason] ?? PENDING_TEXT.awaiting_payment : "This usually takes a few seconds. Please keep this page open."}</span>
          </div>
        </div>
      )}

      {phase.kind === "slow" && (
        <div className="status-box status-box--info" role="status">
          <div>
            <strong>We&apos;re still confirming your payment</strong>
            <span>If money was deducted, your membership will be activated automatically once Razorpay confirms it — you don&apos;t need to pay again. You can check back any time.</span>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => { setPhase({ kind: "pending", reason: null }); poll(); }}>Check again</button>
        </div>
      )}

      <div className="step-actions step-actions--split">
        <button type="button" className="link-btn" onClick={onEdit} disabled={busy}>Edit details</button>
        <button type="button" className="btn btn--primary btn--pay" onClick={pay} disabled={busy || phase.kind === "slow" || !fee}>
          {phase.kind === "creating" ? <><span className="spinner spinner--light" /> Preparing…</>
            : phase.kind === "checkout" ? <><span className="spinner spinner--light" /> Waiting for payment…</>
            : <><LockIcon /> {phase.kind === "failed" || (phase.kind === "idle" && phase.lastFailed) ? "Try again" : `Pay ${amount ?? ""} securely`}</>}
        </button>
      </div>

      <p className="secure-note">
        <LockIcon /> Payments are processed by Razorpay. We never see or store your card or bank details.
        {testMode && <span className="badge badge--test">Test mode — no real money is charged</span>}
      </p>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
