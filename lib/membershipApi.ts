/**
 * Client for the Shree Dharmic Leela membership backend (/api/v1).
 * See backend-shree-dharmic/docs/API.md for the full contract.
 *
 * The browser calls the API directly (not through a Next.js proxy): the backend rate-limits
 * per client IP, so proxying would make every visitor share one limit. The site's origin
 * must therefore be listed in the backend's CORS_ALLOWED_ORIGINS.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_MEMBERSHIP_API_URL || "http://localhost:8100").replace(/\/+$/, "");

/* ---------- Types (mirror the backend schemas) ---------- */

export type Statuses = {
  registration: "pending" | "completed" | "cancelled" | string;
  mobile_verification: "unverified" | "verified" | string;
  email_verification: "unverified" | "verified" | string;
  membership: "inactive" | "active" | string;
  payment: "not_started" | "pending" | "paid" | "failed" | string;
};

export type Registration = {
  registration_ref: string;
  full_name: string;
  mobile: string;
  email: string;
  statuses: Statuses;
  membership_id: string | null;
  membership_activated_at: string | null;
  mobile_verified_at: string | null;
  created_at: string;
};

export type Session = { token: string; expires_at: string };

export type Fee = { amount_paise: number; amount: string; currency: string; effective_from: string };

export type OtpSent = {
  message: string;
  expires_in_seconds?: number;
  resend_after_seconds: number;
  dev_otp: string | null;
};

export type RecoveryChallenge = OtpSent & { challenge_id: string };

export type PaymentOrder = {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  notes: Record<string, string>;
  reused: boolean;
  payment_env: "test" | "live" | string;
};

export type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type PaymentStatus = {
  payment_status: "not_started" | "pending" | "paid" | "failed" | string;
  membership_status: "inactive" | "active" | string;
  membership_id: string | null;
  latest_attempt_status: string | null;
  latest_order_status: string | null;
  pending_reason: "awaiting_capture" | "awaiting_mobile_verification" | "provider_unreachable" | "awaiting_payment" | null | string;
  documents_ready: boolean;
};

export type MemberDocument = {
  id: string;
  document_type: "receipt" | "membership_letter" | string;
  version: number;
  is_current: boolean;
  status: "pending" | "generated" | "failed" | string;
  filename: string;
  size_bytes: number | null;
  generated_at: string | null;
  error: string | null;
  created_at: string;
};

export type RegistrationInput = {
  full_name: string;
  mobile: string;
  email: string;
  whatsapp_consent?: boolean;
};

/* ---------- Errors ---------- */

export type FieldError = { field: string; message: string; type?: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: unknown = null,
    public requestId: string | null = null
  ) {
    super(message);
  }

  /** Validation errors keyed by field, with pydantic's "Value error, " prefix removed. */
  get fieldErrors(): Record<string, string> {
    if (this.code !== "VALIDATION_ERROR" || !Array.isArray(this.details)) return {};
    const out: Record<string, string> = {};
    for (const d of this.details as FieldError[]) {
      const field = d.field.split(".").pop() || d.field;
      out[field] ??= d.message.replace(/^Value error,\s*/i, "");
    }
    return out;
  }

  get retryAfterSeconds(): number | null {
    const d = this.details as { retry_after_seconds?: number } | null;
    return typeof d?.retry_after_seconds === "number" ? d.retry_after_seconds : null;
  }

  get attemptsRemaining(): number | null {
    const d = this.details as { attempts_remaining?: number } | null;
    return typeof d?.attempts_remaining === "number" ? d.attempts_remaining : null;
  }
}

/** Thrown when the API can't be reached at all (offline, server down, CORS rejected). */
export class NetworkError extends Error {
  constructor() {
    super("We couldn't reach the membership server. Please check your connection and try again.");
  }
}

/* ---------- Request helper ---------- */

async function request<T>(path: string, init: RequestInit & { token?: string | null; json?: unknown } = {}): Promise<T> {
  const { token, json, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (json !== undefined) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1${path}`, {
      ...rest,
      headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      cache: "no-store",
    });
  } catch {
    throw new NetworkError();
  }

  if (res.ok) return (res.status === 204 ? undefined : await res.json()) as T;

  let body: { error?: { code?: string; message?: string; details?: unknown; request_id?: string } } = {};
  try { body = await res.json(); } catch { /* non-JSON error body */ }
  const e = body.error ?? {};
  throw new ApiError(res.status, e.code ?? `HTTP_${res.status}`, e.message ?? "Something went wrong. Please try again.", e.details ?? null, e.request_id ?? null);
}

/* ---------- Endpoints ---------- */

export const api = {
  fee: () => request<Fee>("/membership-fee"),

  register: (input: RegistrationInput) =>
    request<{ registration: Registration; session: Session; next_step: string }>("/registrations", { method: "POST", json: input }),
  me: (token: string) => request<Registration>("/registrations/me", { token }),
  updateMe: (token: string, changes: Partial<RegistrationInput>) =>
    request<Registration>("/registrations/me", { method: "PATCH", token, json: changes }),
  logout: (token: string) => request<{ message: string }>("/registrations/me/logout", { method: "POST", token }),

  requestOtp: (token: string) => request<OtpSent>("/registrations/me/otp/request", { method: "POST", token }),
  resendOtp: (token: string) => request<OtpSent>("/registrations/me/otp/resend", { method: "POST", token }),
  verifyOtp: (token: string, otp: string) =>
    request<Registration>("/registrations/me/otp/verify", { method: "POST", token, json: { otp } }),

  recoveryRequest: (mobile: string) =>
    request<RecoveryChallenge>("/registrations/recovery/request", { method: "POST", json: { mobile } }),
  recoveryVerify: (challenge_id: string, otp: string) =>
    request<{ registration: Registration; session: Session }>("/registrations/recovery/verify", { method: "POST", json: { challenge_id, otp } }),

  createOrder: (token: string) => request<PaymentOrder>("/registrations/me/payment-orders", { method: "POST", token }),
  verifyPayment: (token: string, resp: CheckoutResponse) =>
    request<PaymentStatus>("/registrations/me/payments/verify", { method: "POST", token, json: resp }),
  paymentStatus: (token: string) => request<PaymentStatus>("/registrations/me/payment-status", { token }),

  documents: (token: string) => request<MemberDocument[]>("/registrations/me/documents", { token }),

  /** Downloads a document with the session token and saves it via a temporary object URL. */
  async downloadDocument(token: string, doc: MemberDocument) {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/v1/registrations/me/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      throw new NetworkError();
    }
    if (!res.ok) {
      let e: { code?: string; message?: string } = {};
      try { e = (await res.json()).error ?? {}; } catch { /* ignore */ }
      throw new ApiError(res.status, e.code ?? `HTTP_${res.status}`, e.message ?? "Download failed");
    }
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },
};

/* ---------- Session persistence (this device only) ---------- */

const SESSION_KEY = "sdl_membership_session";

export const sessionStore = {
  load(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      if (!s.token || new Date(s.expires_at).getTime() <= Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  },
  save(s: Session) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* storage unavailable: session lasts for this page only */ }
  },
  clear() {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  },
};

/* ---------- Friendly messages for backend error codes ---------- */

const MESSAGES: Record<string, string> = {
  REGISTRATION_EXISTS: "An application already exists for this mobile number. Continue it with a one-time code instead.",
  MOBILE_ALREADY_REGISTERED: "This mobile number is already used by another application.",
  REGISTRATION_LOCKED: "Your details can't be changed after payment. Please contact the committee for corrections.",
  REGISTRATION_SESSION_INVALID: "Your session has expired. Continue your application with your mobile number.",
  REGISTRATION_SESSION_REQUIRED: "Your session has expired. Continue your application with your mobile number.",
  REGISTRATION_CANCELLED: "This application has been cancelled. Please contact the committee.",
  OTP_INCORRECT: "That code isn't correct.",
  OTP_EXPIRED: "This code has expired. Please request a new one.",
  OTP_INVALID: "This code is no longer valid. Please request a new one.",
  OTP_ALREADY_USED: "This code has already been used. Please request a new one.",
  OTP_ATTEMPTS_EXCEEDED: "Too many incorrect attempts. Please request a new code.",
  OTP_SEND_LIMIT: "Too many codes requested. Please try again later.",
  OTP_COOLDOWN: "A code was sent recently. Please wait before requesting another.",
  OTP_NOT_REQUESTED: "Please request a code first.",
  SMS_SEND_FAILED: "We couldn't send the SMS right now. Please try again in a moment.",
  RATE_LIMITED: "Too many attempts. Please wait a little and try again.",
  MOBILE_NOT_VERIFIED: "Please verify your mobile number before paying.",
  MEMBERSHIP_ALREADY_ACTIVE: "Your membership is already active.",
  PAYMENT_ALREADY_CAPTURED: "Your payment has already been received.",
  FEE_NOT_CONFIGURED: "Online membership isn't open yet. Please check back soon.",
  PAYMENT_NOT_CONFIGURED: "Online payment isn't available right now. Please try again later or contact the committee.",
  PAYMENT_PROVIDER_TIMEOUT: "The payment service is slow to respond. Please try again.",
  ORDER_CREATION_PENDING: "Your payment is being set up. Please try again in a few seconds.",
  PAYMENT_PROVIDER_ERROR: "The payment service returned an error. Please try again.",
  INVALID_SIGNATURE: "We couldn't confirm this payment. If money was deducted, it will be confirmed automatically.",
  DOCUMENT_NOT_READY: "This document is still being prepared.",
  PROVIDER_UNAVAILABLE: "A service we depend on is unavailable. Please try again shortly.",
  INTERNAL_ERROR: "Something went wrong on our side. Please try again.",
};

export function friendlyError(err: unknown): string {
  if (err instanceof NetworkError) return err.message;
  if (err instanceof ApiError) {
    if (err.code === "OTP_INCORRECT" && err.attemptsRemaining !== null) {
      return `That code isn't correct. ${err.attemptsRemaining} attempt${err.attemptsRemaining === 1 ? "" : "s"} left.`;
    }
    const wait = err.retryAfterSeconds;
    if (wait && ["OTP_COOLDOWN", "RATE_LIMITED", "OTP_SEND_LIMIT"].includes(err.code)) {
      const when = wait < 90 ? `${wait} seconds` : `about ${Math.round(wait / 60)} minutes`;
      return `${MESSAGES[err.code].replace(/\s*Please.*$/, "")} Please try again in ${when}.`;
    }
    return MESSAGES[err.code] ?? err.message;
  }
  return "Something went wrong. Please try again.";
}

/* ---------- Formatting ---------- */

export const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(paise / 100);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date(iso));

/** "+919876543210" → "+91 98765 43210" */
export const formatMobile = (e164: string) => {
  const m = e164.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
};
