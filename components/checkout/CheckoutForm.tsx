"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthField } from "@/components/auth/AuthField";
import { AddressSelector, type AddressSelection } from "@/components/checkout/AddressSelector";
import {
  OrderSuccessModal,
  type OrderSuccessDetails,
} from "@/components/checkout/OrderSuccessModal";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/cart-store";
import {
  formatINR,
  getCartValidationError,
  type CartItem,
  type ShippingAddress,
} from "@/lib/cart";
import {
  toShippingSnapshot,
  type CustomerAddress,
} from "@/lib/customer-addresses";
import { saveCheckoutAddressAction } from "@/lib/customer-addresses.actions";
import {
  getFunctionErrorMessage,
  invokeCreateOrderWithRetry,
  invokeVerifyPaymentWithRetry,
  isValidShippingAddress,
  mapRazorpayFailureDescription,
  type FunctionResponseBody,
} from "@/lib/payment-utils";
import { loadRazorpayScript, type RazorpaySuccessResponse } from "@/lib/razorpay";
import {
  buildRazorpayCheckoutOptions,
  RazorpayCheckoutValidationError,
  validateCreateOrderResponse,
  warnIfEnvKeyMismatch,
} from "@/lib/razorpay-checkout";
import { requestEmailNotification } from "@/lib/email/notify-client";

interface CheckoutFormProps {
  userEmail: string;
  userName: string;
  savedAddresses: CustomerAddress[];
}

interface CreateOrderResponse extends FunctionResponseBody {
  orderId?: string;
  id?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  sessionVerified?: boolean;
}

function formatRazorpayContact(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`;
  }
  return digits;
}

function emptyAddress(fullName = ""): ShippingAddress {
  return {
    fullName,
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    country: "India",
  };
}

function addressFromSaved(saved: CustomerAddress): ShippingAddress {
  return toShippingSnapshot(saved);
}

export function CheckoutForm({
  userEmail,
  userName,
  savedAddresses,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const payInFlightRef = useRef(false);

  const defaultSaved =
    savedAddresses.find((entry) => entry.isDefault) ?? savedAddresses[0] ?? null;

  const [selection, setSelection] = useState<AddressSelection>(
    defaultSaved ? { type: "saved", id: defaultSaved.id } : { type: "new" }
  );
  const [address, setAddress] = useState<ShippingAddress>(
    defaultSaved ? addressFromSaved(defaultSaved) : emptyAddress(userName)
  );
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [successDetails, setSuccessDetails] = useState<OrderSuccessDetails | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selection.type === "saved") {
      const saved = savedAddresses.find((entry) => entry.id === selection.id);
      if (saved) {
        setAddress(addressFromSaved(saved));
      }
    } else {
      setAddress(emptyAddress(userName));
    }
  }, [selection, savedAddresses, userName]);

  const subtotal = mounted ? getSubtotal() : 0;
  const cartValidationError = mounted ? getCartValidationError(items) : null;

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (payInFlightRef.current) {
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const validationError = getCartValidationError(items);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      setError("Unable to calculate order total. Please refresh your cart.");
      return;
    }

    if (!isValidShippingAddress(address)) {
      setError(
        "Please enter a complete shipping address (6-digit pincode, valid phone)."
      );
      return;
    }

    payInFlightRef.current = true;
    setLoading(true);
    setError(null);
    let modalOpened = false;

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login?next=/checkout");
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        setError(
          "Unable to load payment gateway. Check your connection and try again."
        );
        return;
      }

      const { data: orderData, error: orderError } =
        await invokeCreateOrderWithRetry(supabase, {
          amount: Math.round(subtotal * 100),
          currency: "INR",
          items,
          shippingAddress: address,
        });

      const order = orderData as CreateOrderResponse | null;

      if (orderError || !order) {
        setError(
          await getFunctionErrorMessage(
            orderError,
            order,
            "Server unavailable. Please try again."
          )
        );
        return;
      }

      let checkoutParams;
      try {
        checkoutParams = validateCreateOrderResponse(order);
      } catch (validationError) {
        if (validationError instanceof RazorpayCheckoutValidationError) {
          console.error("[checkout] Validation failed:", validationError.message);
          setError(validationError.message);
          return;
        }
        throw validationError;
      }

      warnIfEnvKeyMismatch(
        checkoutParams.keyId,
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      );

      setLoading(false);
      modalOpened = true;

      const razorpayOptions = buildRazorpayCheckoutOptions(checkoutParams, {
        name: "Preppy Losers",
        description: "Drop purchase",
        prefill: {
          name: address.fullName || userName || undefined,
          email: userEmail || undefined,
          contact: formatRazorpayContact(address.phone) || undefined,
        },
        theme: { color: "#8b1e1e" },
        handler: async (response: RazorpaySuccessResponse) => {
          setVerifying(true);
          setError(null);

          const { data: verifyData, error: verifyError } =
            await invokeVerifyPaymentWithRetry(supabase, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items,
              shippingAddress: address,
              amount: checkoutParams.amountRupee,
            });

          setVerifying(false);

          if (verifyError || !verifyData?.success) {
            setError(
              await getFunctionErrorMessage(
                verifyError,
                verifyData,
                "Verification failed. Contact support if you were charged."
              )
            );
            payInFlightRef.current = false;
            return;
          }

          if (!verifyData.duplicate) {
            void requestEmailNotification({
              type: "order_confirmation",
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              amountInr: checkoutParams.amountRupee,
              customerName: address.fullName || userName,
              items: items.map((item) => ({
                productName: item.productName,
                size: item.size,
                quantity: item.quantity,
                lineTotalInr: item.price * item.quantity,
              })),
              shippingAddress: {
                line1: address.line1,
                line2: address.line2,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                phone: address.phone,
              },
            });

            void saveCheckoutAddressAction({
              fullName: address.fullName || userName,
              phone: address.phone,
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              country: address.country ?? "India",
              isDefault: true,
            });
          }

          clearCart();
          setSuccessDetails({
            orderId: response.razorpay_order_id,
            amountInr: checkoutParams.amountRupee,
            items: items.map((item) => ({
              productName: item.productName,
              size: item.size,
              quantity: item.quantity,
              lineTotalInr: item.price * item.quantity,
            })),
          });
          payInFlightRef.current = false;
          router.refresh();
        },
        modal: {
          ondismiss: () => {
            setVerifying(false);
            setError("Payment cancelled.");
            payInFlightRef.current = false;
          },
        },
      });

      const rzp = new window.Razorpay(razorpayOptions);

      rzp.on("payment.failed", (response) => {
        console.error("[checkout] Razorpay payment.failed", {
          code: response.error?.code,
          description: response.error?.description,
          reason: response.error?.reason,
          step: response.error?.step,
          order_id: checkoutParams.orderId,
          keyPrefix: checkoutParams.keyId.slice(0, 15),
        });
        setVerifying(false);
        payInFlightRef.current = false;
        setError(
          mapRazorpayFailureDescription(
            response.error?.description ?? "Payment failed."
          )
        );
      });

      rzp.open();
    } catch {
      setError("Server unavailable. Please try again.");
    } finally {
      if (!modalOpened) {
        setLoading(false);
        payInFlightRef.current = false;
      }
    }
  };

  if (!mounted) {
    return null;
  }

  if (items.length === 0 && !successDetails) {
    return (
      <div className="border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="mb-6 text-sm text-muted">Your cart is empty.</p>
        <Link href="/shop">
          <MagneticGlitchButton variant="outline">Back to shop</MagneticGlitchButton>
        </Link>
      </div>
    );
  }

  if (cartValidationError) {
    return (
      <div className="border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="mb-6 text-sm text-muted" role="alert">
          {cartValidationError}
        </p>
        <Link href="/shop">
          <MagneticGlitchButton variant="outline">Back to shop</MagneticGlitchButton>
        </Link>
      </div>
    );
  }

  const isBusy = loading || verifying;

  return (
    <>
      {successDetails && (
        <OrderSuccessModal
          details={successDetails}
          onClose={() => setSuccessDetails(null)}
        />
      )}

      <form onSubmit={handlePay} className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">
            Shipping address
          </h2>

          <AddressSelector
            addresses={savedAddresses}
            selection={selection}
            onSelect={setSelection}
          />

          <div className="space-y-5">
            <AuthField
              label="Full name"
              required
              value={address.fullName ?? ""}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
            <AuthField
              label="Address line 1"
              required
              value={address.line1}
              onChange={(e) => updateField("line1", e.target.value)}
              placeholder="Street address"
            />
            <AuthField
              label="Address line 2"
              value={address.line2 ?? ""}
              onChange={(e) => updateField("line2", e.target.value)}
              placeholder="Apartment, suite, etc."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField
                label="City"
                required
                value={address.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
              <AuthField
                label="State"
                required
                value={address.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField
                label="Pincode"
                required
                value={address.pincode}
                onChange={(e) => updateField("pincode", e.target.value)}
                inputMode="numeric"
                pattern="\d{6}"
              />
              <AuthField
                label="Phone"
                required
                type="tel"
                value={address.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            {selection.type === "saved" && (
              <p className="text-xs text-muted">
                You can edit this delivery address for this order. Changes here
                do not update your saved address unless you save it from your
                account after checkout.
              </p>
            )}
          </div>
        </section>

        <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">
            Order summary
          </h2>

          <ul className="mb-6 space-y-4">
            {items.map((item: CartItem) => (
              <li
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 border-b border-white/10 pb-4"
              >
                <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-neutral-900">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm uppercase tracking-wide text-foreground">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Size {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm text-foreground">
                  {formatINR(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mb-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Total
            </span>
            <span className="text-lg text-foreground">{formatINR(subtotal)}</span>
          </div>

          {error && (
            <p className="mb-4 text-xs text-accent" role="alert">
              {error}
            </p>
          )}

          <MagneticGlitchButton
            type="submit"
            variant="outline"
            disabled={isBusy || !Number.isFinite(subtotal) || subtotal <= 0}
            className="w-full"
          >
            {verifying
              ? "Verifying payment..."
              : loading
                ? "Opening Razorpay..."
                : "Pay with Razorpay"}
          </MagneticGlitchButton>

          <p className="mt-4 text-center text-xs text-muted">
            Signed in as {userEmail}
          </p>
        </section>
      </form>
    </>
  );
}
