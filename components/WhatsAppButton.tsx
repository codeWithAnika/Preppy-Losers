import { MessageCircle } from "lucide-react";

const DEFAULT_WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_WA_ME_NUMBER ?? "";
const DEFAULT_MESSAGE =
  "Hi PREPPY LOSERS! I have a question about your drops.";

interface WhatsAppButtonProps {
  /** Digits only with country code, e.g. 919876543210 */
  phoneNumber?: string;
  message?: string;
  className?: string;
  label?: string;
}

export function WhatsAppButton({
  phoneNumber = DEFAULT_WA_NUMBER,
  message = DEFAULT_MESSAGE,
  className = "",
  label = "Chat on WhatsApp",
}: WhatsAppButtonProps) {
  if (!phoneNumber) {
    return null;
  }

  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`inline-flex min-h-11 items-center gap-2 text-xs uppercase tracking-widest text-white/55 transition-colors hover:text-white ${className}`}
    >
      <MessageCircle size={18} aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
