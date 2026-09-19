---
name: high-contrast-ui
description: Enforces a highly legible, modern, vibrant UI across all pages with strong foreground/background contrast, WCAG-compliant ratios, bold-but-harmonious saturated palettes, clear typographic hierarchy, generous whitespace, and unambiguous interactive states (hover/active/focus/disabled/success/warning/error). Activates whenever writing, editing, reviewing, or auditing any React/Inertia page, component, Tailwind class, CSS file, or Blade template in this project, and when a user reports UI that looks low-contrast, muddy, cluttered, illegible, or hard to scan. Complementary to pulsecare-design-system (tokens) and pulsecare-inertia-patterns (CRUD plumbing). Read before touching any visual/CSS/spacing/typography in any page.
---

# High-Contrast, Vibrant, Highly Legible UI

**Applies to every page, component, and Blade template in this application — no exceptions.** If you touch visual presentation (color, type, spacing, borders, states), this skill applies. It layers _contrast/legibility/accessibility_ rules on top of the token map in `pulsecare-design-system`.

## When to Apply

Activate this skill whenever you are about to:

- Add or modify a React/Inertia page under `resources/js/pages/**`
- Add or modify a reusable UI component under `resources/js/components/**`
- Add or modify a Tailwind class, `tailwind.config.js`, or CSS file
- Add or modify a Blade template or layout under `resources/views/**`
- Style buttons, inputs, cards, navigation, alerts, badges, or status indicators
- Fix a reported "hard to read", "low contrast", "muddy", "cluttered", "can't tell what's clickable", or "WCAG/accessibility" issue

If a change is purely backend/logic with no visual output, this skill does not apply.

---

## The Three Non-Negotiables

Every screen must satisfy all three. If a design choice breaks any one, reject it.

1. **Legibility first.** Body text is readable at arm's length in a bright hospital room. No thin fonts, no near-surface text, no tiny labels carrying meaning.
2. **Contrast is structural, not decorative.** Foreground/background contrast is the primary mechanism that makes the UI scannable and accessible. It is not optional polish.
3. **Vibrancy is earned by restraint.** Saturated colors are used _strategically_ to signal importance. A page full of saturated colors has no hierarchy.

---

## Color & Contrast

### WCAG Minimums

- **Normal text** (below ~18pt / 24px): **≥ 4.5:1** contrast against its background.
- **Large text** (≥ 18pt / 24px, or ≥ 14pt / 18.66px bold): **≥ 3:1**.
- **UI components & graphical objects** (borders, icons, input outlines, status dots that carry meaning): **≥ 3:1** against the adjacent color.
- **Primary CTAs**: aim for **≥ 4.5:1** between the button background and its label text.
- Target **AA** as the floor; reach **AAA** for body text where a token allows it.

### Rules

- **Never place text below the minimums above.** If a token pair fails 4.5:1 for the intended size, swap the foreground for a darker/lighter token or the background for a contrasting one — do not shrink the text to pass.
- **No low-contrast text on surfaces.** Body text on `#FFFFFF` / `#F8FAFC` must be at least `#334155` (secondary slate); muted `#64748B` is for tertiary/metadata only, never for primary content or form labels.
- **No muddy colors.** Desaturated, grayed, or "off"-looking tints that fight the eye are violations. Colors should read as clean and intentional. A hue that looks gray-brown instead of the saturated intent is a bug — pick the pure hue or a deliberate dark/light variant.
- **Saturated accents are strategic, not decorative.** Reserve saturated/primary/secondary/tertiary for: the primary CTA, active selection, focus rings, key data values, and semantic status. Do not color every surface. A screen should have a small number of saturated anchors around calm neutrals.
- **Harmony over rainbow.** A bold-but-harmonious palette means 1–2 saturated anchor hues plus a consistent neutral scale. Introducing a clashing off-brand hue is a violation.
- **No excessive gradients.** At most a single subtle tonal gradient on a primary CTA or header accent. Multi-stop, busy, or low-contrast gradient text/fills are violations. Prefer flat tokens.
- **No visual clutter / unnecessary decoration.** Every color, border, shadow, and icon must carry operational meaning. Remove decoration that adds nothing to scannability.
- **No overly thin fonts.** Minimum body weight is **400**. Labels/headings use **500–700**. Never use 100/200/300 weights for interface text; if a large display number looks too light, bump it to 600/700.

### Contrast Self-Check

Before finalizing any color pair, mentally verify:

- Would a 40-year-old read this at a glance in direct fluorescent light? (If you can't tell the text color from the background at 50% size, it's too low-contrast.)
- Is the saturated element the _most_ prominent thing on the screen, or is it diluted by other saturated elements? (One primary anchor should dominate.)
- Does removing one color still keep the layout readable? (If yes, that color was decorative — remove it.)

---

## Typography & Hierarchy

- **Clear hierarchy.** Every page has one dominant heading, then a measurable step-down for sub-headings and body. If two elements fight for "top" prominence, fix the scale.
- **Bold headings.** Section and page titles use **600–700** weight and a clearly larger size than body (a ≥ 1.5× ratio between adjacent levels).
- **Readable body.** Body text is **≥ 13px / 400 weight** with **≥ 1.5 line-height**. Never set body to 11px or thinner.
- **Tabular numbers** for all numeric data (`tabular-nums lining-nums`) — mandatory, from the design system.
- **Strong typographic grouping.** Use size, weight, and spacing to group related items; do not rely on color alone to signal grouping.
- **`label-sm` is uppercase** for clinical metadata. If uppercase feels too thin at 10px, bump letter-spacing to 0.05em and keep it 700 weight — never thin.

---

## Whitespace, Spacing & Visual Grouping

- **Generous whitespace.** Let elements breathe. A dense, edge-to-edge screen is a clutter violation even when every element is individually high-contrast.
- **Consistent spacing scale.** Use the 4px geometric scale (`unit-*` tokens). Ad-hoc pixel values that don't land on the scale create visual noise.
- **Strong visual grouping.** Related items share a container, a shared indent, or clear internal/external spacing. Cards group their content; card-to-card gaps are **≥ 16px** and visibly larger than the intra-card gaps (proximity creates the group).
- **Clear section separation.** Between major sections use a larger gap or a rule; within a group use the smaller gap. The ratio between "between groups" and "within group" spacing should be obvious.

---

## Interactive Elements & States

**Buttons, inputs, cards, navigation, alerts, and status indicators must be immediately distinguishable from static content.** A user should identify the interactive elements on a screen without moving their mouse.

### Prominent Primary CTAs

- The primary action on any form or page is the **most saturated, most prominent** element. It must not compete with secondary buttons or links.
- Primary CTA: solid saturated background (`#0D9488` teal or the primary token), white text, ≥ 4.5:1, 36px standard height, 4px radius.

### Required State Coverage

Every interactive component must define and render these states. A component that only has a resting style is incomplete.

| State                | Requirement                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Resting**          | Clear default appearance.                                                                                                                                                                                    |
| **Hover**            | Visible shift — darkened/lightened background, lifted shadow, or border change. Must be perceptible but not a color swap that breaks contrast.                                                               |
| **Active / pressed** | Slightly stronger than hover (darker bg or inset).                                                                                                                                                           |
| **Focus (keyboard)** | A visible, high-contrast focus ring — 2px solid accent with an offset, on a neutral background. Focus rings must meet 3:1 against the surrounding color. **Never remove focus rings; restyle them instead.** |
| **Disabled**         | Reduced but not invisible — desaturate _and_ lower opacity, **but keep ≥ 3:1** so a user can tell the control exists and is disabled. Add `aria-disabled`/`disabled`.                                        |
| **Success**          | `#10B981` family (stable/discharged). Text on it ≥ 4.5:1.                                                                                                                                                    |
| **Warning**          | `#F59E0B` family (bottleneck/transfer). Use the darker text variant `#92400E` on the amber surface for contrast.                                                                                             |
| **Error**            | `#EF4444` / `#BA1A1A` family. White or near-black text depending on bg; ≥ 4.5:1. Error states always get a strong, unambiguous visual (red border + red text + icon).                                        |

### Distinguishability

- **Buttons vs inputs vs static text:** buttons have a filled or clearly bordered background; inputs have a visible 1px border + inset; static text has neither. They must be tell-apart at a glance.
- **Navigation:** active/current items use a saturated anchor + bold weight + an underline or left-marker so the current page is unmistakable.
- **Cards:** elevated (Layer 1–3 borders/shadows from the design system) so they separate from the canvas. A card that blends into the background is a violation.
- **Alerts & status:** each semantic status pairs a tinted background + darkened matching text + a status dot/icon. Color is never the _only_ channel — pair it with a shape/icon/label (accessibility: colorblind users must still read it).
- **Links:** underlined or clearly differentiated from body text; never rely on color alone to mark a link in body copy.

---

## Checklist — Before Finishing Any UI Work

- [ ] **Contrast:** every text/bg pair ≥ 4.5:1 (body) / ≥ 3:1 (UI elements). No low-contrast text.
- [ ] **No thin fonts:** minimum 400 for body, 600+ for headings. No 100/200/300 interface weights.
- [ ] **No muddy colors:** hues are clean and intentional, not gray-brown accidents.
- [ ] **Saturated accents are strategic:** 1–2 anchor hues; the primary CTA is the most prominent element. Not a rainbow.
- [ ] **No excessive gradients / clutter / unnecessary decoration.**
- [ ] **Hierarchy:** one dominant heading per page; clear size/weight steps; strong grouping via spacing.
- [ ] **Whitespace:** consistent 4px scale; card gaps ≥ 16px; sections clearly separated.
- [ ] **Interactive states:** hover, active, focus (visible ring), disabled (still ≥ 3:1), success, warning, error all present and distinguishable.
- [ ] **Distinguishability:** buttons/inputs/cards/nav/alerts are immediately tell-apart from static content.
- [ ] **Colorblind-safe:** status uses shape/icon/label, not color alone.
- [ ] **Reads in harsh light:** legible at arm's length in a bright room; no glare-fighting light-on-light.

---

## Enforcing It in Code

1. **Read `DESIGN.md`** for the authoritative token map (per `pulsecare-design-system`), then apply this skill's contrast/legibility lens on top.
2. **Prefer tokens over raw hex.** When a token pair fails a contrast minimum, pick a different _token_ that passes — do not invent an off-scale hex.
3. **Tailwind:** use the project's color tokens / CSS variables, not arbitrary `bg-[#...]` values, so contrast choices stay reviewable and consistent.
4. **State coverage:** when you build or edit a button/input/card/nav/alert, wire up hover, focus-visible, active, disabled, and the semantic success/warning/error variants in the same pass. A component without its full state set is not done.
5. **If a fix would change color tokens globally**, that is a design-system change — coordinate it in `DESIGN.md` and the `pulsecare-design-system` skill, not as a one-off exception on a single page.
