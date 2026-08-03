"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/types";
import { AccountLink } from "@/components/auth/AccountLink";
import { RotatingLogoBadge } from "@/components/ui/RotatingLogoBadge";
import { CartButton } from "@/components/cart/CartButton";
import { TransitionLink } from "@/components/TransitionLink";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur-md md:px-8">
        <TransitionLink href="/" className="flex-shrink-0" aria-label="Preppy Losers home">
          <RotatingLogoBadge
            alt="Preppy Losers"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
        </TransitionLink>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <TransitionLink
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </TransitionLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <AccountLink />

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-background transition-transform duration-500 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav
          className="flex h-full flex-col items-start justify-center gap-8 px-12"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <TransitionLink
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center text-3xl font-medium uppercase tracking-widest text-foreground transition-colors hover:text-accent"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </TransitionLink>
          ))}
          <div className="mt-8">
            <CartButton size={28} />
          </div>
        </nav>
      </div>
    </>
  );
}
