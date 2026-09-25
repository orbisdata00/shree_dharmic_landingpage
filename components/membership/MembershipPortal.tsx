"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError, api, formatINR, sessionStore,
  type Fee, type Registration, type Session,
} from "@/lib/membershipApi";
import DetailsForm from "./DetailsForm";
import RegistrationOtp from "./RegistrationOtp";
import RecoveryFlow from "./RecoveryFlow";
import PaymentStep from "./PaymentStep";
import SuccessStep from "./SuccessStep";

type Mode = "apply" | "recover" | "edit";
type Step = "loading" | "details" | "recover" | "otp" | "payment" | "success";

const STEPS = [
  { key: "details", label: "Your details" },
  { key: "otp", label: "Verify mobile" },
  { key: "payment", label: "Payment" },
  { key: "success", label: "Membership" },
] as const;

const SESSION_CODES = new Set(["REGISTRATION_SESSION_INVALID", "REGISTRATION_SESSION_REQUIRED"]);

export default function MembershipPortal() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [reg, setReg] = useState<Registration | null>(null);
  const [mode, setMode] = useState<Mode>("apply");
  const [notice, setNotice] = useState<string | null>(null);
  const [recoverMobile, setRecoverMobile] = useState("");
  const [fee, setFee] = useState<Fee | null>(null);
  const [feeError, setFeeError] = useState(false);

  const token = session?.token ?? null;

  /** Session is gone or expired on the server: forget it and offer recovery. */
  const expireSession = useCallback((message = "Your session has expired. Continue your application with your mobile number.") => {
    sessionStore.clear();
    setSession(null);
    setReg(null);
    setMode("recover");
    setNotice(message);
  }, []);

  /** Returns true if the error was a lost session (already handled). */
  const handleAuthError = useCallback((err: unknown) => {
    if (err instanceof ApiError && SESSION_CODES.has(err.code)) { expireSession(); return true; }
    return false;
  }, [expireSession]);

  // Restore a saved session on this device
  useEffect(() => {
    let cancelled = false;
    const saved = sessionStore.load();
    if (!saved) { setReady(true); return; }
    api.me(saved.token)
      .then((r) => { if (!cancelled) { setSession(saved); setReg(r); } })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && SESSION_CODES.has(err.code)) { sessionStore.clear(); }
        else { setSession(saved); setNotice("We couldn't load your application right now. Please refresh the page."); }
      })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    api.fee().then(setFee).catch(() => setFeeError(true));
  }, []);

  const startSession = (s: Session, r: Registration) => {
    sessionStore.save(s);
    setSession(s);
    setReg(r);
    setMode("apply");
    setNotice(null);
  };

  const refreshRegistration = useCallback(async () => {
    if (!token) return;
    try { setReg(await api.me(token)); } catch (err) { handleAuthError(err); }
  }, [token, handleAuthError]);

  const signOut = async () => {
    if (token) { try { await api.logout(token); } catch { /* the session is dropped locally either way */ } }
    sessionStore.clear();
    setSession(null);
    setReg(null);
    setMode("apply");
    setNotice("You've signed out on this device.");
  };

  const step: Step = !ready ? "loading"
    : !reg ? (mode === "recover" ? "recover" : "details")
    : reg.statuses.membership === "active" ? "success"
    : mode === "edit" ? "details"
    : reg.statuses.mobile_verification !== "verified" ? "otp"
    : "payment";

  const stepIndex = step === "recover" || step === "loading" ? 0 : STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mship-grid">
      <div className="portal" aria-live="polite">
        <ol className="stepper" aria-label="Application progress">
          {STEPS.map((s, i) => (
            <li key={s.key} className={i < stepIndex ? "is-done" : i === stepIndex ? "is-current" : undefined} aria-current={i === stepIndex ? "step" : undefined}>
              <span className="stepper__dot">{i < stepIndex ? <CheckIcon /> : i + 1}</span>
              <span className="stepper__label">{s.label}</span>
            </li>
          ))}
        </ol>

        {notice && (
          <div className="portal__notice" role="status">
            <span>{notice}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setNotice(null)}>×</button>
          </div>
        )}

        {reg && step !== "success" && (
          <p className="portal__signed-in">
            Application <strong>{reg.registration_ref}</strong> · {reg.full_name}
            <button type="button" className="link-btn" onClick={signOut}>Not you? Sign out</button>
          </p>
        )}

        <div className="portal__body" key={step}>
          {step === "loading" && <div className="portal__loading"><span className="spinner" /> Loading your application…</div>}

          {step === "details" && !reg && (
            <DetailsForm
              mode="create"
              onCreated={(r, s) => startSession(s, r)}
              onRecover={(mobile) => { setRecoverMobile(mobile); setMode("recover"); setNotice(null); }}
            />
          )}

          {step === "details" && reg && token && (
            <DetailsForm
              mode="edit"
              registration={reg}
              token={token}
              onUpdated={(r) => { setReg(r); setMode("apply"); }}
              onCancel={() => setMode("apply")}
              onAuthError={handleAuthError}
            />
          )}

          {step === "recover" && (
            <RecoveryFlow
              initialMobile={recoverMobile}
              onRecovered={(r, s) => startSession(s, r)}
              onCancel={() => { setMode("apply"); setNotice(null); }}
            />
          )}

          {step === "otp" && reg && token && (
            <RegistrationOtp
              registration={reg}
              token={token}
              onVerified={setReg}
              onChangeNumber={() => setMode("edit")}
              onAuthError={handleAuthError}
            />
          )}

          {step === "payment" && reg && token && (
            <PaymentStep
              registration={reg}
              token={token}
              fee={fee}
              onActivated={refreshRegistration}
              onEdit={() => setMode("edit")}
              onNeedsVerification={refreshRegistration}
              onAuthError={handleAuthError}
            />
          )}

          {step === "success" && reg && token && (
            <SuccessStep registration={reg} token={token} onSignOut={signOut} onAuthError={handleAuthError} />
          )}
        </div>

        {step === "details" && !reg && (
          <p className="portal__switch">
            Already applied or paid?{" "}
            <button type="button" className="link-btn" onClick={() => { setMode("recover"); setNotice(null); }}>
              Continue with your mobile number
            </button>
          </p>
        )}
      </div>

      <aside className="mship-aside">
        <div className="fee-card">
          <span className="fee-card__label">Membership fee</span>
          <strong className="fee-card__amount">
            {fee ? formatINR(fee.amount_paise) : feeError ? "—" : <span className="skeleton" />}
          </strong>
          <span className="fee-card__note">Paid securely online via Razorpay</span>
        </div>

        <div className="aside-card">
          <h3>How it works</h3>
          <ol className="how-list">
            <li><strong>Share your details</strong><span>Name, mobile number and email.</span></li>
            <li><strong>Verify your mobile</strong><span>Enter the one-time code we send by SMS.</span></li>
            <li><strong>Pay the fee</strong><span>Pay securely online through Razorpay.</span></li>
            <li><strong>Receive your membership</strong><span>Your membership ID, receipt and membership letter.</span></li>
          </ol>
        </div>

        <div className="aside-card aside-card--soft">
          <h3>Lost your session?</h3>
          <p>You can always come back: choose <em>Continue with your mobile number</em> to resume an application or download your receipt and letter again.</p>
        </div>
      </aside>
    </div>
  );
}

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
}
