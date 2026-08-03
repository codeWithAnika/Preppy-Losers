# 02. Visual Direction

**Project:** PREPPY LOSERS  
**Tagline:** Underground street culture for the bold.  
**Document Version:** 1.0  
**Status:** Foundation — Day 1  
**Last Updated:** July 2, 2026  
**Primary Market:** India  
**Inherits From:** Document 01 — Brand Discovery v1.2

---

## Document Purpose

This document is the single source of truth for every visual decision in the PREPPY LOSERS digital product. It defines the creative direction, color system, typography, layout rules, component styling, image treatment, iconography, design tokens, and motion-aware UI patterns that designers and developers will implement.

This is not a generic ecommerce design system. It is an editorial fashion campaign system that happens to support commerce.

**Implementation context:** Next.js · Tailwind CSS · TypeScript · GSAP · GSAP ScrollTrigger · Lenis · Framer Motion · SplitType

**Rule:** If a visual decision is not documented here, it does not ship. If it conflicts with Document 01 Brand Principles or Design Constraints, Document 01 wins.

---

# SECTION 1 — Creative Direction

## Visual Philosophy

PREPPY LOSERS digital design follows one principle above all others:

> **The clothing is the hero. The interface is the frame.**

The website is not a store with nice photos. It is a fashion campaign that allows purchase. Every pixel of UI — navigation, buttons, borders, backgrounds — exists to present the product and reinforce the brand world. When UI competes with clothing for attention, UI loses.

### Core Visual Beliefs

| Belief | Meaning | Why |
|--------|---------|-----|
| **Darkness with depth** | Backgrounds are layered charcoals and near-blacks — never flat `#000000` everywhere | Pure black feels void, not premium. Layered darks create atmosphere, depth, and hierarchy |
| **Light as accent** | Typography and key UI elements use warm off-whites and stone tones — light is earned, not default | High-contrast type on dark fields reads editorial and confident |
| **Weight over decoration** | Visual weight comes from photography scale, typography size, and whitespace — not gradients, shadows, or graphics | Supports "heavyweight fabric" brand truth in visual language |
| **Restraint is premium** | One strong idea per viewport. Remove until it breaks. | Indian D2C defaults to noise; restraint signals luxury |
| **Asymmetry is editorial** | Break the grid intentionally. Not chaos — controlled imbalance. | Campaign layouts feel designed, not templated |
| **Motion has mass** | Animations feel heavy, intentional, and elegant — never bouncy or playful | Motion mirrors fabric weight and brand confidence |

---

## Art Direction

Art direction for PREPPY LOSERS sits at the intersection of **underground street documentation** and **luxury fashion editorial**. Think: a photographer followed the subject through Mumbai at night, then the selects were art-directed for a Paris fashion week lookbook.

### Art Direction Pillars

1. **Subcultural authenticity** — Real environments (rooftops, studios, streets, parking structures), not white seamless studios as default
2. **Controlled lighting** — Low-key, directional, high contrast. Shadows are intentional
3. **Oversized silhouette emphasis** — Full-body or three-quarter crops that show drape, drop-shoulder, and volume
4. **Material truth** — Close-up texture shots are as important as styled hero shots
5. **Human, not mannequin** — Subjects have presence and attitude; they are not smiling catalog models

### Art Direction Anti-Patterns

- Flat lay product on white background as primary presentation
- Neon lighting, club flash photography, or Instagram filter aesthetics
- Logo-forward styling where the garment becomes secondary
- Stock photography energy — posed, generic, interchangeable

---

## Mood

| Attribute | Expression |
|-----------|------------|
| **Atmosphere** | Late evening. Concrete. Low light. Confidence without performance |
| **Temperature** | Cool ambient with warm skin/material highlights |
| **Energy** | Still, not static. Tension, not chaos |
| **Social register** | Insider — you found this, it didn't find you |
| **Temporal feel** | Timeless within contemporary — not tied to one trend cycle |

---

## Brand Atmosphere

The brand atmosphere is the cumulative sensory impression of the visual system working together. When successful, a visitor feels they have entered a space — not opened a webpage.

### Atmosphere Stack

```
Layer 1 — Color field (warm near-black base, layered surfaces)
Layer 2 — Typography (confident scale, generous tracking on display)
Layer 3 — Photography (full-bleed campaign imagery, high contrast)
Layer 4 — Space (whitespace as luxury — content breathes)
Layer 5 — Motion (slow reveal, scroll-driven pacing)
Layer 6 — Sound (future: optional ambient on campaign pages — not Day 1)
```

**Why:** Atmosphere is what separates PREPPY LOSERS from Bluorng's commerce-forward layout and Bonkers Corner's promotional energy. The visitor should feel atmosphere before they read a word.

---

## Reference Categories

References are for **study**, not copying. Each category teaches a specific lesson.

### Editorial References

| Reference | Learn | Do Not Copy |
|-----------|-------|-------------|
| **i-D Magazine (digital)** | Asymmetric layouts, bold type scale, image-first hierarchy | Magazine editorial pacing that ignores commerce |
| **032c** | Minimal chrome, cultural seriousness, dark environments | Overly art-world inaccessibility |
| **SSENSE Editorials** | Product integrated into editorial context | SSENSE's dense navigation patterns |
| **Dazed Digital** | Underground cultural credibility in layout | Busy multi-column editorial density |

**Why:** Editorial references teach pacing, type scale, and image hierarchy — the core of campaign-first design.

---

### Luxury References

| Reference | Learn | Do Not Copy |
|-----------|-------|-------------|
| **Bottega Veneta (Campaign era)** | Logo-less confidence, material and silhouette focus | Luxury price signaling and exclusivity gatekeeping |
| **A-COLD-WALL* (Digital)** | Conceptual layout, architectural spacing | Over-abstraction that hurts usability |
| **Jil Sander (Campaign)** | Restraint, negative space, fabric as subject | Minimalism so extreme it feels empty |
| **Acne Studios** | Clean ecommerce within editorial brand world | Scandinavian brightness — we stay dark |

**Why:** Luxury references teach restraint, material focus, and spacing discipline.

---

### Streetwear References

| Reference | Learn | Do Not Copy |
|-----------|-------|-------------|
| **Represent (Digital)** | Cohesive dark world, product presentation, premium feel | Logo-heavy identity, UK-specific cultural cues |
| **Almost Gods (Digital)** | Indian premium streetwear editorial ambition | Direct aesthetic imitation — closest peer |
| **Palace (Drop mechanics)** | Drop event energy, sold-out culture | Graphic-heavy, meme-adjacent visual language |
| **Stüssy (Campaign archives)** | Subcultural roots, authentic casting | Heritage nostalgia we haven't earned |

**Why:** Streetwear references keep the brand grounded in culture, not luxury cosplay.

---

## Photography Philosophy

Photography is the primary design material. UI is secondary.

### Principles

1. **Campaign sets the tone; product delivers the detail** — Every drop has a campaign visual world. Individual product shots inherit that world
2. **Show weight** — Fabric must look heavy. Drape, fold, and structure visible. Light raking across texture
3. **Context over isolation** — Styled shots in environment preferred over ghost mannequin or flat lay
4. **Consistent grade per drop** — Each drop has a unified color grade; grades may shift between drops
5. **Indian contexts, global quality** — Locations, casting, and environments reflect Indian metro culture with world-class production value

### Shot Types (Required Per Drop)

| Shot Type | Purpose | Usage |
|-----------|---------|-------|
| **Campaign hero** | Emotional entry, brand world | Homepage, collection header, social |
| **Editorial lookbook** | Styling context, attitude | Collection page, lookbook section |
| **Product hero** | Garment clarity on model or styled | PDP main image |
| **Detail / texture** | Fabric weight, construction proof | PDP craft section, zoom |
| **Flat / ghost (secondary)** | Size and color clarity | PDP thumbnail, cart — never campaign hero |

**Why:** Document 01 USP requires fabric and craft proof. Photography must deliver what copy claims.

---

## Composition Philosophy

### Rules

- **Rule of thirds with intentional break** — Default to thirds; break symmetry for key campaign frames
- **Full-bleed default** — Hero and campaign imagery extends edge-to-edge. Margins are for text and UI, not photography
- **Vertical orientation respected on mobile** — Compose knowing 80%+ of views are portrait
- **Subject isolation through light, not background removal** — Dark environments naturally isolate; avoid cutout aesthetic
- **Scale contrast** — Small type over large image, or large type beside small detail — never uniform scale

### Grid Relationship

Photography may break the grid. Typography and UI obey the grid. The tension between broken images and disciplined type creates editorial energy.

**Why:** Strict grid photography feels catalog. Broken-grid photography with disciplined UI feels campaign.

---

## Texture Philosophy

Texture appears in three forms:

1. **Photographic texture** — Fabric, concrete, skin, environment — primary texture source
2. **UI texture** — Subtle noise overlay on dark surfaces (2–4% opacity) to prevent flat digital feeling — optional, used sparingly on hero sections
3. **Motion texture** — Slow parallax, scroll-linked opacity shifts — creates depth without visual noise

### What We Avoid

- Leather/sweatshirt texture patterns in UI backgrounds
- Grain overlays so heavy they read as vintage filter
- Glassmorphism as default surface treatment — glass is reserved for overlays and navigation, not every card

**Why:** Texture in PREPPY LOSERS comes from the real world (photography, fabric), not decorative UI patterns.

---

## Negative Space Philosophy

Whitespace is not empty space. It is **confidence**.

- Generous padding above and below section headings (minimum 64px mobile, 96px desktop)
- Hero sections: minimum 60vh content area with no more than 12 words of headline copy
- Product grids: gap minimum 24px mobile, 32px desktop — products never touch
- Maximum content density: no more than 6 product cards visible above fold on desktop; 2 on mobile

**Why:** Indian D2C sites fill every pixel with offers and products. Whitespace is the most visible premium signal available.

---

## Emotional Target

When the visual system works, the user feels:

| Emotion | Visual Trigger |
|---------|----------------|
| **Intrigue** | Dark entry, slow reveal, unexpected scale |
| **Confidence** | Bold type, high contrast, no visual apology |
| **Desire** | Full-bleed photography, material close-ups |
| **Trust** | Consistent system, no visual bugs, craft details visible |
| **Exclusivity** | Restraint, space, absence of sale visual language |
| **Belonging** | Cultural authenticity in imagery — real people, real places |

---

# SECTION 2 — Color System

## Color Philosophy

PREPPY LOSERS does not use pure black and white. The palette is built on **layered dark neutrals** with **warm stone accents** — inspired by heavyweight fabric, concrete, night environments, and aged paper.

Color supports hierarchy: surfaces recede, content advances, accents appear only at interaction moments.

### Palette Temperature

- **Base:** Warm-neutral dark (slight red/yellow undertone — not blue-black)
- **Text:** Warm off-white (not pure `#FFFFFF`)
- **Accent:** Stone/bone — preppy reference without Ivy League cliché
- **Semantic:** Muted, desaturated — never bright traffic-light colors

**Why not all black:** Flat black feels like a developer default. Layered darks create depth, surface hierarchy, and the "entered a space" atmosphere Document 01 requires. Competitors like Snitch and Bonkers Corner use white or light backgrounds — our darkness is immediate differentiation.

---

## Core Palette

### Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `color.primary.default` | `#E8E4DD` | 232, 228, 221 | Primary accent — links, active nav, key CTAs, focus rings, selection highlights |
| `color.primary.hover` | `#F2EFE9` | 242, 239, 233 | Hover state on primary interactive elements |
| `color.primary.muted` | `#A8A49C` | 168, 164, 156 | Secondary accent, decorative emphasis, icon highlights |
| `color.primary.inverse` | `#0C0C0E` | 12, 12, 14 | Text on primary-filled buttons |

**Why stone/bone accent:** Avoids the streetwear cliché of red/neon/green. References preppy materiality (oxford cloth, bone buttons, aged paper) without literal Ivy imagery. Reads premium on dark backgrounds.

---

### Secondary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `color.secondary.default` | `#6B2D3C` | 107, 45, 60 | Rare emphasis — drop badges, manifesto moments, editorial highlights. Never for sales |
| `color.secondary.hover` | `#7E3648` | 126, 54, 72 | Hover on secondary elements |
| `color.secondary.muted` | `#3D1A24` | 61, 26, 36 | Secondary background tint, subtle section differentiation |

**Why deep wine/oxblood:** Underground, not corporate. Used sparingly — overuse reads gothic or sale-adjacent. Maximum 5% of any viewport.

---

### Surface Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `color.surface.base` | `#0C0C0E` | 12, 12, 14 | Page background — outermost layer |
| `color.surface.primary` | `#131316` | 19, 19, 22 | Default section background |
| `color.surface.secondary` | `#1A1A1F` | 26, 26, 31 | Elevated sections, alternating rhythm |
| `color.surface.tertiary` | `#222228` | 34, 34, 40 | Deep inset areas, footer, admin sidebar |
| `color.surface.elevated` | `#2A2A32` | 42, 42, 50 | Highest surface elevation without overlay |

**Why five surface levels:** Enables section rhythm on long editorial pages without borders. Alternating `primary` / `secondary` creates pacing through the homepage scroll.

---

### Card Colors

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `color.card.background` | `#16161A` | Product cards, content cards, dashboard cards |
| `color.card.background.hover` | `#1C1C22` | Card hover state |
| `color.card.background.selected` | `#1E1E26` | Selected/active card state |
| `color.card.border` | `rgba(255, 255, 255, 0.06)` | Default card border — subtle edge definition |
| `color.card.border.hover` | `rgba(255, 255, 255, 0.10)` | Card hover border |

**Why visible card backgrounds:** Cards must be distinguishable from section backgrounds without relying on heavy shadows. Border + background shift is enough.

---

### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `color.border.default` | `rgba(255, 255, 255, 0.08)` | Dividers, input borders, table borders |
| `color.border.subtle` | `rgba(255, 255, 255, 0.04)` | Section separators, low-emphasis dividers |
| `color.border.strong` | `rgba(255, 255, 255, 0.14)` | Emphasized borders, active containers |
| `color.border.focus` | `#E8E4DD` | Focus ring border (accessibility) |

---

### Typography Colors

| Token | Hex | Contrast on `surface.base` | Usage |
|-------|-----|---------------------------|-------|
| `color.text.primary` | `#F0EDE8` | 15.8:1 ✓ AAA | Headlines, body, primary content |
| `color.text.secondary` | `#9C9890` | 7.2:1 ✓ AAA | Supporting copy, descriptions, metadata |
| `color.text.muted` | `#6B6760` | 4.6:1 ✓ AA | Placeholders, disabled text, timestamps |
| `color.text.inverse` | `#0C0C0E` | — | Text on light/primary filled surfaces |
| `color.text.accent` | `#E8E4DD` | 14.1:1 ✓ AAA | Links, interactive text, nav active state |
| `color.text.price` | `#F0EDE8` | 15.8:1 ✓ AAA | Price display — same weight as primary, not highlighted |

**Why price is not accent-colored:** Document 01 — never lead with price. Price reads clearly but does not compete with craft story.

---

### Accent Colors (Extended)

| Token | Hex | Usage |
|-------|-----|-------|
| `color.accent.highlight` | `#C4BAA8` | GSM badges, craft callouts, spec labels |
| `color.accent.glow` | `rgba(232, 228, 221, 0.08)` | Subtle glow behind hero text — extremely restrained |

---

### Semantic Colors

Semantic colors are **desaturated and dark-environment-native** — they must not break the editorial atmosphere.

| Token | Hex | Usage |
|-------|-----|-------|
| `color.success.default` | `#3D6B52` | Order confirmed, stock available, form valid |
| `color.success.background` | `rgba(61, 107, 82, 0.12)` | Success alert background |
| `color.success.border` | `rgba(61, 107, 82, 0.30)` | Success alert border |
| `color.warning.default` | `#A07D2E` | Low stock (genuine), pending states |
| `color.warning.background` | `rgba(160, 125, 46, 0.12)` | Warning alert background |
| `color.warning.border` | `rgba(160, 125, 46, 0.30)` | Warning alert border |
| `color.error.default` | `#9B3D3D` | Form errors, payment failure, out of stock (final) |
| `color.error.background` | `rgba(155, 61, 61, 0.12)` | Error alert background |
| `color.error.border` | `rgba(155, 61, 61, 0.30)` | Error alert border |

**Why muted semantics:** Bright green `#00FF00` or red `#FF0000` destroys dark editorial world. Semantic colors must communicate state without looking like a SaaS dashboard.

---

### Overlay Colors

| Token | Value | Usage |
|-------|-------|-------|
| `color.overlay.light` | `rgba(12, 12, 14, 0.40)` | Image text legibility — light overlay on photography |
| `color.overlay.medium` | `rgba(12, 12, 14, 0.60)` | Modal backdrop, drawer backdrop |
| `color.overlay.heavy` | `rgba(12, 12, 14, 0.80)` | Full-screen menu overlay, image zoom backdrop |
| `color.overlay.scrim` | `linear-gradient(to top, rgba(12,12,14,0.85) 0%, transparent 60%)` | Hero text scrim — bottom-weighted gradient for legibility |

---

### Glass Colors

Glass effects are used **sparingly** — navigation bar and floating UI only.

| Token | Value | Usage |
|-------|-------|-------|
| `color.glass.background` | `rgba(19, 19, 22, 0.72)` | Navbar scrolled state, floating cart indicator |
| `color.glass.border` | `rgba(255, 255, 255, 0.06)` | Glass element border |
| `color.glass.blur` | `20px` | Backdrop blur value — `backdrop-filter: blur(20px)` |

**Why limited glass:** Overused glassmorphism reads 2021 startup. One glass surface (nav) is premium; every card in glass is not.

---

### Interactive State Colors

| Token | Value | Usage |
|-------|-------|-------|
| `color.interactive.hover` | `rgba(255, 255, 255, 0.04)` | Subtle hover fill on dark surfaces |
| `color.interactive.active` | `rgba(255, 255, 255, 0.08)` | Active/pressed state |
| `color.interactive.disabled` | `rgba(255, 255, 255, 0.02)` | Disabled button/card background |
| `color.interactive.disabled-text` | `#4A4744` | Disabled text — fails contrast intentionally to signal inactive |
| `color.interactive.focus-ring` | `#E8E4DD` | Focus ring — 2px solid, 2px offset |
| `color.interactive.selection` | `rgba(232, 228, 221, 0.20)` | Text selection highlight |

---

### Scrollbar Colors

| Token | Value | Usage |
|-------|-------|-------|
| `color.scrollbar.track` | `#0C0C0E` | Scrollbar track |
| `color.scrollbar.thumb` | `#2A2A32` | Scrollbar thumb |
| `color.scrollbar.thumb.hover` | `#3A3A44` | Scrollbar thumb hover |

Custom thin scrollbar (6px) on desktop. Hidden on mobile (native behavior).

---

### Shadow System

Shadows are **subtle and warm** — used for elevation, not decoration.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow.none` | `none` | Default — most elements have no shadow |
| `shadow.subtle` | `0 1px 2px rgba(0, 0, 0, 0.40)` | Input focus elevation |
| `shadow.medium` | `0 4px 16px rgba(0, 0, 0, 0.50)` | Dropdown, popover |
| `shadow.large` | `0 8px 32px rgba(0, 0, 0, 0.60)` | Modal, cart drawer |
| `shadow.elevated` | `0 16px 48px rgba(0, 0, 0, 0.70)` | Full-screen overlay panels |

**Why minimal shadows:** Dark UI on dark backgrounds — shadows are less visible and less needed. Borders and surface shifts handle hierarchy; shadows reserved for floating elements.

---

## Accessibility Considerations

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Body text contrast | WCAG AA minimum (4.5:1) | `text.primary` on all surface levels ≥ 7:1 |
| Large text contrast | WCAG AA (3:1) | All heading sizes on dark surfaces ≥ 10:1 |
| Focus indicators | WCAG 2.4.7 | 2px solid `color.interactive.focus-ring` with 2px offset — never `outline: none` without replacement |
| Color not sole indicator | WCAG 1.4.1 | Errors use icon + text; success uses icon + text; stock status uses text label + color |
| Reduced motion | WCAG 2.3.3 | All motion respects `prefers-reduced-motion: reduce` — instant state changes as fallback |
| Touch targets | Minimum 44×44px | All interactive elements on mobile |

**Why:** Document 01 Technical Goals require Lighthouse Accessibility > 95. Premium must be inclusive.

---

# SECTION 3 — Typography System

## Font Selection

PREPPY LOSERS uses **two typefaces** across the customer-facing experience — per Document 01 constraint. A third monospace face is admin-only.

### Primary Typeface — Display & UI

**Neue Montreal** (Pangram Pangram)  
**Role:** Headlines, navigation, buttons, labels, product titles, prices  
**Why:** Geometric grotesk with editorial credibility. Confident without aggression. Distinctive enough to avoid "Inter template" feeling while remaining highly legible at display sizes. The geometric construction references modernist fashion branding (preppy precision) while the weight range supports underground boldness.

**Fallback stack:** `'Neue Montreal', 'Helvetica Neue', 'Arial', sans-serif`

**License note:** Purchase Pangram Pangram license for production. Until then, use **Satoshi** (Indian market familiarity, similar geometric grotesk) as development fallback.

---

### Secondary Typeface — Body & Long-form

**Inter** (Google Fonts / RSMS)  
**Role:** Body copy, product descriptions, form inputs, FAQ, footer, admin tables  
**Why:** Optimized for screen readability at 14–16px on mobile. Excellent hinting, large x-height, proven at scale. Pairs cleanly with Neue Montreal without competing. Variable font support enables precise weight control.

**Fallback stack:** `'Inter', system-ui, -apple-system, sans-serif`

---

### Monospace — Admin Only

**JetBrains Mono**  
**Role:** Order IDs, SKU codes, GSM spec tables, code snippets in admin dashboard  
**Why:** Clear character distinction (0/O, 1/l). Not used in customer-facing UI except fabric spec numbers if needed.

---

## Type Scale

Base font size: **16px** (1rem) on mobile, **16px** on desktop. Scale uses a **1.250 (Major Third)** ratio for editorial confidence.

| Token | Size (rem) | Size (px) | Line Height | Letter Spacing | Weight | Usage |
|-------|------------|-----------|-------------|----------------|--------|-------|
| `type.display.xl` | 4.768rem | 76px | 1.0 | -0.03em | 500 | Homepage hero — max one per page |
| `type.display.lg` | 3.815rem | 61px | 1.05 | -0.025em | 500 | Campaign headers, collection heroes |
| `type.display.md` | 3.052rem | 49px | 1.1 | -0.02em | 500 | Section heroes, About manifesto |
| `type.heading.xl` | 2.441rem | 39px | 1.15 | -0.015em | 500 | Page titles |
| `type.heading.lg` | 1.953rem | 31px | 1.2 | -0.01em | 500 | Section titles |
| `type.heading.md` | 1.563rem | 25px | 1.25 | -0.005em | 500 | Subsection titles, collection names |
| `type.heading.sm` | 1.25rem | 20px | 1.3 | 0 | 500 | Card titles, modal headers |
| `type.body.lg` | 1.125rem | 18px | 1.6 | 0 | 400 | Lead paragraphs, collection intros |
| `type.body.md` | 1rem | 16px | 1.6 | 0 | 400 | Default body copy |
| `type.body.sm` | 0.875rem | 14px | 1.5 | 0.005em | 400 | Secondary copy, captions |
| `type.label.lg` | 0.875rem | 14px | 1.4 | 0.08em | 500 | Section labels, category tags — uppercase |
| `type.label.md` | 0.75rem | 12px | 1.4 | 0.10em | 500 | Metadata, timestamps — uppercase |
| `type.label.sm` | 0.6875rem | 11px | 1.3 | 0.12em | 500 | Legal, micro labels — uppercase |

**Why Major Third scale:** Large jumps between display and body create editorial hierarchy. Smaller ratios (1.125) feel SaaS; larger ratios (1.618) feel too dramatic for ecommerce readability.

---

## Contextual Typography Rules

### Hero Typography

- Font: Neue Montreal Medium (500)
- Case: **lowercase or sentence case** — never all caps
- Max characters per line: 40
- Max lines: 3
- SplitType: line-by-line reveal on load — see Section 9
- Color: `color.text.primary` on photography; use scrim overlay when needed

**Example:** `underground street culture for the bold.`

---

### Section Titles

- Font: Neue Montreal Medium
- Case: lowercase preferred
- Spacing below: `space.48` mobile / `space.64` desktop before content
- Optional label above: `type.label.lg` in `color.text.muted` — e.g., `DROP 01`

---

### Body Copy

- Font: Inter Regular (400)
- Max line length: **65 characters** (see Layout System)
- Color: `color.text.secondary` for long-form; `color.text.primary` for short UI copy
- Paragraph spacing: `space.16` between paragraphs

---

### Product Titles

- Font: Neue Montreal Medium
- Size: `type.heading.sm` (20px)
- Case: Title case for product names — e.g., `Heavyweight Drop-Shoulder Hoodie`
- Color: `color.text.primary`
- Max 2 lines before truncate with ellipsis

---

### Navigation

- Font: Neue Montreal Medium
- Size: `type.label.lg` (14px) uppercase
- Letter spacing: `0.08em`
- Color: `color.text.secondary` default; `color.text.accent` active
- No bold. Weight 500 only

---

### Buttons

- Font: Neue Montreal Medium
- Size: `type.label.lg` (14px) uppercase
- Letter spacing: `0.08em`
- Primary button: `color.primary.inverse` text on `color.text.primary` filled background (inverted — bone fill, dark text)
- Ghost button: `color.text.primary` text, border only

---

### Price Styling

- Font: Neue Montreal Medium
- Size: `type.body.md` (16px) — same as body, not enlarged
- Color: `color.text.price`
- Format: `₹4,999` — Indian Rupee symbol, comma separator, no decimals
- Strikethrough: **never** — no sale pricing visual language at launch
- Compare-at pricing: **not used**

**Why:** Price at body scale communicates confidence. Large red sale prices are explicitly banned.

---

### Form Styling

- Labels: `type.label.md` uppercase, `color.text.muted`
- Input text: Inter Regular, `type.body.md`, `color.text.primary`
- Placeholder: `color.text.muted`
- Error text: `type.body.sm`, `color.error.default`
- Input height: 48px minimum (touch target)

---

### Admin Typography

- Headings: Neue Montreal (same as customer-facing for brand consistency)
- Body/tables: Inter
- Data/specs: JetBrains Mono, `type.body.sm`
- Background: `color.surface.tertiary` — slightly lighter admin context
- Density: May use tighter spacing than customer UI — admin is functional

---

## Responsive Type Scaling

Display sizes scale down on mobile to prevent overflow and maintain hierarchy.

| Token | Mobile (< 768px) | Tablet (768–1023px) | Desktop (≥ 1024px) |
|-------|------------------|---------------------|---------------------|
| `type.display.xl` | 2.441rem (39px) | 3.052rem (49px) | 4.768rem (76px) |
| `type.display.lg` | 2.041rem (33px) | 2.441rem (39px) | 3.815rem (61px) |
| `type.display.md` | 1.953rem (31px) | 2.441rem (39px) | 3.052rem (49px) |
| `type.heading.xl` | 1.953rem (31px) | 2.041rem (33px) | 2.441rem (39px) |
| `type.heading.lg` | 1.563rem (25px) | 1.953rem (31px) | 1.953rem (31px) |

**Implementation note:** Use `clamp()` in Tailwind config for fluid scaling between breakpoints. GSAP SplitType must re-init on resize for display text.

---

## Hierarchy Summary

```
Display XL  ————  One moment per page (hero headline)
Display LG  ————  Campaign/collection entry
Display MD  ————  Major section statements
Heading XL  ————  Page title
Heading LG  ————  Section title
Heading MD  ————  Subsection / collection name
Heading SM  ————  Product title, card title
Body LG     ————  Lead copy
Body MD     ————  Default reading
Body SM     ————  Supporting detail
Label       ————  Navigation, buttons, metadata
```

**Rule:** Never skip more than 2 levels in adjacent elements. Display XL followed by Body SM creates confusion — insert Heading MD or Body LG as bridge.

---

# SECTION 4 — Layout System

## Grid System

### Base Grid

| Property | Value |
|----------|-------|
| Columns | 12 |
| Gutter (mobile) | 16px |
| Gutter (tablet) | 24px |
| Gutter (desktop) | 32px |
| Margin (mobile) | 20px |
| Margin (tablet) | 40px |
| Margin (desktop) | 48px (max — content centers beyond this as margin) |

**Why 12 columns:** Divisible by 2, 3, 4, 6 — supports editorial asymmetry (7+5, 8+4, 5+4+3) without grid-breaking.

---

## Container Widths

| Token | Max Width | Usage |
|-------|-----------|-------|
| `container.full` | 100% | Hero imagery, full-bleed sections |
| `container.wide` | 1440px | Campaign sections, lookbook grids |
| `container.default` | 1200px | Standard content, product grids |
| `container.narrow` | 800px | Long-form text, FAQ, About manifesto |
| `container.prose` | 680px | Maximum reading width for body copy |
| `container.form` | 480px | Checkout, login, single-column forms |

**Why multiple containers:** Editorial pages need wide containers for imagery. Reading content needs narrow containers for comprehension. One container width forces compromise.

---

## Breakpoints

Aligned with Tailwind defaults for implementation consistency.

| Token | Min Width | Target Devices |
|-------|-----------|----------------|
| `breakpoint.xs` | 375px | Small mobile (iPhone SE) |
| `breakpoint.sm` | 640px | Large mobile |
| `breakpoint.md` | 768px | Tablet portrait |
| `breakpoint.lg` | 1024px | Tablet landscape / small desktop |
| `breakpoint.xl` | 1280px | Desktop |
| `breakpoint.2xl` | 1536px | Large desktop |

**Design default:** Design mobile-first at 375px. Review at 768px, 1280px, and 1536px.

---

## Section Spacing

Vertical spacing between major page sections.

| Token | Mobile | Desktop | Usage |
|-------|--------|---------|-------|
| `space.section.xs` | 48px | 64px | Compact sections (footer nav, inline modules) |
| `space.section.sm` | 64px | 96px | Standard section gap |
| `space.section.md` | 96px | 128px | Major section transitions |
| `space.section.lg` | 128px | 160px | Hero to first content, campaign breaks |
| `space.section.xl` | 160px | 200px | Full-page breathing moments |

**Why large section spacing:** Creates editorial pacing. Sections feel like spreads in a lookbook, not rows in a table.

---

## Content Rhythm

Content rhythm is the internal spacing within a section — between heading, subheading, content, and CTA.

```
Section Label (label.lg, muted)
    ↓ space.8
Section Title (heading.lg)
    ↓ space.16
Lead Copy (body.lg, secondary) — optional
    ↓ space.32
Content Block (grid, images, products)
    ↓ space.32
CTA — optional
```

---

## Vertical Rhythm

Base unit: **8px**. All spacing values are multiples of 8.

| Token | Value |
|-------|-------|
| `space.4` | 4px — micro (icon-to-text gap) |
| `space.8` | 8px — tight |
| `space.12` | 12px — label to input |
| `space.16` | 16px — paragraph gap, card internal padding (mobile) |
| `space.24` | 24px — card padding (desktop), grid gap (mobile) |
| `space.32` | 32px — grid gap (desktop), content block gap |
| `space.48` | 48px — heading to content |
| `space.64` | 64px — section internal major gap |
| `space.96` | 96px — section padding vertical (mobile) |
| `space.128` | 128px — section padding vertical (desktop) |

---

## Editorial Layouts

### Layout Patterns

| Pattern | Grid | Usage |
|---------|------|-------|
| **Full bleed** | 12/12 image, text overlay | Hero, campaign entry |
| **Asymmetric split** | 7+5 or 8+4 | Collection intro, story section |
| **Editorial stack** | 12 col centered prose | Manifesto, About, drop description |
| **Product grid** | 6+6 (2 col mobile), 4+4+4 (3 col desktop), 3+3+3+3 (4 col wide) | Shop, collection |
| **Lookbook mosaic** | Mixed: 8+4 / 4+4+4 / 12 | Lookbook, campaign gallery |
| **Product detail** | 7+5 (gallery + info) desktop; stack mobile | PDP |

### Asymmetry Rules

- Asymmetry is **intentional**, not accidental — one column always dominates (7/5 minimum ratio)
- Text never competes with image at 50/50 unless product detail page
- Break asymmetry direction between sections (left-heavy, then right-heavy) to create scroll rhythm
- Maximum 2 asymmetric sections consecutively — then return to full-bleed or symmetric grid for visual rest

---

## Alignment Rules

| Element | Alignment |
|---------|-----------|
| Hero headline | Bottom-left or center-left — never center-center (too corporate) |
| Section titles | Left-aligned default; center only on standalone statement sections |
| Body copy | Left-aligned — never justified (creates rivers) |
| Product grid | Grid-aligned — products snap to column grid |
| Navigation | Left logo, center/left links, right cart/account |
| Footer | Left-aligned link groups; logo top-left |
| Price | Left-aligned with product info — never centered floating |

---

## Image Sizing

| Context | Aspect Ratio | Notes |
|---------|--------------|-------|
| Hero campaign | 16:9 desktop / 4:5 mobile | Full viewport width |
| Collection banner | 21:9 desktop / 3:4 mobile | Wide cinematic |
| Product card | 3:4 | Consistent grid |
| Product detail main | 3:4 or 4:5 | Large, zoomable |
| Lookbook editorial | Variable (2:3, 4:5, 1:1 mixed) | Intentional variation |
| Thumbnail (cart) | 3:4 | 80px wide mobile, 96px desktop |

---

## Maximum Reading Width

- Body copy: **680px** (`container.prose`)
- Product descriptions: **600px**
- Form fields: **480px** (`container.form`)

**Why:** Lines longer than 75 characters reduce reading comprehension on dark backgrounds especially.

---

## Mobile Adaptations

| Desktop Pattern | Mobile Adaptation |
|-----------------|-------------------|
| 7+5 asymmetric | Stack — image top, text bottom |
| 4-column product grid | 2-column grid |
| Horizontal lookbook | Vertical scroll or horizontal swipe (one image per view) |
| Sticky PDP gallery | Vertical scroll gallery with dot indicators |
| Side navigation filters | Bottom sheet drawer |
| Hover interactions | Tap / long-press equivalents |

**Rule:** Mobile is not a compressed desktop. Mobile layouts are designed independently, then enhanced for desktop — not the reverse.

---

# SECTION 5 — Visual Components

Component styling defines the visual identity of every reusable UI element. Behavioral states and variants are documented in Document 06 (Component Inventory). This section defines **how they look**.

---

## Buttons

### Visual Identity

Buttons are **confident and rectangular** — not pills, not rounded blobs.

| Property | Primary | Secondary (Ghost) | Tertiary (Text) |
|----------|---------|-------------------|-----------------|
| Background | `#E8E4DD` (primary.default) | transparent | transparent |
| Text | `#0C0C0E` (primary.inverse) | `#F0EDE8` | `#E8E4DD` (accent) |
| Border | none | `1px solid rgba(255,255,255,0.14)` | none |
| Border radius | `2px` | `2px` | `0` |
| Height | 48px (default) / 40px (sm) / 56px (lg) | same | auto (padding only) |
| Padding | 24px horizontal | 24px horizontal | 0 |
| Font | Neue Montreal 500, 14px, uppercase, 0.08em tracking | same | same |
| Min width | 120px | 120px | — |

### States

| State | Primary | Ghost |
|-------|---------|-------|
| Hover | Background `#F2EFE9`, subtle `translateY(-1px)` | Border `rgba(255,255,255,0.25)` |
| Active | Background `#D4CFC4`, `translateY(0)` | Background `rgba(255,255,255,0.04)` |
| Disabled | Background `#2A2A32`, text `#4A4744` | Border `rgba(255,255,255,0.04)`, text `#4A4744` |
| Loading | Text hidden, centered spinner (1.5px stroke, bone color) | same |

**Why 2px radius:** Sharp corners signal editorial confidence. Pill buttons signal playful D2C (Bonkers Corner energy).

---

## Inputs

| Property | Value |
|----------|-------|
| Background | `#131316` (surface.primary) |
| Border | `1px solid rgba(255,255,255,0.08)` |
| Border (focus) | `1px solid #E8E4DD` + focus ring |
| Border (error) | `1px solid #9B3D3D` |
| Height | 48px |
| Padding | 16px horizontal |
| Radius | `2px` |
| Text | Inter 400, 16px, `#F0EDE8` |
| Placeholder | `#6B6760` |

Textarea: min-height 120px, same styling.

Select: custom chevron icon (stroke, not filled), same container styling.

---

## Cards

### Content Card (Editorial)

- Background: `#16161A`
- Border: `1px solid rgba(255,255,255,0.06)`
- Radius: `0px` — editorial cards are sharp
- Padding: 24px
- No shadow default

### Product Card

- Background: transparent (product image is the card)
- Image: 3:4 ratio, no border radius on image
- Below image: product title + price, left-aligned
- Gap between image and text: 12px
- Hover: image scale 1.02 (slow, 600ms), opacity overlay with quick-view CTA optional
- No card border or background — the photography IS the card

**Why no product card chrome:** Product cards with borders and shadows feel catalog. Image + type only feels editorial.

---

## Wishlist

- Icon: heart outline, 1.5px stroke, 20px
- Active: heart filled, `color.primary.default`
- Position: top-right of product image, 12px inset
- Background on hover: `rgba(12,12,14,0.60)` circle, 36px
- No animation bounce — subtle scale 1.0 → 1.1 on toggle

---

## Badges

| Badge | Background | Text | Usage |
|-------|------------|------|-------|
| Drop | `#3D1A24` (secondary.muted) | `#E8E4DD`, label.sm uppercase | "Drop 01", "New" |
| Limited | `#222228` | `#C4BAA8` (accent.highlight) | "Limited run" |
| Sold out | `#1A1A1F` | `#6B6760` (muted) | "Sold out" |
| GSM | transparent | `#C4BAA8`, label.md | "450 GSM" on PDP |

**Never:** "Best Seller", "Trending", "Hot", "Sale", "% Off"

Radius: `0px` — rectangular badges match button language.

---

## Chips (Filters / Tags)

- Background: `#1A1A1F`
- Border: `1px solid rgba(255,255,255,0.08)`
- Text: `type.label.md` uppercase, `color.text.secondary`
- Height: 32px
- Padding: 12px horizontal
- Active: border `color.primary.default`, text `color.text.accent`
- Radius: `2px`

---

## Navbar

### Default (Top of Page)

- Background: transparent
- Position: fixed top, full width, z-index 100
- Height: 64px mobile / 72px desktop
- Logo: left, wordmark in Neue Montreal, lowercase
- Links: center-left, `type.label.lg` uppercase
- Cart/Wishlist/Account: right, icon + count badge
- No border bottom

### Scrolled State

- Background: `color.glass.background` + `backdrop-filter: blur(20px)`
- Border bottom: `1px solid rgba(255,255,255,0.06)`
- Transition: 300ms ease

### Mobile

- Hamburger left (or logo center), cart right
- Full-screen overlay menu: `color.overlay.heavy` background
- Links: `type.display.md` size, stacked vertically, left-aligned
- Menu open: body scroll locked (Lenis stop)

---

## Footer

- Background: `color.surface.tertiary` (`#222228`)
- Padding: 64px top, 32px bottom
- Layout: 4-column desktop (logo+tagline, shop links, info links, newsletter), stack mobile
- Logo: wordmark, lowercase
- Links: `type.body.sm`, `color.text.secondary`, hover `color.text.accent`
- Tagline: `type.body.sm`, `color.text.muted` — appears once
- No payment badge wall — minimal trust icons if needed
- Border top: `1px solid rgba(255,255,255,0.04)`

---

## Dropdown

- Background: `#1A1A1F`
- Border: `1px solid rgba(255,255,255,0.08)`
- Shadow: `shadow.medium`
- Radius: `2px`
- Item height: 40px
- Item hover: `color.interactive.hover`
- Item active: `color.text.accent`

---

## Search

- Trigger: icon in navbar, 20px stroke
- Input: full-width overlay or expanded navbar center
- Background: `color.surface.secondary`
- Results: dropdown below input, product result = thumbnail (48px) + title + price
- Empty state: "No pieces found." — `type.body.sm`, muted
- No popular searches spam

---

## Filters

- Desktop: horizontal chip row above product grid — not sidebar
- Mobile: "Filter" button opens bottom drawer
- Drawer: `color.surface.secondary` background, slide up, 80vh max
- Apply button: primary button, sticky bottom
- Clear: ghost text button, left of apply

**Why no sidebar filters:** Sidebar + grid is the generic ecommerce layout Document 01 bans.

---

## Sidebar (Admin Only)

- Background: `color.surface.tertiary`
- Width: 240px fixed
- Border right: `1px solid rgba(255,255,255,0.06)`
- Nav items: `type.body.sm`, icon + label
- Active: left border 2px `color.primary.default`, background `color.interactive.hover`

Customer-facing shop has no sidebar.

---

## Drawer (Cart)

- Position: right slide-in
- Width: 420px desktop / 100% mobile
- Background: `color.surface.primary`
- Border left: `1px solid rgba(255,255,255,0.06)`
- Shadow: `shadow.large`
- Overlay: `color.overlay.medium`
- Header: "Your selection" — `type.heading.sm`
- Sticky footer: subtotal + primary CTA "Complete order"
- Enter animation: slide from right, 400ms, heavy ease
- Exit animation: slide to right, 300ms

---

## Modal

- Background: `color.surface.secondary`
- Border: `1px solid rgba(255,255,255,0.08)`
- Shadow: `shadow.large`
- Radius: `2px`
- Max width: 560px (confirm) / 800px (gallery)
- Overlay: `color.overlay.medium`
- Close: top-right X icon, 24px, no background circle
- Enter: fade + scale 0.98 → 1.0, 300ms
- Focus trap required for accessibility

---

## Accordion (FAQ)

- Border bottom: `1px solid rgba(255,255,255,0.06)`
- Question: `type.body.md`, `color.text.primary`, 56px min height
- Answer: `type.body.sm`, `color.text.secondary`, padding bottom 24px
- Icon: chevron down, 1.5px stroke, rotates 180° on open
- Animation: height auto with 300ms ease — Framer Motion `AnimatePresence`

---

## Reviews (Future)

- Star icon: 16px, stroke, `color.primary.muted` filled state
- Review text: `type.body.sm`, `color.text.secondary`
- Author: `type.label.md` uppercase
- Not prioritized Day 1 — styling reserved

---

## Tables (Admin)

- Header: `type.label.md` uppercase, `color.text.muted`, background `color.surface.tertiary`
- Row: `type.body.sm`, border bottom `color.border.subtle`
- Row hover: `color.interactive.hover`
- Cell padding: 12px 16px
- Numeric columns: JetBrains Mono, right-aligned

---

## Dashboard Cards (Admin)

- Background: `color.card.background`
- Border: `color.card.border`
- Radius: `2px`
- Padding: 24px
- Stat number: `type.heading.lg`, Neue Montreal
- Stat label: `type.label.md`, muted
- No chart colors brighter than semantic palette

---

# SECTION 6 — Image Direction

## Photography Standards

### Campaign Images

- Full production value — directed, lit, graded
- Unified color grade per drop (e.g., warm desaturated, cool high-contrast)
- Environments: urban India — concrete, metal, glass, night, overcast day
- Subjects: 1–3 per campaign, strong presence, minimal smiling
- Resolution: minimum 2400px wide for hero use

### Studio Images

- Allowed for product detail and fabric close-ups only
- Background: `#131316` or `#0C0C0E` — not white, not grey seamless
- Lighting: directional single source, visible shadow — not flat studio
- Purpose: show construction, stitching, fabric weight, hardware

### Product Images

- On-model preferred (shows drape and fit)
- Ghost mannequin acceptable for secondary angles only
- Minimum 4 images per product: front, back, detail, context
- All images color-graded to match drop campaign grade

### Editorial Images

- Candid-adjacent but directed — not snapshot
- Motion blur acceptable in campaign; not in product
- May include environmental storytelling (hands, texture, objects) without full product

---

## Cropping

| Context | Crop Rule |
|---------|-----------|
| Hero | Never crop faces awkwardly; maintain 20% headroom |
| Product card | Center on garment torso; head optional |
| Product detail | Full garment visible in at least one image |
| Detail shot | Fill frame with texture — stitch, label, fabric, zipper |
| Lookbook | Creative crops allowed — partial body, fabric focus |

---

## Lighting

- **Key light:** Directional, 30–45° — creates dimension on fabric folds
- **Fill:** Minimal — shadows are brand-appropriate
- **Avoid:** On-camera flash, ring light, flat e-commerce lighting
- **Color temperature:** 4500–5500K base, graded in post

---

## Contrast

- Photography contrast should be **medium-high** — aligns with dark UI
- Avoid low-contrast muddy images — they disappear against dark backgrounds
- Avoid over-HDR — natural contrast with deep shadows preferred

---

## Background Treatment

- Campaign: in-environment
- Product hero: dark studio or in-environment
- Product secondary: `#131316` solid
- **Never:** white background as primary presentation

---

## Hover Behavior

| Context | Hover |
|---------|-------|
| Product card | Image scale 1.02, 600ms ease-out; optional second image swap |
| Lookbook image | Subtle overlay `rgba(12,12,14,0.20)`, caption fade in |
| Campaign hero | No hover — static or scroll-driven only |
| Thumbnail gallery | Border highlight `color.border.strong`, no scale |

---

## Image Transitions

- Product image swap: crossfade 400ms
- Gallery scroll: native scroll snap on mobile; arrow nav on desktop
- Lightbox zoom: fade in overlay 300ms, image scale from click origin
- Page hero: GSAP scroll-linked opacity/scale — see Section 9

---

## Lazy Loading Strategy

| Priority | Strategy |
|----------|----------|
| Hero (above fold) | Eager load, `priority` flag, preload LCP candidate |
| First 4 product cards | Eager load |
| Below fold | Native lazy load + blur placeholder (dominant color from image) |
| Lookbook | Intersection Observer, load 1 viewport ahead |
| Placeholder | CSS `background-color` set to image dominant dark tone — no skeleton shimmer |

**Why no shimmer skeletons:** Shimmer reads as loading app, not editorial. Solid dark placeholder maintains atmosphere.

---

# SECTION 7 — Iconography

## Icon System

**Library base:** Lucide Icons (stroke-based, consistent construction)  
**Custom icons:** Logo, brand-specific symbols only — do not custom-redraw standard icons

---

## Stroke Width

| Context | Stroke |
|---------|--------|
| Default UI icons | 1.5px |
| Navigation icons | 1.5px |
| Small inline icons (badges) | 1.25px |
| Large decorative icons | 1.5px — never thicker |

**Why 1.5px:** Thinner than default 2px — feels refined. Thicker strokes feel chunky and playful.

---

## Corner Radius

Icons inherit Lucide defaults (rounded stroke caps and joins). No custom corner radius on icons.

UI containers holding icons use `2px` radius — icons themselves are not rounded.

---

## Filled vs Outlined

| State | Style |
|-------|-------|
| Default | Outlined (stroke only) |
| Active/Selected | Filled (wishlist heart, nav active indicator) |
| Disabled | Outlined, `color.text.muted` |

**Rule:** Default to outline always. Fill only for active/selected state.

---

## Icon Animation

- Toggle (wishlist): scale 1.0 → 1.15 → 1.0, 300ms — no bounce easing
- Menu open/close: rotate 0 → 90° for hamburger → X transition, 300ms
- Cart add: no flying animation — subtle badge count increment
- No icon bounce, wiggle, or shake — ever

---

## Sizes

| Token | Size | Usage |
|-------|------|-------|
| `icon.xs` | 14px | Inline with label.sm |
| `icon.sm` | 16px | Inline with body text |
| `icon.md` | 20px | Navbar, buttons, inputs |
| `icon.lg` | 24px | Modal close, standalone actions |
| `icon.xl` | 32px | Empty states, feature callouts |

---

## Usage Rules

- Icons always paired with text label in navigation (except cart/wishlist/search which are universal)
- Icon color: inherits text color of parent — never standalone accent color except active wishlist
- Minimum touch target with icon: 44×44px (padding around 20px icon)
- No emoji as icons — ever

---

## Consistency Rules

1. One icon style per context — do not mix Lucide with Phosphor or custom
2. Icons align to text baseline or vertical center — never arbitrary float
3. Directional icons (chevrons, arrows) reflect reading direction (LTR)
4. Loading spinner: 1.5px stroke, 20px diameter, bone color — not branded logo spinner

---

# SECTION 8 — Design Tokens

## Naming Convention

Tokens follow a scalable **dot-notation hierarchy**:

```
category.subcategory.property
```

### Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `color` | All color values | `color.surface.primary` |
| `space` | Spacing scale | `space.24`, `space.section.md` |
| `type` | Typography | `type.heading.lg`, `type.body.md` |
| `radius` | Border radius | `radius.none`, `radius.sm` |
| `shadow` | Box shadows | `shadow.medium` |
| `motion` | Animation timing | `motion.duration.fast`, `motion.ease.heavy` |
| `breakpoint` | Responsive breakpoints | `breakpoint.lg` |
| `container` | Max widths | `container.default` |
| `icon` | Icon sizes | `icon.md` |
| `z` | Z-index scale | `z.nav`, `z.modal` |
| `opacity` | Opacity values | `opacity.disabled` |

### Naming Rules

1. **Semantic over literal** — `color.surface.primary` not `color.gray.900`
2. **Scale uses t-shirt sizes or numeric** — `space.24` (px value) or `type.heading.lg` (semantic scale)
3. **State as suffix** — `color.text.primary`, `color.text.muted`, `color.interactive.hover`
4. **No hardcoded values in component code** — always reference tokens via Tailwind config mapping
5. **Tailwind mapping** — every token maps to a Tailwind theme extension key

---

## Complete Token Reference

### Color Tokens

```yaml
# Primary
color.primary.default: "#E8E4DD"
color.primary.hover: "#F2EFE9"
color.primary.muted: "#A8A49C"
color.primary.inverse: "#0C0C0E"

# Secondary
color.secondary.default: "#6B2D3C"
color.secondary.hover: "#7E3648"
color.secondary.muted: "#3D1A24"

# Surface
color.surface.base: "#0C0C0E"
color.surface.primary: "#131316"
color.surface.secondary: "#1A1A1F"
color.surface.tertiary: "#222228"
color.surface.elevated: "#2A2A32"

# Card
color.card.background: "#16161A"
color.card.background.hover: "#1C1C22"
color.card.border: "rgba(255,255,255,0.06)"
color.card.border.hover: "rgba(255,255,255,0.10)"

# Text
color.text.primary: "#F0EDE8"
color.text.secondary: "#9C9890"
color.text.muted: "#6B6760"
color.text.inverse: "#0C0C0E"
color.text.accent: "#E8E4DD"

# Border
color.border.default: "rgba(255,255,255,0.08)"
color.border.subtle: "rgba(255,255,255,0.04)"
color.border.strong: "rgba(255,255,255,0.14)"
color.border.focus: "#E8E4DD"

# Semantic
color.success.default: "#3D6B52"
color.warning.default: "#A07D2E"
color.error.default: "#9B3D3D"

# Overlay
color.overlay.light: "rgba(12,12,14,0.40)"
color.overlay.medium: "rgba(12,12,14,0.60)"
color.overlay.heavy: "rgba(12,12,14,0.80)"

# Glass
color.glass.background: "rgba(19,19,22,0.72)"
color.glass.border: "rgba(255,255,255,0.06)"
color.glass.blur: "20px"

# Interactive
color.interactive.hover: "rgba(255,255,255,0.04)"
color.interactive.active: "rgba(255,255,255,0.08)"
color.interactive.focus-ring: "#E8E4DD"
color.interactive.selection: "rgba(232,228,221,0.20)"
color.interactive.disabled-text: "#4A4744"
```

### Spacing Tokens

```yaml
space.4: "4px"
space.8: "8px"
space.12: "12px"
space.16: "16px"
space.24: "24px"
space.32: "32px"
space.48: "48px"
space.64: "64px"
space.96: "96px"
space.128: "128px"

space.section.xs: "48px / 64px"   # mobile / desktop
space.section.sm: "64px / 96px"
space.section.md: "96px / 128px"
space.section.lg: "128px / 160px"
space.section.xl: "160px / 200px"
```

### Radius Tokens

```yaml
radius.none: "0px"      # Product cards, editorial cards, badges
radius.sm: "2px"        # Buttons, inputs, modals, chips
radius.md: "4px"        # Reserved — admin cards only if needed
radius.full: "9999px"   # Avatar circles only — nowhere else
```

**Why almost no radius:** Sharp edges are editorial. The only circles are avatars/account.

### Shadow Tokens

```yaml
shadow.subtle: "0 1px 2px rgba(0,0,0,0.40)"
shadow.medium: "0 4px 16px rgba(0,0,0,0.50)"
shadow.large: "0 8px 32px rgba(0,0,0,0.60)"
shadow.elevated: "0 16px 48px rgba(0,0,0,0.70)"
```

### Motion Tokens

```yaml
motion.duration.instant: "100ms"
motion.duration.fast: "200ms"
motion.duration.normal: "300ms"
motion.duration.slow: "400ms"
motion.duration.heavy: "600ms"
motion.duration.glacial: "900ms"

motion.ease.default: "cubic-bezier(0.25, 0.1, 0.25, 1.0)"
motion.ease.out: "cubic-bezier(0.0, 0.0, 0.2, 1.0)"
motion.ease.in: "cubic-bezier(0.4, 0.0, 1.0, 1.0)"
motion.ease.heavy: "cubic-bezier(0.76, 0.0, 0.24, 1.0)"
motion.ease.expo-out: "cubic-bezier(0.16, 1.0, 0.3, 1.0)"

motion.distance.sm: "12px"
motion.distance.md: "24px"
motion.distance.lg: "48px"
```

### Z-Index Tokens

```yaml
z.base: 0
z.content: 10
z.sticky: 50
z.nav: 100
z.drawer: 200
z.modal: 300
z.toast: 400
z.overlay: 500
```

### Opacity Tokens

```yaml
opacity.disabled: 0.40
opacity.muted: 0.60
opacity.overlay: 0.80
opacity.hover: 0.04   # Used in rgba calculation
```

### Container Tokens

```yaml
container.full: "100%"
container.wide: "1440px"
container.default: "1200px"
container.narrow: "800px"
container.prose: "680px"
container.form: "480px"
```

### Breakpoint Tokens

```yaml
breakpoint.xs: "375px"
breakpoint.sm: "640px"
breakpoint.md: "768px"
breakpoint.lg: "1024px"
breakpoint.xl: "1280px"
breakpoint.2xl: "1536px"
```

---

# SECTION 9 — Motion-Aware UI

## Motion Philosophy

Motion in PREPPY LOSERS is **heavy, intentional, and editorial**. Elements do not bounce, wiggle, or spring. They arrive with weight — like fabric falling into place.

Motion serves three purposes:
1. **Reveal** — content enters with pacing, not all at once
2. **Orient** — transitions show where elements come from and go to
3. **Reward** — subtle feedback confirms interaction without performance

### Motion Principles

| Principle | Rule |
|-----------|------|
| **Mass** | Elements feel like they have weight — slow ease-out, no spring physics |
| **Restraint** | One animated element per viewport moment — not everything moves at once |
| **Scroll-led** | Primary motion is scroll-driven (GSAP ScrollTrigger + Lenis) — not auto-play |
| **Reduced motion** | `prefers-reduced-motion: reduce` disables all non-essential animation |
| **Performance** | Animate `transform` and `opacity` only — never `width`, `height`, `top`, `left` |

---

## Technology Roles

| Library | Role |
|---------|------|
| **Lenis** | Smooth scroll foundation — all scroll-driven motion builds on Lenis instance |
| **GSAP + ScrollTrigger** | Scroll-linked reveals, parallax, section pinning, timeline sequences |
| **Framer Motion** | Component-level state transitions (cart, modal, accordion, page transitions) |
| **SplitType** | Display typography line/word/char splitting for reveal animations |

---

## Button Motion

| Interaction | Animation |
|-------------|-----------|
| Hover | `translateY(-1px)`, 200ms, `motion.ease.out` |
| Active/Press | `translateY(0)`, 100ms |
| Loading → Loaded | Spinner fade out, text fade in, 200ms crossfade |
| Disabled | No animation — static |

Framer Motion: `whileHover={{ y: -1 }}`, `whileTap={{ y: 0 }}`, `transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}`

**No:** scale bounce, ripple effects, magnetic cursor follow

---

## Card Reveal

| Context | Animation |
|---------|-----------|
| Product grid scroll enter | Stagger fade-up: opacity 0→1, translateY 24px→0, 600ms, 100ms stagger per card |
| Editorial card | Fade in only, 400ms — no translate (image is hero enough) |
| Hover | Image scale 1.02, 600ms `motion.ease.heavy` |

GSAP ScrollTrigger: `trigger: cardGrid`, `start: "top 85%"`, stagger 0.1

---

## Image Transitions

| Context | Animation |
|---------|-----------|
| Hero load | Scale 1.05→1.0 + opacity 0→1, 900ms, `motion.ease.expo-out` |
| Product image swap | Crossfade, 400ms |
| Scroll parallax (campaign) | TranslateY at 0.15× scroll speed — subtle, not nauseating |
| Lightbox open | Overlay fade 300ms + image scale 0.95→1.0 |

---

## Typography Reveals

| Context | Animation |
|---------|-----------|
| Hero headline | SplitType line split → each line translateY 100%→0, opacity 0→1, stagger 150ms, 900ms total |
| Section title scroll enter | SplitType word split → fade up per word, 600ms, triggered at 80% viewport |
| Body copy | Simple fade in, 400ms — no split (readability) |
| Label above section title | Fade in 200ms before title animation starts |

SplitType config: `types: 'lines'` for display, `types: 'words'` for headings

**Reduced motion fallback:** All text visible immediately, no split.

---

## Section Enter

| Section Type | Animation |
|--------------|-----------|
| Full-bleed image section | Image scale 1.08→1.0 on scroll enter, 900ms scrub via ScrollTrigger |
| Text + image split | Image from left (translateX -24px→0), text from right (translateX 24px→0), simultaneous 600ms |
| Product grid | Stagger card reveal (see Card Reveal) |
| Statement text (manifesto) | Line-by-line fade, 200ms stagger, pin section optional |

ScrollTrigger defaults: `start: "top 80%"`, `end: "bottom 20%"`, `toggleActions: "play none none reverse"`

---

## Navigation Changes

| State | Animation |
|-------|-------------|
| Page load | Nav fade in, 400ms, delay 200ms after hero |
| Scroll past hero | Background glass fade in, 300ms |
| Mobile menu open | Links stagger fade-up, 50ms stagger, 400ms total |
| Mobile menu close | Reverse stagger, 300ms |
| Active link change | Underline width 0→100%, 200ms (underline: 1px, bone color) |

Lenis: `stop()` on menu open, `start()` on close

---

## Product Animations

| Interaction | Animation |
|-------------|-----------|
| Size selector | Border color transition 200ms; selected scale none |
| Add to cart click | Button text flash "Added" 800ms → revert; cart badge count increment |
| Image gallery scroll | Scroll snap with smooth Lenis |
| Fabric detail expand | Accordion height 300ms ease |

**No:** flying product thumbnail to cart, confetti, celebration animations

---

## Cart Opens

| Phase | Animation |
|-------|-------------|
| Overlay | Fade in 300ms |
| Drawer | TranslateX 100%→0, 400ms, `motion.ease.heavy` |
| Cart items | Stagger fade-in, 50ms stagger |
| Close | Reverse drawer 300ms, then overlay fade 200ms |

Framer Motion: `AnimatePresence` on drawer mount, `initial={{ x: "100%" }}`, `animate={{ x: 0 }}`, `exit={{ x: "100%" }}`

---

## Modal Appear

| Phase | Animation |
|-------|-------------|
| Overlay | Fade 0→1, 300ms |
| Modal | Opacity 0→1 + scale 0.98→1.0, 300ms, `motion.ease.out` |
| Close | Reverse, 200ms — faster exit than enter |

Focus trap activates after animation completes (300ms delay).

---

## Loading Behavior

| Context | Treatment |
|---------|-----------|
| Initial page load | Dark screen (`color.surface.base`) → hero fade in. No white flash. No spinner on first load |
| Route transition | Fade out 200ms → fade in 300ms. Content swaps under overlay |
| Image loading | Dominant color placeholder → crossfade to image 400ms |
| Button loading | Inline spinner replaces text, same button dimensions (no layout shift) |
| Skeleton | **Not used** — dark placeholders only |
| Drop page launch | Minimal pulsing dot + "Loading drop" text if needed — no branded animation |

---

## Page Transitions

| Transition | Animation |
|------------|-------------|
| Standard navigation | Outgoing fade 200ms, incoming fade 300ms with 50ms delay |
| Collection → PDP | Shared element transition on product image (Framer Motion `layoutId`) optional |
| Homepage scroll | Continuous scroll via Lenis — no hard page breaks between sections |

GSAP page transitions for campaign microsites; Framer Motion `AnimatePresence` for route changes in Next.js App Router.

---

## Motion Do / Don't Summary

| Do | Don't |
|----|-------|
| Scroll-driven reveals | Auto-playing carousels |
| Heavy ease-out curves | Spring/bounce physics |
| Opacity + transform only | Layout-triggering animations |
| Stagger for groups | Everything animates simultaneously |
| 600–900ms for hero moments | Sub-100ms micro-jitter |
| Respect reduced motion | Force animation regardless of preference |

---

# SECTION 10 — Creative Constraints

These visual constraints inherit from Document 01 Design Constraints and add visual-specific rules for designers and developers.

## Always Do

| Rule | Why |
|------|-----|
| Use layered dark surfaces, not flat black | Creates depth and premium atmosphere |
| Lead every page with photography or display typography | Campaign-first hierarchy |
| Maintain 8px spacing grid | Visual consistency and developer alignment |
| Use bone/stone accent (`#E8E4DD`) for primary interactions | On-brand preppy materiality |
| Keep border radius at 0–2px | Editorial sharpness |
| Design mobile-first at 375px | India market reality |
| Use Neue Montreal for display, Inter for body | Two-typeface discipline |
| Show fabric/craft details in visual hierarchy before price | Document 01 USP |
| Use uppercase tracking for labels and navigation | Editorial fashion convention |
| Animate with mass and restraint | Premium motion language |
| Test all color combinations for WCAG AA contrast | Accessibility > 95 target |
| Use real photography with unified grade per drop | Authenticity and craft proof |

---

## Never Do

| Rule | Why |
|------|-----|
| Never use pure `#000000` as page background | Flat, lifeless — use `#0C0C0E` |
| Never use pure `#FFFFFF` as text color | Harsh — use `#F0EDE8` |
| Never use bright saturated colors (neon, primary red/blue/green) | Breaks underground premium atmosphere |
| Never use gradients as backgrounds | Reads SaaS/startup — Document 01 ban |
| Never use pill/rounded-full buttons | Playful D2C — not editorial |
| Never use white product backgrounds | Catalog, not campaign |
| Never use skeleton shimmer loaders | Breaks dark editorial atmosphere |
| Never use bounce/spring animation easing | Playful — not premium |
| Never use more than 2 typefaces customer-facing | Typographic restraint |
| Never use emoji in UI | Document 01 voice ban |
| Never use sale/discount visual language (red prices, strikethrough, % badges) | Destroys premium positioning |
| Never use carousel/slider as homepage hero | Marketplace pattern — not campaign |
| Never use stock photography | Authenticity requirement |
| Never use drop shadows on every card | Shadow is for floating elements only |
| Never use light mode | Mass-market signal in this brand context |
| Never use ALL CAPS display headlines | Shouting — lowercase/sentence case only |
| Never use exclamation marks in UI copy | Premium restraint |

---

# SECTION 11 — Homepage Visual Rhythm

This section describes the visual pacing of the homepage — not a wireframe, but the **emotional and visual sequence** a visitor experiences on scroll.

## Rhythm Map

```
01. HERO
    ↓ full viewport, campaign image, display type, minimal UI
02. CAMPAIGN STATEMENT
    ↓ manifesto line or drop intro, narrow prose width, breathing room
03. BREATHING SPACE
    ↓ intentional void — 160–200px vertical space, no content
04. FEATURED DROP / PRODUCTS
    ↓ 2–4 hero products, large imagery, asymmetric grid
05. BRAND STORY FRAGMENT
    ↓ single image + single statement, asymmetric 5+7 split
06. LOOKBOOK / EDITORIAL GALLERY
    ↓ mixed aspect ratios, minimal captions, scroll-driven reveal
07. CRAFT / FABRIC STATEMENT
    ↓ texture close-up, GSM callout, material philosophy
08. BREATHING SPACE
    ↓ second void before conversion ask
09. NEWSLETTER / DROP ALERT
    ↓ minimal signup, insider language, not marketing spam
10. FOOTER
    ↓ quiet close, tertiary surface, links + tagline once
```

---

## Section-by-Section Rationale

### 01. Hero

- **Visual:** Full-viewport campaign photograph. Display XL headline — lowercase. Optional scroll indicator (thin line, animated pulse)
- **Emotional beat:** Intrigue — "What is this?"
- **Why first:** Document 01 — brand understood in 5 seconds. Hero IS the brand. No products, no nav clutter, no announcements

### 02. Campaign Statement

- **Visual:** Narrow prose container (680px). Manifesto line or current drop statement. Label above: "Drop 01" in muted uppercase
- **Emotional beat:** Conviction — the brand has a point of view
- **Why here:** After visual intrigue, one sentence of truth. Not a paragraph — a statement

### 03. Breathing Space

- **Visual:** Nothing. Empty dark surface.
- **Emotional beat:** Respect — the brand doesn't need to shout
- **Why here:** Prevents the "marketplace scroll" feeling. Void creates anticipation for products

### 04. Featured Drop / Products

- **Visual:** 2 products mobile / 3–4 desktop. Large 3:4 images. Title + price below. "View drop" CTA
- **Emotional beat:** Desire — the product is the focus
- **Why here:** User is primed for product after brand establishment — not before

### 05. Brand Story Fragment

- **Visual:** Asymmetric split — image dominates (7 cols), text minimal (5 cols). One line from manifesto
- **Emotional beat:** Identity — "This brand thinks like I do"
- **Why here:** Mid-scroll re-engagement. Prevents pure commerce feeling after product grid

### 06. Lookbook / Editorial Gallery

- **Visual:** Mixed grid — one large (8 col), two small (4 col each), full-bleed on mobile stack
- **Emotional beat:** Immersion — entering the campaign world fully
- **Why here:** Lookbook is the reward for scrolling. It deepens desire without selling

### 07. Craft / Fabric Statement

- **Visual:** Extreme close-up texture photograph. GSM badge. One factual line: "450 GSM heavyweight fleece"
- **Emotional beat:** Trust — quality is real and visible
- **Why here:** Document 01 USP — fabric is the hero. Visual proof before checkout intent

### 08. Breathing Space

- **Visual:** Second void. Optional: subtle scroll-triggered fade of brand wordmark at low opacity
- **Emotional beat:** Pause before the ask
- **Why here:** Newsletter signup must not feel like a pop-up. Space before ask = respect

### 09. Newsletter / Drop Alert

- **Visual:** Single line input + primary button. Copy: "Get drop alerts." Not "Subscribe to our newsletter!!!"
- **Emotional beat:** Insider access — optional, not forced
- **Why here:** End of journey — user who scrolled this far is qualified. No mid-page pop-ups

### 10. Footer

- **Visual:** Tertiary surface. Logo, links, tagline once, copyright
- **Emotional beat:** Quiet close
- **Why here:** Footer is exit, not conversion. Minimal, functional, on-brand

---

## Pacing Principles

| Principle | Application |
|-----------|-------------|
| **Image → Void → Content → Void → Ask** | Alternating density creates rhythm |
| **Never 3 commerce sections consecutively** | Break with editorial or void |
| **Display type appears max 2 times** | Hero + one statement section — not every section |
| **Products appear twice max on homepage** | Featured drop + optional second mention in footer nav |
| **Scroll depth target:** 6–8 screen heights | Long enough for immersion, short enough to hold attention |

---

# SECTION 12 — Premium References

Study these references for specific craft lessons. **Do not copy layouts, colors, or content directly.**

---

## Typography

| Reference | URL / Source | Learn |
|-----------|--------------|-------|
| **032c** | 032c.com | Scale contrast between display and body; cultural seriousness in type treatment |
| **Bottega Veneta (Campaign)** | Campaign archives | Logo-less confidence; letting product and type breathe |
| **SSENSE** | ssense.com | Clean product titles, minimal price styling, uppercase navigation |
| **A-COLD-WALL*** | acoldwall.com | Architectural type placement, asymmetric headline positioning |

**Apply to PREPPY LOSERS:** Display type at scale, lowercase conviction, uppercase labels only for metadata/nav.

---

## Motion

| Reference | Learn |
|-----------|-------|
| **Locomotive.ca** | Scroll-driven storytelling pacing, section transition rhythm |
| **Active Theory (Netflix projects)** | Cinematic reveal timing, heavy ease curves |
| **Represent.com** | Restrained product hover, scroll-linked image treatment |
| **Instrument.com** | Page transition subtlety, loading behavior |

**Apply to PREPPY LOSERS:** ScrollTrigger section reveals, Lenis smooth scroll, no bounce.

---

## Layout

| Reference | Learn |
|-----------|-------|
| **Dept® (Work)** | Agency-level grid discipline, asymmetric editorial layouts |
| **Basic/Agency** | Minimal navigation, full-bleed imagery, content hierarchy |
| **Almost Gods** | Indian premium streetwear layout ambition — study, differentiate |
| **Fear of God** | Spacing discipline, product-as-hero grid |

**Apply to PREPPY LOSERS:** 7+5 splits, full-bleed heroes, generous section spacing.

---

## Photography

| Reference | Learn |
|-----------|-------|
| **Represent Campaigns** | Dark environment product photography, oversized silhouette emphasis |
| **A-COLD-WALL* Lookbooks** | Material texture close-ups, architectural environments |
| **Stüssy Archives** | Subcultural authenticity in casting and location |
| **Indian fashion editorials (Vogue India, i-D India)** | Local casting and environments at global production quality |

**Apply to PREPPY LOSERS:** Dark grade, texture proof, Indian metro environments.

---

## Luxury

| Reference | Learn |
|-----------|-------|
| **Bottega Veneta** | Material-first, logo-last visual hierarchy |
| **Jil Sander** | Negative space as luxury signal |
| **Acne Studios** | Ecommerce clarity within editorial brand |
| **Bluorng** | Indian luxury streetwear photography baseline — exceed, don't imitate |

**Apply to PREPPY LOSERS:** Whitespace, material focus, no logo hero.

---

## Streetwear

| Reference | Learn |
|-----------|-------|
| **Palace (Drop pages)** | Drop event visual treatment, sold-out states |
| **Stüssy** | Community authenticity, campaign-as-culture |
| **Unknown London** | Underground energy in visual tone |
| **Six5Six Street** | Indian streetwear graphic energy — learn what to avoid (graphic overload) |

**Apply to PREPPY LOSERS:** Drop culture visual language without graphic-heavy identity.

---

## Interaction

| Reference | Learn |
|-----------|-------|
| **SSENSE** | Filter UX without sidebar dominance, clean search |
| **Represent** | Cart drawer behavior, checkout atmosphere |
| **Apple.com (Product pages)** | Scroll-linked product storytelling structure |
| **Linear.app** | Dark UI interaction polish, keyboard/accessibility patterns |

**Apply to PREPPY LOSERS:** Drawer cart, dark checkout, scroll-linked PDP craft section.

---

## What We Explicitly Do NOT Reference

| Reference | Why Not |
|-----------|---------|
| **Bonkers Corner** | Mass-market promotional energy — opposite of positioning |
| **Snitch** | Volume-catalog UX patterns |
| **Bewakoof / Souled Store** | Pop culture / discount visual language |
| **Shopify themes (Dawn, Impulse)** | Generic ecommerce — primary anti-pattern |
| **Nike.com** | Corporate sportswear — different category energy |

---

## Strategic Implications for Downstream Documents

| Document | Key Inheritance from Visual Direction |
|----------|---------------------------------------|
| **03. Motion Design** | Expand Section 9 into full timing/easing system |
| **04. UX Principles** | Layout, rhythm, and component behavior rules |
| **06. Component Inventory** | Visual styling from Section 5 as baseline |
| **07. Design Tokens** | Complete token set from Section 8 |
| **09. Technology Decisions** | Tailwind config, font loading, GSAP/Lenis/Framer setup |
| **10. Development Roadmap** | Design tokens + core components before page builds |

---

## Decision Log

| Decision | Rationale | Alternatives Considered | Why Rejected |
|----------|-----------|------------------------|--------------|
| Layered dark surfaces vs flat black | Depth and premium atmosphere | Pure `#000000` everywhere | Lifeless, developer-default feeling |
| Bone/stone accent vs bright accent | Preppy materiality, underground restraint | Neon green, red, gold | Cliché streetwear or Ivy League signals |
| Neue Montreal + Inter | Editorial + readable; two-face discipline | Geist only, Satoshi only | Geist too tech; single face lacks hierarchy contrast |
| 2px border radius | Editorial sharpness | 8px rounded, pill buttons | Playful D2C energy |
| Lucide icons 1.5px stroke | Refined, consistent | Phosphor, custom icons, 2px stroke | Inconsistency; chunky feeling |
| No skeleton shimmer | Maintains dark editorial atmosphere | Standard skeleton loaders | Breaks brand atmosphere during load |
| Horizontal filters vs sidebar | Avoids generic ecommerce layout | Left sidebar filter panel | Document 01 banned pattern |
| Scroll-driven motion primary | Editorial pacing, user-controlled | Auto-play animations | Feels cheap, performance-heavy, accessibility risk |
| Sharp product cards (no chrome) | Photography as card | Bordered/shadowed product cards | Catalog feeling |
| 680px prose width | Optimal dark-background readability | Full-width body text | Line length hurts comprehension |

---

## Approval Checklist

Before proceeding to Document 03 (Motion Design Language), confirm alignment on:

- [ ] Creative direction and visual philosophy
- [ ] Color system (all tokens, semantic colors, accessibility)
- [ ] Typography system (fonts, scale, contextual rules)
- [ ] Layout system (grid, containers, breakpoints, editorial layouts)
- [ ] Visual component styling (all components)
- [ ] Image direction and lazy loading strategy
- [ ] Iconography system
- [ ] Design tokens and naming convention
- [ ] Motion-aware UI patterns
- [ ] Creative constraints (Always Do / Never Do)
- [ ] Homepage visual rhythm
- [ ] Premium references

---

## Next Document

**03. Motion Design Language** — Full animation philosophy, easing system, scroll choreography, and micro-interaction specifications expanding Section 9 of this document.

*Awaiting approval before proceeding.*
