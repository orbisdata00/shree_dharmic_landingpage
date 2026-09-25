import type { CheckoutResponse, PaymentOrder } from "./membershipApi";

/** Minimal typing for Razorpay Checkout (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/). */
type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: PaymentOrder["prefill"];
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (resp: CheckoutResponse) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
};
type RazorpayFailure = { error?: { description?: string; reason?: string } };
type RazorpayInstance = { open: () => void; on: (event: "payment.failed", cb: (resp: RazorpayFailure) => void) => void };
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window { Razorpay?: RazorpayConstructor }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<RazorpayConstructor> | null = null;

/** Loads checkout.js once. Resolves with the Razorpay constructor. */
export function loadCheckout(): Promise<RazorpayConstructor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = CHECKOUT_SRC;
    s.async = true;
    s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay unavailable")));
    s.onerror = () => { loading = null; s.remove(); reject(new Error("Could not load Razorpay Checkout")); };
    document.head.appendChild(s);
  });
  return loading;
}

export type CheckoutOutcome =
  | { kind: "completed"; response: CheckoutResponse }
  | { kind: "failed"; message: string }
  | { kind: "dismissed" };

/**
 * Opens Checkout for a backend-created order and resolves once the visitor pays, a payment
 * attempt fails, or the window is closed. The caller must still confirm with the backend:
 * the Checkout handler alone never means the membership is active.
 */
export async function openCheckout(order: PaymentOrder): Promise<CheckoutOutcome> {
  const Razorpay = await loadCheckout();
  return new Promise((resolve) => {
    let failure: string | null = null;
    const rzp = new Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      prefill: order.prefill,
      notes: order.notes,
      theme: { color: "#D97706" },
      handler: (response) => resolve({ kind: "completed", response }),
      modal: {
        confirm_close: true,
        // Checkout stays open after a failed attempt so the visitor can retry; report the failure on close.
        ondismiss: () => resolve(failure ? { kind: "failed", message: failure } : { kind: "dismissed" }),
      },
    });
    rzp.on("payment.failed", (resp) => {
      failure = resp.error?.description || "The payment didn't go through.";
    });
    rzp.open();
  });
}
