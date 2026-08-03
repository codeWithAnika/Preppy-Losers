export interface TeamMember {
  name: string;
  role: string;
  photoUrl: string;
}

export interface Founder {
  name: string;
  role: string;
  /** null = photo not yet provided; renders a reserved placeholder slot */
  photoUrl: string | null;
}

export const STORY_HEADLINE = "Our Story";

export const STORY_PARAGRAPHS = [
  "Every brand has a beginning. Ours started on the streets of Mumbai.",
  "Preppy Losers was founded by Nishant Shinde and Govinda Saw — two friends shaped by the city's chaos, hustle, and relentless energy. We didn't come from privilege or perfect beginnings. We learned that the streets don't just test you — they shape you.",
  "We built this brand for the ones who've been overlooked, underestimated, or told they weren't enough. Preppy Losers isn't about accepting failure — it's about owning your journey and proving that labels don't define your future. Every piece we make carries the spirit of where we come from: bold, unapologetic, and built to stand out.",
  "None of this exists without the people who chose to believe in it. From our team to every creative mind behind the scenes, this brand is as much theirs as it is ours — their work is stitched into everything we make.",
  "This is more than fashion. It's a reminder that greatness can come from anywhere, even from the streets where people least expect it.",
  "From one loser to another — welcome to Preppy Losers. We're just getting started.",
];

export const FOUNDERS: Founder[] = [
  {
    name: "Nishant Shinde",
    role: "Founder",
    photoUrl: "/nishant.webp",
  },
  {
    name: "Govinda Saw",
    role: "Co-Founder",
    photoUrl: "/govinda.webp",
  },
];

/** Placeholder names/roles until real team details are provided. */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Team Member One",
    role: "Creative",
    photoUrl: "/team1.webp",
  },
  {
    name: "Team Member Two",
    role: "Operations",
    photoUrl: "/team2.webp",
  },
];
