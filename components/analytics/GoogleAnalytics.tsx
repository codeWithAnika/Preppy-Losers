"use client";

import Script from "next/script";
import { publicEnv } from "@/lib/env/public";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function GoogleAnalytics() {
  const measurementId = publicEnv.gaMeasurementId;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}

/** Fire custom GA4 events from client components. */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.gtag || !publicEnv.gaMeasurementId) {
    return;
  }

  window.gtag("event", eventName, params);
}

/** E-commerce conversion helpers */
export const analyticsEvents = {
  signUp(method: string) {
    trackEvent("sign_up", { method });
  },
  login(method: string) {
    trackEvent("login", { method });
  },
  addToCart(productId: string, value: number) {
    trackEvent("add_to_cart", {
      currency: "INR",
      value,
      items: productId,
    });
  },
  beginCheckout(value: number) {
    trackEvent("begin_checkout", { currency: "INR", value });
  },
  purchase(orderId: string, value: number) {
    trackEvent("purchase", {
      transaction_id: orderId,
      currency: "INR",
      value,
    });
  },
};
