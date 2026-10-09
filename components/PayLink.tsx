"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate, formatINR, friendlyError, type CheckoutResponse } from "@/lib/membershipApi";
import { isLinkRef, paymentLinkApi, receiptUrl, type LinkCallback, type PaymentLink } from "@/lib/paymentLinkApi";
import { openCheckout } from "@/lib/razorpay";
import { DiyaMark } from "./ui";

const POLL_MS = 4000;
const POLL_LIMIT_MS = 120_000;
const CALLBACK_KEYS = [
  "razorpay_payment_id", "razorpay_payment_link_id", "razorpay_payment_link_reference_id",
  "razorpay_payment_link_status", "razorpay_signature",
] as const;

type Phase =
  | { kind: "loading" }
  | { kind: "invalid"; message: string }
  | { kind: "ready" }        // payable: show the amount / amount input
  | { kind: "creating" }     // creating the Razorpay order (custom links)
  | { kind: "checkout" }     // Checkout window open (custom links)
  | { kind: "redirecting" }  // leaving for Razorpay's payment page (fixed links)
  | { kind: "verifying" }
  | { kind: "pending" }      // polling until Razorpay confirms
  | { kind: "slow" }         // still unconfirmed after ~2 minutes
  | { kind: "failed"; message: string }
  | { kind: "error"; message: string };

const ENDED: Record<string, { title: string; text: string }> = {
  cancelled: { title: "This link has been cancelled", text: "It can no longer be used for payment. Please contact the committee if you still need to pay." },
  expired: { title: "This link has expired", text: "Please ask the committee for a new payment link." },
  not_created: { title: "This link isn't available", text: "Please ask the committee for a new payment link." },
};

const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

/** Reads the link reference, and Razorpay's return parameters if any, from the address bar. */
function readUrl(): { ref: string | null; callback: LinkCallback | null } {
  const q = new URLSearchParams(window.location.search);
  const ref = q.get("ref") || q.get("razorpay_payment_link_reference_id");
  const values = CALLBACK_KEYS.map((k) => q.get(k) ?? "");
  const complete = values.every((v, i) => v || CALLBACK_KEYS[i] === "razorpay_payment_link_reference_id");
  const callback = complete ? (Object.fromEntries(CALLBACK_KEYS.map((k, i) => [k, values[i]])) as LinkCallback) : null;
  return { ref, callback };
}

export default function PayLink() {
  const [ref, setRef] = useState<string | null>(null);
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const [closeHint, setCloseHint] = useState(false);
  const pollTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; window.clearTimeout(pollTimer.current); };
  }, []);

  /**
   * Show a link's state. Returns true when nothing is left to wait for.
   * `expecting`: the payer just paid (Checkout handler or Razorpay's return), so an unpaid link means
   * Razorpay's confirmation is still on its way rather than "nothing paid yet".
   */
  const settle = (l: PaymentLink, expecting: boolean): boolean => {
    if (!mounted.current) return true;
    setLink(l);
    if (l.status === "paid" || ENDED[l.status]) { setPhase({ kind: "ready" }); return true; }
    if (l.status === "authorized" || (expecting && l.status === "active")) { setPhase({ kind: "pending" }); return false; }
    if (expecting && l.status === "failed") {
      setPhase({ kind: "failed", message: l.error_description || "The payment didn't go through." });
      return true;
    }
    setPhase({ kind: "ready" });
    return true;
  };

  const poll = (r: string, startedAt = Date.now()) => {
    window.clearTimeout(pollTimer.current);
    pollTimer.current = window.setTimeout(async () => {
      if (!mounted.current) return;
      try {
        if (settle(await paymentLinkApi.get(r), true)) return;
      } catch { /* keep polling */ }
      if (Date.now() - startedAt > POLL_LIMIT_MS) setPhase({ kind: "slow" });
      else poll(r, startedAt);
    }, POLL_MS);
  };

  useEffect(() => {
    const { ref: r, callback } = readUrl();
    if (!isLinkRef(r)) {
      setPhase({ kind: "invalid", message: "This payment link isn't complete. Please open the full link you were sent." });
      return;
    }
    setRef(r);
    if (callback) {
      // Back from Razorpay's payment page: confirm, and drop the parameters so a refresh doesn't resend them.
      window.history.replaceState(null, "", `${window.location.pathname}?ref=${r}`);
      setPhase({ kind: "verifying" });
      paymentLinkApi.callback(r, callback)
        .then((l) => { if (!settle(l, true)) poll(r); })
        .catch(() => { setPhase({ kind: "pending" }); poll(r); }); // the backend also hears from Razorpay directly
      return;
    }
    paymentLinkApi.get(r)
      .then((l) => { if (!settle(l, false)) poll(r); })
      .catch((err) => setPhase({ kind: "invalid", message: friendlyError(err) }));
  }, []);

  const confirm = async (r: string, response: CheckoutResponse) => {
    setPhase({ kind: "verifying" });
    try {
      if (!settle(await paymentLinkApi.verify(response), true)) poll(r);
    } catch {
      setPhase({ kind: "pending" });
      poll(r);
    }
  };

  const busy = ["creating", "checkout", "redirecting", "verifying", "pending"].includes(phase.kind);
  const min = (link?.min_amount_paise ?? 100) / 100;
  const max = (link?.max_amount_paise ?? 0) / 100;
  const entered = Number(amount) || 0;
  const amountError = !entered ? "Please enter the amount you'd like to pay."
    : entered < min ? `The minimum is ${rupees(min)}.`
    : max && entered > max ? `The maximum is ${rupees(max)}.`
    : null;

  const payFixed = () => {
    if (!link?.pay_url) return;
    setPhase({ kind: "redirecting" });
    window.location.assign(link.pay_url);
  };

  const payCustom = async () => {
    setTouched(true);
    if (!ref || amountError || busy) return;
    setPhase({ kind: "creating" });
    let order;
    try {
      order = await paymentLinkApi.createOrder(ref, entered * 100);
    } catch (err) {
      setPhase({ kind: "error", message: friendlyError(err) });
      paymentLinkApi.get(ref).then((l) => settle(l, false)).catch(() => {}); // e.g. paid or cancelled meanwhile
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
    if (outcome.kind === "completed") await confirm(ref, outcome.response);
    else if (outcome.kind === "failed") setPhase({ kind: "failed", message: outcome.message });
    else {
      // Closed the window: they may still have paid (e.g. by UPI on another device)
      try {
        if (!settle(await paymentLinkApi.get(ref), false)) poll(ref);
      } catch {
        setPhase({ kind: "ready" });
      }
    }
  };

  /**
   * Browsers only let a page close itself when a script opened it, so this works when the link was opened
   * in a new tab by the site that showed it; otherwise (e.g. WhatsApp's in-app browser) explain how to go back.
   */
  const closePage = () => {
    window.close();
    window.setTimeout(() => { if (mounted.current) setCloseHint(true); }, 300);
  };

  /* ---------- Loading / invalid ---------- */

  if (phase.kind === "loading" || (phase.kind === "verifying" && !link)) {
    return (
      <div className="donate-card pay-ended" role="status">
        <span className="spinner" />
        <p>{phase.kind === "verifying" ? "Confirming your payment…" : "Loading your payment details…"}</p>
      </div>
    );
  }
  if (phase.kind === "invalid" || !link || !ref) {
    return (
      <div className="donate-card pay-ended" role="alert">
        <p className="donate-eyebrow">Payment link</p>
        <h2>We couldn&apos;t open this link</h2>
        <p>{phase.kind === "invalid" ? phase.message : "Please check the link you were sent."}</p>
      </div>
    );
  }

  /* ---------- Paid ---------- */

  if (link.status === "paid") {
    return (
      <div className="donate-card donate-done" role="status">
        <div className="donate-done__seal"><DiyaMark className="icon-diya" /></div>
        <p className="donate-eyebrow">Dhanyavaad</p>
        <h2>Payment received</h2>
        <p>Your payment of <strong>{formatINR(link.amount_paid_paise ?? link.amount_paise ?? 0)}</strong> has been received.</p>
        <dl className="donate-done__ref">
          <div><dt>For</dt><dd>{link.description}</dd></div>
          <div><dt>Reference</dt><dd>{link.link_ref}</dd></div>
          {link.razorpay_payment_id && <div><dt>Payment ID</dt><dd>{link.razorpay_payment_id}</dd></div>}
          {link.receipt_number && <div><dt>Receipt No.</dt><dd>{link.receipt_number}</dd></div>}
          {link.paid_at && <div><dt>Paid on</dt><dd>{formatDate(link.paid_at)}</dd></div>}
        </dl>
        <div className="donate-done__actions">
          {link.receipt_number && (
            <a className="btn btn--primary btn--sm" href={receiptUrl(link.link_ref)} download>
              Download receipt (PDF)
            </a>
          )}
          <button type="button" className="btn btn--outline btn--sm" onClick={closePage}>Close</button>
        </div>
        {closeHint
          ? <p className="donate-fine" role="status">You can now close this page - tap ✕ or the back button to return to the app you opened the link from.</p>
          : <p className="donate-fine">Please keep your receipt and these references for your records.</p>}
      </div>
    );
  }

  /* ---------- Cancelled / expired ---------- */

  const ended = ENDED[link.status];
  if (ended) {
    return (
      <div className="donate-card pay-ended" role="status">
        <p className="donate-eyebrow">Payment link</p>
        <h2>{ended.title}</h2>
        <p>{ended.text}</p>
        <p className="donate-fine">Reference: {link.link_ref}</p>
      </div>
    );
  }

  /* ---------- Payable ---------- */

  const fixed = link.link_type === "fixed";
  return (
    <form className="donate-card" noValidate onSubmit={(e) => { e.preventDefault(); if (fixed) payFixed(); else payCustom(); }}>
      <p className="donate-eyebrow">Payment request</p>
      <h2>{fixed ? formatINR(link.amount_paise ?? 0) : "Enter your amount"}</h2>

      <div className="pay-for">
        <span>For</span>
        <strong>{link.description}</strong>
        {link.customer_name && <small>Requested from {link.customer_name}</small>}
      </div>

      {!fixed && (
        <>
          <label className="donate-label" htmlFor="pay-amount">Amount</label>
          <div className={`donate-input${touched && amountError ? " has-error" : ""}`}>
            <span aria-hidden="true">₹</span>
            <input id="pay-amount" inputMode="numeric" autoComplete="off" placeholder="Enter amount" value={amount}
              disabled={busy} aria-invalid={touched && !!amountError}
              aria-describedby={touched && amountError ? "pay-amount-error" : "pay-amount-hint"}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 8))} />
          </div>
          {touched && amountError
            ? <p id="pay-amount-error" className="donate-error-text">{amountError}</p>
            : <p id="pay-amount-hint" className="pay-hint">Whole rupees, from {rupees(min)}.</p>}
        </>
      )}

      <div className="donate-total">
        <span>{fixed ? "Amount to pay" : "You pay"}</span>
        <strong>{fixed ? formatINR(link.amount_paise ?? 0) : entered ? rupees(entered) : "-"}</strong>
      </div>
      {fixed && <p className="pay-hint">This amount is set by the committee and can&apos;t be changed.</p>}

      {phase.kind === "ready" && link.status === "failed" && (
        <p className="form-error" role="alert">
          Your last payment attempt didn&apos;t go through{link.error_description ? ` (${link.error_description})` : ""}. No money was taken - you can try again.
        </p>
      )}
      {phase.kind === "failed" && <p className="form-error" role="alert">{phase.message} No money was taken - please try again.</p>}
      {phase.kind === "error" && <p className="form-error" role="alert">{phase.message}</p>}
      {(phase.kind === "verifying" || phase.kind === "pending") && (
        <div className="status-box" role="status">
          <span className="spinner" />
          <div>
            <strong>Confirming your payment…</strong>
            <span>
              {link.pending_reason === "awaiting_capture"
                ? "Your bank has authorised the payment. We're waiting for it to be captured."
                : "This usually takes a few seconds. Please keep this page open."}
            </span>
          </div>
        </div>
      )}
      {phase.kind === "slow" && (
        <div className="status-box status-box--info" role="status">
          <div>
            <strong>We&apos;re still confirming your payment</strong>
            <span>If money was deducted it will be recorded automatically - you don&apos;t need to pay again. Reference: {link.link_ref}</span>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => { setPhase({ kind: "pending" }); poll(ref); }}>
            Check again
          </button>
        </div>
      )}

      <button type="submit" className="btn btn--primary donate-submit"
        disabled={busy || phase.kind === "slow" || (fixed && !link.pay_url)}>
        {phase.kind === "creating" || phase.kind === "redirecting" ? <><span className="spinner spinner--light" /> Opening Razorpay…</>
          : phase.kind === "checkout" ? <><span className="spinner spinner--light" /> Waiting for payment…</>
          : <>{fixed ? `Pay ${formatINR(link.amount_paise ?? 0)} securely` : "Continue to pay"} <span className="arrow">→</span></>}
      </button>

      {link.expire_by && <p className="pay-hint">This link is valid until {formatDate(link.expire_by)}.</p>}
      <p className="donate-methods">UPI · Net Banking · Card · Wallets</p>
      <p className="secure-note">
        Payments are processed securely by Razorpay. We never see or store your card or bank details.
        {link.payment_env === "test" && <span className="badge badge--test">Test mode - no real money is charged</span>}
      </p>
    </form>
  );
}
