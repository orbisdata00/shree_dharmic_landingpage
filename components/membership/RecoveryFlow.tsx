"use client";

import { useState, type FormEvent } from "react";
import { ApiError, api, friendlyError, type Registration, type Session } from "@/lib/membershipApi";
import OtpForm, { useCountdown } from "./OtpForm";

type Props = {
  initialMobile?: string;
  onRecovered: (r: Registration, s: Session) => void;
  onCancel: () => void;
};

/** Resume an application (or regain access to documents) on any device, via an SMS code. */
export default function RecoveryFlow({ initialMobile = "", onRecovered, onCancel }: Props) {
  const [mobile, setMobile] = useState(initialMobile);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const countdown = useCountdown();

  const request = async () => {
    setSending(true);
    setError(null);
    setOtpError(null);
    try {
      const res = await api.recoveryRequest(mobile.trim());
      setChallenge(res.challenge_id);
      setDevOtp(res.dev_otp);
      // The backend answers the same way whether or not the number is registered.
      setInfo(res.message);
      countdown.start(res.resend_after_seconds);
    } catch (err) {
      const msg = err instanceof ApiError && err.code === "VALIDATION_ERROR"
        ? (err.fieldErrors.mobile ?? "Please enter a valid mobile number.")
        : friendlyError(err);
      if (err instanceof ApiError && err.code === "OTP_COOLDOWN") countdown.start(err.retryAfterSeconds ?? 60);
      if (challenge) setOtpError(msg); else setError(msg);
    } finally {
      setSending(false);
    }
  };

  const onSubmitMobile = (e: FormEvent) => {
    e.preventDefault();
    if (!/^(\+|00)?\d{10,15}$/.test(mobile.replace(/[\s()-]/g, ""))) { setError("Please enter a valid 10-digit mobile number."); return; }
    request();
  };

  const verify = async (otp: string) => {
    setOtpError(null);
    setInfo(null);
    try {
      const res = await api.recoveryVerify(challenge!, otp);
      onRecovered(res.registration, res.session);
    } catch (err) {
      setOtpError(friendlyError(err));
    }
  };

  if (challenge) {
    return (
      <OtpForm
        destination={mobile.trim()}
        onVerify={verify}
        onResend={request}
        resendIn={countdown.left}
        sending={sending}
        devOtp={devOtp}
        error={otpError}
        info={info}
        secondaryAction={<button type="button" className="link-btn" onClick={() => { setChallenge(null); setInfo(null); }}>Use another number</button>}
      />
    );
  }

  return (
    <form className="step-form" onSubmit={onSubmitMobile} noValidate>
      <header className="step-head">
        <h2>Continue your application</h2>
        <p>Enter the mobile number you applied with. We&apos;ll send a one-time code so you can resume your application or download your documents.</p>
      </header>

      <div className={`field${error ? " has-error" : ""}`}>
        <label htmlFor="recover-mobile">Mobile number</label>
        <div className="input-prefix">
          <span aria-hidden="true">+91</span>
          <input id="recover-mobile" type="tel" inputMode="tel" autoComplete="tel-national" value={mobile}
            onChange={(e) => { setMobile(e.target.value); setError(null); }} maxLength={20} placeholder="98765 43210"
            aria-invalid={!!error} aria-describedby={error ? "recover-mobile-error" : undefined} autoFocus />
        </div>
        {error && <p className="field__error" id="recover-mobile-error" role="alert">{error}</p>}
      </div>

      <div className="step-actions">
        <button type="button" className="btn btn--outline" onClick={onCancel} disabled={sending}>Start a new application</button>
        <button type="submit" className="btn btn--primary" disabled={sending || countdown.left > 0}>
          {sending ? <><span className="spinner spinner--light" /> Sending…</> : countdown.left > 0 ? `Try again in ${countdown.left}s` : <>Send code <span className="arrow">→</span></>}
        </button>
      </div>
    </form>
  );
}
