import { Instagram } from "lucide-react";

import { BrandWordmark } from "@/components/BrandWordmark";

import { AuthReturnLink } from "@/components/auth/AuthReturnLink";

import { TransitionLink } from "@/components/TransitionLink";

import { CONTACT_EMAIL, FOOTER_NAV_LINKS, SOCIAL_LINKS } from "@/types";
import { WhatsAppButton } from "@/components/WhatsAppButton";



function ThreadsIcon({ size = 20 }: { size?: number }) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="currentColor"

      aria-hidden="true"

    >

      <path d="M12.186 2.063c-2.683 0-4.79 1.023-6.26 3.054C4.46 7.146 3.75 9.78 3.75 13.01v.01c0 3.23.71 5.864 2.176 7.893 1.47 2.031 3.577 3.054 6.26 3.054 2.29 0 4.1-.68 5.44-2.04 1.34-1.36 2.01-3.25 2.01-5.67 0-.55-.04-1.05-.12-1.5h-3.89c.08.35.12.78.12 1.29 0 1.45-.39 2.58-1.17 3.39-.78.81-1.89 1.22-3.33 1.22-1.52 0-2.66-.55-3.42-1.65-.7-.99-1.05-2.39-1.05-4.2 0-1.81.35-3.21 1.05-4.2.76-1.1 1.9-1.65 3.42-1.65 1.01 0 1.84.28 2.49.84.65.56 1.04 1.33 1.17 2.31h3.89c-.18-2.01-.86-3.6-2.04-4.77-1.4-1.41-3.21-2.12-5.43-2.12zm-1.01 4.24h5.74v2.28h-5.74V6.303zm0 3.8h5.74v2.28h-5.74v-2.28z" />

    </svg>

  );

}



const socialIconMap = {

  instagram: Instagram,

  threads: ThreadsIcon,

} as const;



export function Footer() {

  return (

    <footer className="site-footer relative border-t border-black/35 bg-blood-red px-4 py-16 text-white md:px-8">

      <div

        className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.07]"

        aria-hidden="true"

      />



      <div className="relative mx-auto max-w-6xl">

        <BrandWordmark className="mb-10 text-3xl font-bold leading-none tracking-widest text-white md:text-5xl" />



        <div className="mb-10 flex gap-6">

          {SOCIAL_LINKS.map((social) => {

            const Icon = socialIconMap[social.icon];

            return (

              <a

                key={social.label}

                href={social.href}

                target="_blank"

                rel="noopener noreferrer"

                aria-label={social.label}

                className="inline-flex min-h-11 min-w-11 items-center justify-center text-white/70 transition-colors hover:text-white"

              >

                <Icon size={20} />

              </a>

            );

          })}

        </div>



        <a

          href={`mailto:${CONTACT_EMAIL}`}

          className="mb-10 block text-sm text-white/70 transition-colors hover:text-white"

        >

          {CONTACT_EMAIL}

        </a>



        <WhatsAppButton className="mb-10" />



        <div className="flex flex-wrap gap-6 border-t border-white/15 pt-8">

          {FOOTER_NAV_LINKS.map((link) =>

            link.href === "/account" ? (

              <AuthReturnLink

                key={link.href}

                className="inline-flex min-h-11 items-center text-xs uppercase tracking-widest text-white/55 transition-colors hover:text-white"

              >

                {link.label}

              </AuthReturnLink>

            ) : (

              <TransitionLink

                key={link.href}

                href={link.href}

                className="inline-flex min-h-11 items-center text-xs uppercase tracking-widest text-white/55 transition-colors hover:text-white"

              >

                {link.label}

              </TransitionLink>

            )

          )}

        </div>



        <p className="mt-8 text-xs text-white/40">

          &copy; {new Date().getFullYear()} Preppy Losers. All rights reserved.

        </p>

      </div>

    </footer>

  );

}

