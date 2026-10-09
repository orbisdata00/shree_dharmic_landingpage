/**
 * Public payment-link endpoints of the committee backend (/api/v1/payment-links), used by /pay.
 * Links are generated in the admin portal. Errors are the same ApiError / NetworkError as the
 * membership client; show them with friendlyError().
 */

import { API_BASE, request, type CheckoutResponse } from "./membershipApi";

export type PaymentLinkStatus = "not_created" | "active" | "failed" | "authorized" | "paid" | "cancelled" | "expired";

export type PaymentLink = {
  link_ref: string;
  link_type: "fixed" | "custom";
  status: PaymentLinkStatus | string;
  description: string;
  customer_name: string | null;
  /** Fixed links: the amount due. Custom links: null (the payer enters it). */
  amount_paise: number | null;
  amount_paid_paise: number | null;
  currency: string;
  min_amount_paise: number | null;
  max_amount_paise: number | null;
  /** Fixed links while payable: Razorpay's payment page. */
  pay_url: string | null;
  expire_by: string | null;
  paid_at: string | null;
  razorpay_payment_id: string | null;
  /** Set once paid; the receipt PDF is then available at receiptUrl(). */
  receipt_number: string | null;
  error_description: string | null;
  pending_reason: "awaiting_capture" | "awaiting_payment" | null | string;
  payment_env: "test" | "live" | string;
};

export type PaymentLinkOrder = {
  link_ref: string;
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  notes: Record<string, string>;
  payment_env: "test" | "live" | string;
};

/** Query parameters Razorpay adds when it returns the payer from a fixed link's payment page. */
export type LinkCallback = {
  razorpay_payment_id: string;
  razorpay_payment_link_id: string;
  razorpay_payment_link_reference_id: string;
  razorpay_payment_link_status: string;
  razorpay_signature: string;
};

const path = (ref: string) => `/payment-links/${encodeURIComponent(ref)}`;

export const paymentLinkApi = {
  get: (ref: string) => request<PaymentLink>(path(ref)),
  createOrder: (ref: string, amount_paise: number) =>
    request<PaymentLinkOrder>(`${path(ref)}/orders`, { method: "POST", json: { amount_paise } }),
  verify: (resp: CheckoutResponse) => request<PaymentLink>("/payment-links/verify", { method: "POST", json: resp }),
  callback: (ref: string, cb: LinkCallback) => request<PaymentLink>(`${path(ref)}/callback`, { method: "POST", json: cb }),
};

/** A well-formed link reference (PL- and 10 characters), so malformed URLs never reach the API. */
export const isLinkRef = (ref: string | null): ref is string => !!ref && /^PL-[A-Z0-9]{10}$/.test(ref);

/** Direct link to a paid link's receipt PDF (served as an attachment). */
export const receiptUrl = (ref: string) => `${API_BASE}/api/v1${path(ref)}/receipt`;
