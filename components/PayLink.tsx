"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate, formatINR, friendlyError, type CheckoutResponse } from "@/lib/membershipApi";
import {
  isLinkRef, isOrderRef, paymentLinkApi, receiptUrl,
  type LinkCallback, type LinkPayment, type PaymentLink,
} from "@/lib/paymentLinkApi";
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
  | { kind: "ready" }        // show the form (or the paid / ended card)
  | { kind: "creating" }     // creating this payment's Razorpay order
  | { kind: "checkout" }     // Checkout window open
  | { kind: "verifying" }
  | { kind: "pending" }      // polling until Razorpay confirms
  | { kind: "slow" }         // still unconfirmed after ~2 minutes
  | { kind: "failed"; message: string }
  | { kind: "error"; message: string };

const ENDED: Record<string, { title: string; text: string }> = {
  inactive: { title: "This link isn't accepting payments", text: "Please contact the committee if you'd like to pay." },
  expired: { title: "This link has expired", text: "Please ask the committee for a new payment link." },
  not_created: { title: "This link isn't available", text: "Please ask the committee for a new payment link." },
};

const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

/** Reads the link reference, a payment reference and Razorpay's return parameters from the address bar. */
function readUrl(): { ref: string | null; orderRef: string | null; callback: LinkCallback | null } {
  const q = new URLSearchParams(window.location.search);
  const ref = q.get("ref") || q.get("razorpay_payment_link_reference_id");
  const values = CALLBACK_KEYS.map((k) => q.get(k) ?? "");
  const complete = values.every((v, i) => v || CALLBACK_KEYS[i] === "razorpay_payment_link_reference_id");
  const callback = complete ? (Object.fromEntries(CALLBACK_KEYS.map((k, i) => [k, values[i]])) as LinkCallback) : null;
  return { ref, orderRef: q.get("order"), callback };
}

/** Keeps ?ref=…&order=… in the address bar so a refresh shows the same payment (and its receipt). */
function setUrl(ref: string, orderRef: string | null) {
  window.history.replaceState(null, "", `${window.location.pathname}?ref=${ref}${orderRef ? `&order=${orderRef}` : ""}`);
}

export default function PayLink() {
  const [ref, setRef] = useState<string | null>(null);
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [payment, setPayment] = useState<LinkPayment | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [closeHint, setCloseHint] = useState(false);
  const pollTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; window.clearTimeout(pollTimer.current); };
  }, []);

  /**
   * Show a payment's state. Returns true when nothing is left to wait for.
   * `expecting`: the payer just paid, so "created" means Razorpay's confirmation is still on its way.
   */
  const settle = (p: LinkPayment, expecting: boolean): boolean => {
    if (!mounted.current) return true;
    setPayment(p);
    if (p.status === "paid") { setPhase({ kind: "ready" }); return true; }
    if (p.status === "authorized" || (expecting && p.status === "created")) { setPhase({ kind: "pending" }); return false; }
    if (p.status === "failed") {
      setPhase({ kind: "failed", message: p.error_description || "The payment didn't go through." });
      return true;
    }
    setPhase({ kind: "ready" });
    return true;
  };

  const poll = (orderRef: string, startedAt = Date.now()) => {
    window.clearTimeout(pollTimer.current);
    pollTimer.current = window.setTimeout(async () => {
      if (!mounted.current) return;
      try {
        if (settle(await paymentLinkApi.payment(orderRef), true)) return;
      } catch { /* keep polling */ }
      if (Date.now() - startedAt > POLL_LIMIT_MS) setPhase({ kind: "slow" });
      else poll(orderRef, startedAt);
    }, POLL_MS);
  };

  /** Legacy rzp.io links: Razorpay just returned the payer. The backend may need a moment to see the payment. */
  const confirmCallback = (r: string, cb: LinkCallback, attempt = 0) => {
    paymentLinkApi.callback(r, cb)
      .then((p) => { setUrl(r, p.order_ref); if (!settle(p, true)) poll(p.order_ref); })
      .catch(() => {
        if (!mounted.current) return;
        if (attempt < 10) window.setTimeout(() => confirmCallback(r, cb, attempt + 1), POLL_MS);
        else setPhase({ kind: "slow" });
      });
  };

  useEffect(() => {
    const { ref: r, orderRef, callback } = readUrl();
    if (!isLinkRef(r)) {
      setPhase({ kind: "invalid", message: "This payment link isn't complete. Please open the full link you were sent." });
      return;
    }
    setRef(r);
    paymentLinkApi.get(r)
      .then((l) => {
        if (!mounted.current) return;
        setLink(l);
        if (l.customer_name) setName(l.customer_name);
        if (callback) {
          setUrl(r, null); // drop Razorpay's parameters so a refresh doesn't resend them
          setPhase({ kind: "verifying" });
          confirmCallback(r, callback);
        } else if (isOrderRef(orderRef)) {
          setPhase({ kind: "verifying" });
          paymentLinkApi.payment(orderRef)
            .then((p) => { if (!settle(p, false)) poll(orderRef); })
            .catch(() => { setUrl(r, null); setPhase({ kind: "ready" }); });
        } else {
          setPhase({ kind: "ready" });
        }
      })
      .catch((err) => setPhase({ kind: "invalid", message: friendlyError(err) }));
  }, []);

  const confirm = async (orderRef: string, response: CheckoutResponse) => {
    setPhase({ kind: "verifying" });
    try {
      if (!settle(await paymentLinkApi.verify(response), true)) poll(orderRef);
    } catch {
      // The backend also hears from Razorpay directly, so keep checking rather than declaring failure.
      setPhase({ kind: "pending" });
      poll(orderRef);
    }
  };

  const busy = ["creating", "checkout", "verifying", "pending"].includes(phase.kind);
  const fixed = link?.link_type === "fixed";
  const min = (link?.min_amount_paise ?? 100) / 100;
  const max = (link?.max_amount_paise ?? 0) / 100;
  const entered = Number(amount) || 0;
  const trimmedName = name.trim().replace(/\s+/g, " ");
  const nameError = trimmedName.length < 2 || !/\p{L}/u.test(trimmedName) ? "Please enter your full name for the receipt." : null;
  const amountError = fixed ? null
    : !entered ? "Please enter the amount you'd like to pay."
    : entered < min ? `The minimum is ${rupees(min)}.`
    : max && entered > max ? `The maximum is ${rupees(max)}.`
    : null;

  const pay = async () => {
    setTouched(true);
    if (!ref || !link || amountError || nameError || busy) return;
    setPhase({ kind: "creating" });
    let order;
    try {
      order = await paymentLinkApi.createOrder(ref, trimmedName, fixed ? null : entered * 100);
    } catch (err) {
      setPhase({ kind: "error", message: friendlyError(err) });
      paymentLinkApi.get(ref).then((l) => mounted.current && setLink(l)).catch(() => {}); // e.g. deactivated meanwhile
      return;
    }
    setPayment(null);
    setUrl(ref, order.order_ref);

    setPhase({ kind: "checkout" });
    let outcome;
    try {
      outcome = await openCheckout(order);
    } catch {
      setPhase({ kind: "error", message: "We couldn't open the payment window. Please check your connection and try again." });
      return;
    }
    if (outcome.kind === "completed") await confirm(order.order_ref, outcome.response);
    else if (outcome.kind === "failed") setPhase({ kind: "failed", message: outcome.message });
    else {
      // Closed the window: they may still have paid (e.g. by UPI on another device)
      try {
        const p = await paymentLinkApi.payment(order.order_ref);
        if (p.status === "paid" || p.status === "authorized") { if (!settle(p, true)) poll(order.order_ref); }
        else { setUrl(ref, null); setPhase({ kind: "ready" }); }
      } catch {
        setPhase({ kind: "ready" });
      }
    }
  };

  /** Back to the form for another payment through the same link. */
  const payAgain = () => {
    if (!ref) return;
    window.clearTimeout(pollTimer.current);
    setPayment(null);
    setAmount("");
    setTouched(false);
    setCloseHint(false);
    setUrl(ref, null);
    setPhase({ kind: "ready" });
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

  if (phase.kind === "loading" || (phase.kind === "verifying" && !payment)) {
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

  if (payment?.status === "paid") {
    return (
      <div className="donate-card donate-done" role="status">
        <div className="donate-done__seal"><DiyaMark className="icon-diya" /></div>
        <p className="donate-eyebrow">Dhanyavaad</p>
        <h2>Payment received</h2>
        <p>Your payment of <strong>{formatINR(payment.amount_paise)}</strong> has been received.</p>
        <dl className="donate-done__ref">
          <div><dt>For</dt><dd>{payment.description}</dd></div>
          {payment.payer_name && <div><dt>Paid by</dt><dd>{payment.payer_name}</dd></div>}
          <div><dt>Reference</dt><dd>{payment.order_ref}</dd></div>
          {payment.razorpay_payment_id && <div><dt>Payment ID</dt><dd>{payment.razorpay_payment_id}</dd></div>}
          {payment.receipt_number && <div><dt>Receipt No.</dt><dd>{payment.receipt_number}</dd></div>}
          {payment.paid_at && <div><dt>Paid on</dt><dd>{formatDate(payment.paid_at)}</dd></div>}
        </dl>
        <div className="donate-done__actions">
          {payment.receipt_number && (
            <a className="btn btn--primary btn--sm" href={receiptUrl(payment.order_ref)} download>
              Download receipt (PDF)
            </a>
          )}
          {link.status === "active" && (
            <button type="button" className="btn btn--outline btn--sm" onClick={payAgain}>Make another payment</button>
          )}
          <button type="button" className="btn btn--outline btn--sm" onClick={closePage}>Close</button>
        </div>
        {closeHint
          ? <p className="donate-fine" role="status">You can now close this page - tap ✕ or the back button to return to the app you opened the link from.</p>
          : <p className="donate-fine">Please keep your receipt and these references for your records.</p>}
      </div>
    );
  }

  /* ---------- Not accepting payments ---------- */

  const ended = ENDED[link.status];
  if (ended && !payment) {
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

  return (
    <form className="donate-card" noValidate onSubmit={(e) => { e.preventDefault(); pay(); }}>
      <p className="donate-eyebrow">Payment request</p>
      <h2>{fixed ? formatINR(link.amount_paise ?? 0) : "Enter your amount"}</h2>

      <div className="pay-for">
        <span>For</span>
        <strong>{link.description}</strong>
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

      <label className="donate-label" htmlFor="pay-name">Your name (for the receipt)</label>
      <div className={`donate-input${touched && nameError ? " has-error" : ""}`}>
        <input id="pay-name" autoComplete="name" placeholder="Full name" value={name} maxLength={120}
          disabled={busy} aria-invalid={touched && !!nameError} aria-describedby={touched && nameError ? "pay-name-error" : undefined}
          onChange={(e) => setName(e.target.value)} />
      </div>
      {touched && nameError && <p id="pay-name-error" className="donate-error-text">{nameError}</p>}

      <div className="donate-total">
        <span>{fixed ? "Amount to pay" : "You pay"}</span>
        <strong>{fixed ? formatINR(link.amount_paise ?? 0) : entered ? rupees(entered) : "-"}</strong>
      </div>
      {fixed && <p className="pay-hint">This amount is set by the committee and can&apos;t be changed.</p>}

      {phase.kind === "failed" && <p className="form-error" role="alert">{phase.message} No money was taken - please try again.</p>}
      {phase.kind === "error" && <p className="form-error" role="alert">{phase.message}</p>}
      {ended && <p className="form-error" role="alert">{ended.title}.</p>}
      {(phase.kind === "verifying" || phase.kind === "pending") && (
        <div className="status-box" role="status">
          <span className="spinner" />
          <div>
            <strong>Confirming your payment…</strong>
            <span>
              {payment?.pending_reason === "awaiting_capture"
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
            <span>If money was deducted it will be recorded automatically - you don&apos;t need to pay again.{payment ? ` Reference: ${payment.order_ref}` : ""}</span>
          </div>
          {payment && (
            <button type="button" className="btn btn--outline btn--sm" onClick={() => { setPhase({ kind: "pending" }); poll(payment.order_ref); }}>
              Check again
            </button>
          )}
        </div>
      )}

      <button type="submit" className="btn btn--primary donate-submit" disabled={busy || phase.kind === "slow" || !!ended}>
        {phase.kind === "creating" ? <><span className="spinner spinner--light" /> Opening Razorpay…</>
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
