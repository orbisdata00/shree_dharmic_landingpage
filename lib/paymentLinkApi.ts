/**
 * Public payment-link endpoints of the committee backend (/api/v1/payment-links), used by /pay.
 * Links are generated in the admin portal and are reusable: every payment is its own Razorpay order,
 * identified by an order reference (PLO-…) that only that payer gets. Errors are the same ApiError /
 * NetworkError as the membership client; show them with friendlyError().
 */

import { API_BASE, request, type CheckoutResponse } from "./membershipApi";

export type PaymentLink = {
  link_ref: string;
  link_type: "fixed" | "custom";
  /** Only "active" links accept payments. */
  status: "active" | "inactive" | "expired" | "not_created" | string;
  description: string;
  /** Prefill for the payer's name. */
  customer_name: string | null;
  /** Fixed links: the amount of every payment. Custom links: null (the payer enters it). */
  amount_paise: number | null;
  currency: string;
  min_amount_paise: number | null;
  max_amount_paise: number | null;
  expire_by: string | null;
  payment_env: "test" | "live" | string;
};

export type PaymentLinkCheckout = {
  link_ref: string;
  order_ref: string;
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

/** One payer's payment through a link. */
export type LinkPayment = {
  order_ref: string;
  link_ref: string;
  description: string;
  status: "created" | "authorized" | "paid" | "failed" | string;
  amount_paise: number;
  currency: string;
  payer_name: string | null;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  /** Set once paid; the receipt PDF is then available at receiptUrl(). */
  receipt_number: string | null;
  error_description: string | null;
  pending_reason: "awaiting_capture" | "awaiting_payment" | null | string;
  payment_env: "test" | "live" | string;
};

/** Query parameters Razorpay adds when it returns a payer from a legacy link's rzp.io page. */
export type LinkCallback = {
  razorpay_payment_id: string;
  razorpay_payment_link_id: string;
  razorpay_payment_link_reference_id: string;
  razorpay_payment_link_status: string;
  razorpay_signature: string;
};

const path = (ref: string) => `/payment-links/${encodeURIComponent(ref)}`;
const orderPath = (orderRef: string) => `/payment-links/orders/${encodeURIComponent(orderRef)}`;

export const paymentLinkApi = {
  get: (ref: string) => request<PaymentLink>(path(ref)),
  /** `amount_paise` only for custom links; fixed links always charge the link's amount. */
  createOrder: (ref: string, payer_name: string, amount_paise: number | null) =>
    request<PaymentLinkCheckout>(`${path(ref)}/orders`, {
      method: "POST",
      json: amount_paise === null ? { payer_name } : { payer_name, amount_paise },
    }),
  verify: (resp: CheckoutResponse) => request<LinkPayment>("/payment-links/verify", { method: "POST", json: resp }),
  payment: (orderRef: string) => request<LinkPayment>(orderPath(orderRef)),
  callback: (ref: string, cb: LinkCallback) => request<LinkPayment>(`${path(ref)}/callback`, { method: "POST", json: cb }),
};

/** Direct link to a paid payment's receipt PDF (served as an attachment). */
export const receiptUrl = (orderRef: string) => `${API_BASE}/api/v1${orderPath(orderRef)}/receipt`;

/** Well-formed references, so malformed URLs never reach the API. */
export const isLinkRef = (ref: string | null): ref is string => !!ref && /^PL-[A-Z0-9]{10}$/.test(ref);
export const isOrderRef = (ref: string | null): ref is string => !!ref && /^PLO-[A-Z0-9]{10}$/.test(ref);
