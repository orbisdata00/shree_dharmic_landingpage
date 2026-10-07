/**
 * Public donation endpoints of the committee backend (/api/v1/donations).
 * Errors are the same ApiError / NetworkError as the membership client; show them with friendlyError().
 */

import { API_BASE, request, type CheckoutResponse } from "./membershipApi";

export type DonationSettings = { min_amount_paise: number; max_amount_paise: number; currency: string };

export type DonationOrder = {
  donation_ref: string;
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name?: string };
  notes: Record<string, string>;
  payment_env: "test" | "live" | string;
};

export type Donation = {
  donation_ref: string;
  status: "not_created" | "created" | "authorized" | "paid" | "failed" | string;
  amount_paise: number;
  currency: string;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  /** Set once paid; the receipt PDF is then available at receiptUrl(). */
  receipt_number: string | null;
  pending_reason: "awaiting_capture" | "awaiting_payment" | "provider_unreachable" | null | string;
};

export const donationApi = {
  settings: () => request<DonationSettings>("/donations/settings"),
  createOrder: (amount_paise: number, donor_name: string) =>
    request<DonationOrder>("/donations/orders", { method: "POST", json: { amount_paise, donor_name } }),
  verify: (resp: CheckoutResponse) => request<Donation>("/donations/verify", { method: "POST", json: resp }),
  status: (ref: string) => request<Donation>(`/donations/${encodeURIComponent(ref)}`),
};

/** Direct link to a paid donation's receipt PDF (served as an attachment). */
export const receiptUrl = (ref: string) => `${API_BASE}/api/v1/donations/${encodeURIComponent(ref)}/receipt`;
