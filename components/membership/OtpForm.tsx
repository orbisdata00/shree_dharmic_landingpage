"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

/** Seconds-left countdown; `start(n)` restarts it. */
export function useCountdown() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);
  return { left, start: (n: number) => setLeft(Math.max(0, Math.ceil(n))) };
}

type Props = {
  destination: string;               // where the code was sent, e.g. "+91 98765 43210"
  onVerify: (otp: string) => Promise<void>;
  onResend: () => void;
  resendIn: number;                  // seconds until resend is allowed
  sending: boolean;
  devOtp?: string | null;            // only present when the backend exposes codes (development)
  error?: string | null;
  info?: string | null;
  secondaryAction?: React.ReactNode; // e.g. "Change number"
};

export default function OtpForm({ destination, onVerify, onResend, resendIn, sending, devOtp, error, info, secondaryAction }: Props) {
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  // A fresh code was sent: clear the old entry
  useEffect(() => { if (sending) { setOtp(""); setLocalError(null); } }, [sending]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(otp)) { setLocalError("Enter the code from the SMS."); return; }
    setLocalError(null);
    setBusy(true);
    try { await onVerify(otp); } finally { setBusy(false); }
  };

  const shownError = localError ?? error;

  return (
    <form className="step-form" onSubmit={submit} noValidate>
      <header className="step-head">
        <h2>Verify your mobile number</h2>
        <p>Enter the code we sent by SMS to <strong className="nowrap">{destination}</strong>.</p>
      </header>

      {info && <p className="form-info" role="status">{info}</p>}
      {devOtp && (
        <p className="dev-hint" role="note">
          <span>Development mode</span> Your code is <strong>{devOtp}</strong>. Real SMS codes are never shown on screen.
        </p>
      )}

      <div className={`field${shownError ? " has-error" : ""}`}>
        <label htmlFor="otp">Verification code</label>
        <input
          ref={inputRef}
          id="otp"
          className="otp-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d*"
          maxLength={8}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          aria-invalid={!!shownError}
          aria-describedby={shownError ? "otp-error" : undefined}
        />
        {shownError && <p className="field__error" id="otp-error" role="alert">{shownError}</p>}
      </div>

      <div className="step-actions step-actions--split">
        <div className="resend">
          {resendIn > 0 ? (
            <span>Resend code in <strong>{resendIn}s</strong></span>
          ) : (
            <button type="button" className="link-btn" onClick={onResend} disabled={sending}>
              {sending ? "Sending…" : "Resend code"}
            </button>
          )}
          {secondaryAction}
        </div>
        <button type="submit" className="btn btn--primary" disabled={busy || sending}>
          {busy ? <><span className="spinner spinner--light" /> Verifying…</> : <>Verify <span className="arrow">→</span></>}
        </button>
      </div>
    </form>
  );
}
