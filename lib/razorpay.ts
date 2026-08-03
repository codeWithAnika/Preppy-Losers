declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  config?: {
    display?: {
      blocks?: Record<string, { name: string; instruments: Array<{ method: string }> }>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
  on: (
    event: string,
    handler: (response: {
      error: {
        code?: string;
        description?: string;
        reason?: string;
        step?: string;
      };
    }) => void
  ) => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const timeout = window.setTimeout(() => resolve(false), 15000);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timeout);
      resolve(true);
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      resolve(false);
    };
    document.body.appendChild(script);
  });
}
