"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, api, formatMobile, friendlyError, type Registration } from "@/lib/membershipApi";
import OtpForm, { useCountdown } from "./OtpForm";

type Props = {
  registration: Registration;
  token: string;
  onVerified: (r: Registration) => void;
  onChangeNumber: () => void;
  onAuthError: (err: unknown) => boolean;
};

/** Mobile verification for a new application: sends the code automatically, then verifies it. */
export default function RegistrationOtp({ registration, token, onVerified, onChangeNumber, onAuthError }: Props) {
  const [sending, setSending] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const countdown = useCountdown();
  const requestedFor = useRef<string | null>(null);

  const send = async (kind: "request" | "resend") => {
    setSending(true);
    setError(null);
    try {
      const res = kind === "request" ? await api.requestOtp(token) : await api.resendOtp(token);
      setDevOtp(res.dev_otp);
      setInfo(kind === "resend" ? "A new code has been sent." : null);
      countdown.start(res.resend_after_seconds);
    } catch (err) {
      if (onAuthError(err)) return;
      if (err instanceof ApiError && err.code === "OTP_COOLDOWN") {
        // A code was sent moments ago (e.g. on a previous visit) — it's still valid.
        setInfo("A code was sent recently. Enter it below, or wait to request a new one.");
        countdown.start(err.retryAfterSeconds ?? 60);
      } else if (err instanceof ApiError && err.code === "OTP_NOT_REQUESTED") {
        return send("request");
      } else if (err instanceof ApiError && err.code === "MOBILE_ALREADY_VERIFIED") {
        try { onVerified(await api.me(token)); } catch (e) { onAuthError(e); }
      } else {
        setError(friendlyError(err));
      }
    } finally {
      setSending(false);
    }
  };

  // Send the first code once per mobile number (guards against double effects in development)
  useEffect(() => {
    if (requestedFor.current === registration.mobile) return;
    requestedFor.current = registration.mobile;
    send("request");
  }, [registration.mobile]);

  const verify = async (otp: string) => {
    setError(null);
    setInfo(null);
    try {
      onVerified(await api.verifyOtp(token, otp));
    } catch (err) {
      if (onAuthError(err)) return;
      if (err instanceof ApiError && err.code === "MOBILE_ALREADY_VERIFIED") {
        try { onVerified(await api.me(token)); } catch (e) { onAuthError(e); }
        return;
      }
      setError(friendlyError(err));
    }
  };

  return (
    <OtpForm
      destination={formatMobile(registration.mobile)}
      onVerify={verify}
      onResend={() => send("resend")}
      resendIn={countdown.left}
      sending={sending}
      devOtp={devOtp}
      error={error}
      info={info}
      secondaryAction={<button type="button" className="link-btn" onClick={onChangeNumber}>Change number</button>}
    />
  );
}
