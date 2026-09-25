"use client";

import { useState, type FormEvent } from "react";
import {
  ApiError, api, friendlyError,
  type Registration, type RegistrationInput, type Session,
} from "@/lib/membershipApi";

// Wording recorded by the backend with the consent (settings key `whatsapp_consent_text`, default value).
const WHATSAPP_CONSENT_TEXT = "I agree to receive my membership receipt and letter on WhatsApp.";

type Props =
  | { mode: "create"; onCreated: (r: Registration, s: Session) => void; onRecover: (mobile: string) => void }
  | {
      mode: "edit"; registration: Registration; token: string;
      onUpdated: (r: Registration) => void; onCancel: () => void; onAuthError: (err: unknown) => boolean;
    };

type Fields = { full_name: string; mobile: string; email: string };

/** Client-side checks mirroring the backend rules, so obvious mistakes are caught before a request. */
function validate(v: Fields): Partial<Fields> {
  const e: Partial<Fields> = {};
  const name = v.full_name.trim();
  if (name.length < 2) e.full_name = "Please enter your full name.";
  else if (name.length > 120) e.full_name = "Full name must be at most 120 characters.";
  else if (!/\p{L}/u.test(name)) e.full_name = "Full name must contain letters.";
  else if (/[<>{}[\]\\=@#$%^*|~`]/.test(name)) e.full_name = "Full name contains unsupported characters.";

  const digits = v.mobile.replace(/[\s()-]/g, "");
  if (!digits) e.mobile = "Please enter your mobile number.";
  else if (!/^(\+|00)?\d{10,15}$/.test(digits)) e.mobile = "Please enter a valid 10-digit mobile number.";

  if (!v.email.trim()) e.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Please enter a valid email address.";
  return e;
}

/** "+919876543210" → "98765 43210" for editing */
const localMobile = (e164: string) => e164.replace(/^\+91(\d{5})(\d{5})$/, "$1 $2");

export default function DetailsForm(props: Props) {
  const editing = props.mode === "edit";
  const initial = editing
    ? { full_name: props.registration.full_name, mobile: localMobile(props.registration.mobile), email: props.registration.email }
    : { full_name: "", mobile: "", email: "" };

  const [values, setValues] = useState<Fields>(initial);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [existsFor, setExistsFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setExistsFor(null);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      if (props.mode === "create") {
        const input: RegistrationInput = {
          full_name: values.full_name.trim(), mobile: values.mobile.trim(), email: values.email.trim(), whatsapp_consent: consent,
        };
        const res = await api.register(input);
        props.onCreated(res.registration, res.session);
      } else {
        // Send only what changed; changing the mobile number resets verification on the server.
        const changes: Partial<RegistrationInput> = {};
        if (values.full_name.trim() !== props.registration.full_name) changes.full_name = values.full_name.trim();
        if (values.mobile.replace(/\s/g, "") !== localMobile(props.registration.mobile).replace(/\s/g, "")) changes.mobile = values.mobile.trim();
        if (values.email.trim().toLowerCase() !== props.registration.email) changes.email = values.email.trim();
        if (!Object.keys(changes).length) { props.onCancel(); return; }
        props.onUpdated(await api.updateMe(props.token, changes));
      }
    } catch (err) {
      if (props.mode === "edit" && props.onAuthError(err)) return;
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR") {
        setErrors(err.fieldErrors as Partial<Fields>);
        setFormError("Please correct the highlighted fields.");
      } else if (err instanceof ApiError && err.code === "REGISTRATION_EXISTS") {
        setExistsFor(values.mobile.trim());
      } else if (err instanceof ApiError && err.code === "MOBILE_ALREADY_REGISTERED") {
        setErrors({ mobile: friendlyError(err) });
      } else {
        setFormError(friendlyError(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="step-form" onSubmit={onSubmit} noValidate>
      <header className="step-head">
        <h2>{editing ? "Edit your details" : "Apply for membership"}</h2>
        <p>{editing
          ? "Update your details before paying. Changing your mobile number means verifying it again."
          : "Tell us a little about yourself. We'll send a one-time code to verify your mobile number."}</p>
      </header>

      {formError && <p className="form-error" role="alert">{formError}</p>}

      {existsFor && props.mode === "create" && (
        <div className="form-callout" role="alert">
          <p>An application already exists for this mobile number. You can continue it with a one-time code.</p>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => props.onRecover(existsFor)}>
            Continue my application
          </button>
        </div>
      )}

      <Field id="full_name" label="Full name" error={errors.full_name}>
        <input id="full_name" name="full_name" autoComplete="name" value={values.full_name} onChange={set("full_name")}
          maxLength={120} placeholder="e.g. Asha Sharma" aria-invalid={!!errors.full_name} aria-describedby={errors.full_name ? "full_name-error" : undefined} />
      </Field>

      <Field id="mobile" label="Mobile number" error={errors.mobile} hint="We'll send a verification code to this number.">
        <div className="input-prefix">
          <span aria-hidden="true">+91</span>
          <input id="mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel-national" value={values.mobile} onChange={set("mobile")}
            maxLength={20} placeholder="98765 43210" aria-invalid={!!errors.mobile} aria-describedby={errors.mobile ? "mobile-error" : "mobile-hint"} />
        </div>
      </Field>

      <Field id="email" label="Email address" error={errors.email} hint="Your receipt and membership letter will be sent here.">
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set("email")}
          maxLength={254} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : "email-hint"} />
      </Field>

      {!editing && (
        <label className="check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span className="check__box" aria-hidden="true" />
          <span>{WHATSAPP_CONSENT_TEXT} <em>(optional)</em></span>
        </label>
      )}

      <div className="step-actions">
        {editing && <button type="button" className="btn btn--outline" onClick={props.onCancel} disabled={busy}>Cancel</button>}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? <><span className="spinner spinner--light" /> {editing ? "Saving…" : "Submitting…"}</> : editing ? "Save changes" : <>Continue <span className="arrow">→</span></>}
        </button>
      </div>
    </form>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="field__error" id={`${id}-error`}>{error}</p> : hint ? <p className="field__hint" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}
