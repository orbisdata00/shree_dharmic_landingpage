"use client";

import { useEffect, useRef, useState } from "react";
import { friendlyError, type CheckoutResponse } from "@/lib/membershipApi";
import { donationApi, receiptUrl, type Donation, type DonationSettings } from "@/lib/donationApi";
import { openCheckout } from "@/lib/razorpay";
import { DiyaMark } from "./ui";

/** Preset amounts in rupees, smallest first. Ones outside the backend's allowed range are hidden. */
const PRESETS = [1101, 2101, 5101, 11001, 21001, 51001];
// Shown until /donations/settings answers; the backend enforces its own range regardless.
const FALLBACK_RANGE: DonationSettings = { min_amount_paise: 10_000, max_amount_paise: 50_000_000, currency: "INR" };

const POLL_MS = 4000;
const POLL_LIMIT_MS = 120_000;

type Phase =
  | { kind: "idle" }
  | { kind: "creating" }
  | { kind: "checkout" }
  | { kind: "verifying" }
  | { kind: "pending"; ref: string }
  | { kind: "slow"; ref: string }
  | { kind: "paid"; donation: Donation }
  | { kind: "failed"; message: string }
  | { kind: "error"; message: string };

const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function DonateForm() {
  const [range, setRange] = useState(FALLBACK_RANGE);
  const [preset, setPreset] = useState<number | null>(PRESETS[0]);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [testMode, setTestMode] = useState(false);
  const pollTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    donationApi.settings().then((s) => mounted.current && setRange(s)).catch(() => { /* keep the fallback */ });
    return () => { mounted.current = false; window.clearTimeout(pollTimer.current); };
  }, []);

  const min = range.min_amount_paise / 100;
  const max = range.max_amount_paise / 100;
  const presets = PRESETS.filter((p) => p >= min && p <= max);
  const amount = custom ? Number(custom) : preset ?? 0;
  const amountError = custom && (amount < min || amount > max)
    ? `Please enter an amount between ${rupees(min)} and ${rupees(max)}.`
    : null;
  const trimmedName = name.trim().replace(/\s+/g, " ");
  const nameError = trimmedName.length < 2 || !/\p{L}/u.test(trimmedName) ? "Please enter your full name for the receipt." : null;
  const busy = ["creating", "checkout", "verifying", "pending"].includes(phase.kind);

  const settle = (d: Donation): boolean => {
    if (d.status === "paid") { setPhase({ kind: "paid", donation: d }); return true; }
    if (d.status === "failed") { setPhase({ kind: "failed", message: "The payment didn't go through." }); return true; }
    setPhase({ kind: "pending", ref: d.donation_ref });
    return false;
  };

  const poll = (ref: string, startedAt = Date.now()) => {
    window.clearTimeout(pollTimer.current);
    pollTimer.current = window.setTimeout(async () => {
      if (!mounted.current) return;
      try {
        if (settle(await donationApi.status(ref))) return;
      } catch { /* keep polling */ }
      if (Date.now() - startedAt > POLL_LIMIT_MS) setPhase({ kind: "slow", ref });
      else poll(ref, startedAt);
    }, POLL_MS);
  };

  const confirm = async (ref: string, response: CheckoutResponse) => {
    setPhase({ kind: "verifying" });
    try {
      if (!settle(await donationApi.verify(response))) poll(ref);
    } catch {
      // The backend also hears from Razorpay directly, so keep checking rather than declaring failure.
      setPhase({ kind: "pending", ref });
      poll(ref);
    }
  };

  const donate = async () => {
    setNameTouched(true);
    if (!amount || amountError || nameError || busy) return;
    setPhase({ kind: "creating" });
    let order;
    try {
      order = await donationApi.createOrder(Math.round(amount) * 100, trimmedName);
      setTestMode(order.payment_env === "test");
    } catch (err) {
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
    if (outcome.kind === "completed") await confirm(order.donation_ref, outcome.response);
    else if (outcome.kind === "failed") setPhase({ kind: "failed", message: outcome.message });
    else {
      // Closed the window: they may still have paid (e.g. by UPI on another device)
      try {
        const d = await donationApi.status(order.donation_ref);
        if (d.status === "paid") setPhase({ kind: "paid", donation: d });
        else if (d.status === "authorized") { setPhase({ kind: "pending", ref: d.donation_ref }); poll(d.donation_ref); }
        else setPhase({ kind: "idle" });
      } catch {
        setPhase({ kind: "idle" });
      }
    }
  };

  if (phase.kind === "paid") {
    const d = phase.donation;
    return (
      <div className="donate-card donate-done" role="status">
        <div className="donate-done__seal"><DiyaMark className="icon-diya" /></div>
        <p className="donate-eyebrow">Dhanyavaad</p>
        <h2>Thank you for your seva</h2>
        <p>Your contribution of <strong>{rupees(d.amount_paise / 100)}</strong> has been received.</p>
        <dl className="donate-done__ref">
          <div><dt>Donation reference</dt><dd>{d.donation_ref}</dd></div>
          {d.razorpay_payment_id && <div><dt>Payment ID</dt><dd>{d.razorpay_payment_id}</dd></div>}
          {d.receipt_number && <div><dt>Receipt No.</dt><dd>{d.receipt_number}</dd></div>}
        </dl>
        <div className="donate-done__actions">
          {d.receipt_number && (
            <a className="btn btn--primary btn--sm" href={receiptUrl(d.donation_ref)} download>
              Download receipt (PDF)
            </a>
          )}
          <button type="button" className="btn btn--outline btn--sm" onClick={() => { setPhase({ kind: "idle" }); setCustom(""); }}>
            Make another contribution
          </button>
        </div>
        <p className="donate-fine">Please keep your receipt and these references for your records.</p>
      </div>
    );
  }

  return (
    <form className="donate-card" onSubmit={(e) => { e.preventDefault(); donate(); }} noValidate>
      <p className="donate-eyebrow">Make your contribution</p>
      <h2>Choose an Amount</h2>

      <div className="donate-presets" role="radiogroup" aria-label="Donation amount">
        {presets.map((p) => {
          const on = !custom && preset === p;
          return (
            <button key={p} type="button" role="radio" aria-checked={on} className={on ? "is-active" : undefined}
              disabled={busy} onClick={() => { setPreset(p); setCustom(""); }}>
              {rupees(p)}
            </button>
          );
        })}
      </div>

      <label className="donate-label" htmlFor="donate-amount">Or enter your own amount</label>
      <div className={`donate-input${amountError ? " has-error" : ""}`}>
        <span aria-hidden="true">₹</span>
        <input id="donate-amount" inputMode="numeric" autoComplete="off" placeholder="Enter amount" value={custom}
          disabled={busy} aria-invalid={!!amountError} aria-describedby="donate-amount-hint"
          onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9))} />
      </div>
      <p id="donate-amount-hint" className={amountError ? "donate-error-text" : "donate-fine"}>
        {amountError ?? `Minimum ${rupees(min)}, maximum ${rupees(max)}.`}
      </p>

      <label className="donate-label" htmlFor="donate-name">Your name (for the receipt)</label>
      <div className={`donate-input${nameTouched && nameError ? " has-error" : ""}`}>
        <input id="donate-name" autoComplete="name" placeholder="Full name" value={name} maxLength={120}
          disabled={busy} aria-invalid={nameTouched && !!nameError} aria-describedby={nameTouched && nameError ? "donate-name-error" : undefined}
          onChange={(e) => setName(e.target.value)} onBlur={() => setNameTouched(true)} />
      </div>
      {nameTouched && nameError && <p id="donate-name-error" className="donate-error-text">{nameError}</p>}

      <div className="donate-total">
        <span>Your contribution</span>
        <strong>{amount ? rupees(amount) : "-"}</strong>
      </div>

      {phase.kind === "failed" && <p className="form-error" role="alert">{phase.message} No money was taken - please try again.</p>}
      {phase.kind === "error" && <p className="form-error" role="alert">{phase.message}</p>}
      {(phase.kind === "verifying" || phase.kind === "pending") && (
        <div className="status-box" role="status">
          <span className="spinner" />
          <div>
            <strong>Confirming your payment…</strong>
            <span>This usually takes a few seconds. Please keep this page open.</span>
          </div>
        </div>
      )}
      {phase.kind === "slow" && (
        <div className="status-box status-box--info" role="status">
          <div>
            <strong>We&apos;re still confirming your payment</strong>
            <span>If money was deducted it will be recorded automatically - you don&apos;t need to pay again. Reference: {phase.ref}</span>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => { setPhase({ kind: "pending", ref: phase.ref }); poll(phase.ref); }}>
            Check again
          </button>
        </div>
      )}

      <button type="submit" className="btn btn--primary donate-submit" disabled={busy || !amount || !!amountError || phase.kind === "slow"}>
        {phase.kind === "creating" ? <><span className="spinner spinner--light" /> Preparing…</>
          : phase.kind === "checkout" ? <><span className="spinner spinner--light" /> Waiting for payment…</>
          : <>Continue to Donate <span className="arrow">→</span></>}
      </button>

      <p className="donate-methods">UPI · Net Banking · Card · Wallets</p>
      <p className="secure-note">
        Payments are processed securely by Razorpay. We never see or store your card or bank details.
        {testMode && <span className="badge badge--test">Test mode - no real money is charged</span>}
      </p>
    </form>
  );
}
