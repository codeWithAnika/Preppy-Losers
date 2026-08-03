"use client";

import { useRef, useEffect } from "react";
import { gsap, registerGSAP } from "@/lib/animations/gsap";
import { DistressedHeadline } from "@/components/ui/DistressedHeadline";
import { FounderCards } from "@/components/team/FounderCards";
import { TeamSwipeCards } from "@/components/team/TeamSwipeCards";
import {
  FOUNDERS,
  STORY_HEADLINE,
  STORY_PARAGRAPHS,
  TEAM_MEMBERS,
} from "@/lib/team";

export function TeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const foundersRef = useRef<HTMLDivElement>(null);
  const teamLabelRef = useRef<HTMLHeadingElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGSAP();

    const section = sectionRef.current;
    const headline = headlineRef.current;
    const story = storyRef.current;
    const founders = foundersRef.current;
    const teamLabel = teamLabelRef.current;
    const cardsWrap = cardsWrapRef.current;
    const bg = bgRef.current;
    if (!section || !headline || !story || !founders || !teamLabel || !cardsWrap) {
      return;
    }

    const ctx = gsap.context(() => {
      if (bg) {
        gsap.fromTo(
          bg,
          { opacity: 0.4 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 35%",
              scrub: 0.5,
            },
          }
        );
      }

      gsap.fromTo(
        [headline, story, founders, teamLabel, cardsWrap],
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      aria-label="Our story and team"
    >
      <div
        ref={bgRef}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,30,30,0.14),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true" />

      <div className="relative px-4 py-28 md:px-8 md:py-40">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <DistressedHeadline
              ref={headlineRef}
              as="h2"
              className="font-doctor-glitch mb-10 text-3xl tracking-tight text-foreground md:text-5xl"
            >
              {STORY_HEADLINE.toUpperCase()}
            </DistressedHeadline>
          </div>

          <div
            ref={storyRef}
            className="mx-auto mb-16 max-w-2xl space-y-5 text-left text-sm leading-[1.85] text-foreground/60 md:text-base md:leading-[1.9]"
          >
            {STORY_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <div ref={foundersRef} className="mb-16">
            <FounderCards founders={FOUNDERS} />
          </div>

          <div className="border-t border-white/10 pt-16">
            <DistressedHeadline
              ref={teamLabelRef}
              as="h3"
              className="font-doctor-glitch mb-10 text-center text-2xl tracking-tight text-foreground md:text-3xl"
            >
              THE TEAM
            </DistressedHeadline>

            <div ref={cardsWrapRef}>
              <TeamSwipeCards members={TEAM_MEMBERS} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
