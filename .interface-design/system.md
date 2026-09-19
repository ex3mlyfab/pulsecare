# PulseCare Interface Design System

**Codified:** 2026-09-19  
**Source:** DESIGN.md + codebase audit + domain exploration  
**Purpose:** Single source of truth for all UI decisions. Every new screen/component references this.

---

## Intent (The North Star)

**Who:** Charge nurse / triage coordinator / clinical operations director  
**When:** 05:55 before handoff, or mid-shift under fluorescent lights  
**What:** Absorb unit status in <3 seconds — census, surge risk, attention items, flow trend  
**Feel:** Clinical instrument — precise, scannable, authoritative. Not a "dashboard."

---

## Hierarchy Decisions

| Tier             | Purpose                                                        | Wins By                                                                   |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Hero (Focal)** | Shift Pulse tile — census fraction + surge bar + 6hr sparkline | Size (28px/700), contrast (primary), position (top-left), whitespace ring |
| **Secondary**    | Attention queue (2 items) + 4 KPI cards                        | Grouped right of hero, smaller (14-16px), semantic color only on values   |
| **Tertiary**     | Unit readout signals + flow chart                              | Standard card density, muted labels, data-dense                           |

**Rule:** One focal element per view. Everything else demoted deliberately.

---

## Palette (CSS Variables Only — No Arbitrary Hex)

### Structural (One Hue: Teal)

```css
--primary: #0f766e; /* Primary actions, selection, hero numbers */
--primary-foreground: #ffffff;
--primary/10: rgba(15, 118, 110, 0.1); /* Icon backgrounds, subtle fills */
--ring: #0f766e; /* Focus rings */
```

### Semantic Quartet (Clinical Meaning Only)

| Role                                    | Token                                                                   | Use For                                                     |
| --------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| Stable / Discharged / Flow              | `--stable` `#047857` + `--stable-surface` `--stable-border`             | Discharge counts, throughput gains, "on plan"               |
| Bottleneck / Transfer Pending / Warning | `--bottleneck` `#b45309` + `--bottleneck-surface` `--bottleneck-border` | Pending transfers, "watch closely", median LOS above target |
| Critical / ICU / High Acuity            | `--critical` `#4338ca` + `--critical-surface` `--critical-border`       | Average acuity, rapid response triggers                     |
| Urgent / Code Red / Mortality Risk      | `--urgent` `#b91c1c` + `--urgent-surface` `--urgent-border`             | Divert status, active alerts, critical census               |

### Surfaces (Same Hue, Shifting Lightness)

```css
--background: #f8fafc; /* Canvas (Layer 0) */
--card: #ffffff; /* Cards, tables, modals (Layer 1) */
--muted: #f1f5f9; /* Table headers, inset panels (Layer 2) */
--accent: #f1f5f9; /* Hover states */
--border: #e2e8f0; /* Standard borders */
--input: #64748b; /* Input borders */
```

### Text Hierarchy (Four Levels)

```css
--foreground: #0f172a; /* Primary: headlines, values */
--muted-foreground: #64748b; /* Secondary: labels, metadata */
--muted-foreground/60:        /* Tertiary: helper text, timestamps */ --muted-foreground/40:
    /* Muted: disabled, placeholders */;
```

**Dark mode:** Values inverted in `app.css` — same tokens, shifted lightness.

---

## Depth Strategy: Outline-Based (Layer 0–3)

| Layer | Elements                                  | Border                    | Shadow                                                                           |
| ----- | ----------------------------------------- | ------------------------- | -------------------------------------------------------------------------------- |
| 0     | Page canvas                               | —                         | —                                                                                |
| 1     | Cards, dense tables, KPI tiles            | `1px solid var(--border)` | `0 1px 2px 0 rgba(15,23,42,0.04)`                                                |
| 2     | Dropdowns, popovers, hover cards          | `1px solid #cbd5e1`       | `0 4px 12px -2px rgba(15,23,42,0.08), 0 2px 4px -1px rgba(15,23,42,0.04)`        |
| 3     | Modals, urgent drawers, census inspectors | `1px solid #94a3b8`       | `0 12px 24px -4px rgba(15,23,42,0.16)` + backdrop `rgba(15,23,42,0.4)` blur(2px) |

**Critical Status Flasher:** Border shifts to `2px solid var(--urgent)` + optional subtle pulse. Elevation stays flat.

**No drop shadows as primary depth.** Borders survive hospital glare; shadows don't.

---

## Typography

**Font:** Inter (via `--font-sans`)

### Type Scale (Ratio ~1.25 from 14px base)

| Token           | Size | Weight | Line Height | Tracking | Use For                                                |
| --------------- | ---- | ------ | ----------- | -------- | ------------------------------------------------------ |
| `display-lg`    | 32px | 600    | 40px        | -0.02em  | Page titles (rare)                                     |
| `headline-lg`   | 24px | 600    | 32px        | -0.015em | Section headlines                                      |
| `headline-md`   | 20px | 600    | 28px        | -0.01em  | Card titles                                            |
| `headline-sm`   | 16px | 600    | 24px        | -0.005em | Sub-section titles                                     |
| `body-lg`       | 15px | 400    | 22px        | 0        | Body copy                                              |
| `body-md`       | 13px | 400    | 18px        | 0        | Table cells, form labels                               |
| `body-sm`       | 12px | 400    | 16px        | 0.005em  | Dense metadata                                         |
| `tabular-kpi`   | 28px | 700    | 32px        | -0.02em  | **Hero numbers (census, totals)**                      |
| `tabular-dense` | 12px | 500    | 16px        | 0        | Table numbers, inline counts                           |
| `label-md`      | 12px | 600    | 16px        | 0.02em   | Category labels (uppercase)                            |
| `label-sm`      | 10px | 700    | 12px        | 0.05em   | **Clinical metadata: ACUITY TIER, PACU HOLD, LOS HRS** |

### Three-Lever Hierarchy (Every Text Element)

1. **Weight:** 600 (values) / 500 (labels) / 400 (meta)
2. **Color/Opacity:** Primary / Secondary / Muted / Muted-60 / Muted-40
3. **Tracking:** Tight on headlines (-0.02 to -0.005), wide on labels (+0.02 to +0.05)

**Tabular-nums mandatory on ALL dynamic numbers:** counters, vitals, time codes, bed IDs, table cells, KPI values.

---

## Spacing System

**Base Unit:** 4px (`--spacing(1)` = 4px)

| Context   | Value  | Token                       | Use For                                        |
| --------- | ------ | --------------------------- | ---------------------------------------------- |
| Micro     | 4px    | `unit-xs`                   | Icon gaps, badge internal padding              |
| Component | 8-12px | `unit-sm` / `unit-md`       | Button padding, card internal, form field gaps |
| Section   | 16px   | `unit-lg` / `gutter-normal` | Card inset, grid gaps, header padding          |
| Major     | 24px   | `unit-xl` / `unit-2xl`      | Page section separation, modal padding         |

**Density Presets (from DESIGN.md):**

- High-density tables: Row height 36px (`padding: 6px 12px`)
- Standard monitoring cards: Inset 16px (`unit-lg`)
- KPI stat grid: Min column 200px autofill

**Symmetry:** Padding symmetrical unless content demands asymmetry.

---

## Border Radius Scale

| Token           | Value          | Use For                                                                        |
| --------------- | -------------- | ------------------------------------------------------------------------------ |
| `--radius-sm`   | 0.125rem (2px) | Table cells, small badges, inputs, checkboxes, micro button groups             |
| `--radius-md`   | 0.375rem (6px) | **DEFAULT** — Buttons, standard cards                                          |
| `--radius-lg`   | 0.5rem (8px)   | Dashboard cards, KPI tiles, analytical widgets, operational flyouts            |
| `--radius-xl`   | 0.75rem (12px) | Modals, drawers, large containers                                              |
| `--radius-full` | 9999px         | **Badge pills only** — semantic status pills, ESI acuity badges, capacity tags |

**Concentric Radius Rule:** Nested rounded elements → `outerRadius = innerRadius + padding`. Never same radius on parent and child.

---

## Component Patterns (Reusable, Measured)

### Button

| Variant              | Height     | Padding   | Radius | Use For                                     |
| -------------------- | ---------- | --------- | ------ | ------------------------------------------- |
| Primary (default)    | 36px (h-9) | 16px 32px | 6px    | Primary actions: Save, Submit, Confirm      |
| Secondary            | 36px       | 16px 32px | 6px    | Secondary actions: Cancel, Edit             |
| Destructive/Critical | 36px       | 16px 32px | 6px    | Bed lockout, divert trigger, rapid response |
| Compact              | 28px (h-7) | 12px 24px | 4px    | Dense toolbars, table actions               |
| Ghost                | 36px       | 16px 32px | 6px    | Navigation, low-emphasis                    |
| Icon                 | 36x36      | —         | 6px    | Toolbar icons, sidebar toggle               |

**States:** Default / Hover (bg/90) / Active (translate-y-px, bg/80) / Focus-visible (3px ring) / Disabled (muted, opacity-75, no shadow)

**Press feedback:** `active:translate-y-px` (scale ~0.97 equivalent)

### Badge Pills (Semantic Only)

- Height: 20px (compact)
- Left status dot: 6px rounded-full
- Composition: translucent BG + darkened text + boundary stroke
- Variants: stable, bottleneck, critical, urgent (from semantic quartet)
- **Never** use for decoration — only clinical meaning

### Dense Data Table

- Header: `--muted` BG, `label-sm` uppercase, sorting arrows right
- Row height: **36px locked** (`h-9`)
- No zebra striping — clean 1px bottom border `--border/70`
- Critical alerts: 4px left border matching semantic color
- Numbers: right-align, `tabular-nums`; Text: left-align

### KPI Stat Card

- Header: `label-md` slate-500 + `tabular-kpi` slate-900
- Footer: inline delta with micro chevron (emerald optimal / amber adverse / rose critical)
- Top-right: 48x20px inline sparkline (rolling 6hr)
- Padding: 16px (`unit-lg`)

### Input / Filter Toolbar

- Height: 32px (compact)
- Border: `#cbd5e1` (light slate)
- Focus: **immediate** 1px `--primary` border, zero blur spread
- Inset iconography for search/MRN lookup

---

## Layout Architecture

### Desktop (≥1440px)

```
┌─────────────────────────────────────────────────────────────┐
│ 64px condensed nav bar (AppHeader)                          │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│   Sidebar        │  Fluid primary analytical grid           │
│   (collapsible)  │  (dashboard, stats-report, record-stats) │
│                  │                                          │
│                  │  Optional: 360px triage inspection rail  │
│                  │  (collapsible, right)                    │
└──────────────────┴──────────────────────────────────────────┘
```

- Gutters: 16px (`unit-lg` / `gutter-normal`)

### Mid-Screen (1024–1439px)

- Tables condense: hide auxiliary columns
- Charts collapse to vertical card sequences
- Right rail → overlay slide-out

### Tablet/Mobile (<1024px)

- Single-column scroll
- Sticky category tabs
- Tables → prioritized card lists with swipe action sheets

---

## Motion Essentials

| Element                                             | Duration  | Easing                           | Notes                     |
| --------------------------------------------------- | --------- | -------------------------------- | ------------------------- |
| Button press                                        | 100–160ms | `cubic-bezier(0.23, 1, 0.32, 1)` | `active:translate-y-px`   |
| Tooltip/popover                                     | 125–200ms | enter ease-out                   | Origin-aware from trigger |
| Dropdown                                            | 150–250ms | enter ease-out                   |                           |
| Modal/drawer                                        | 200–500ms | enter ease-out                   | Backdrop fade-in          |
| **High-frequency actions** (cmd palette, shortcuts) | **0ms**   | —                                | No animation — feels slow |

**Rules:**

- Only animate `transform` + `opacity` (GPU)
- Never `transition: all` — name properties
- Stagger entrances 30–80ms
- Exits faster/subtler than enters
- Respect `prefers-reduced-motion` — keep opacity/color, drop movement

---

## Polish Checklist (Every Component)

- [ ] Tabular-nums on all dynamic numbers
- [ ] Four text levels used (not just two)
- [ ] Concentric radius on nested elements
- [ ] Optical alignment (icon padding ≈ text padding - 2px)
- [ ] All states: default, hover, active, focus, disabled
- [ ] Data states: loading, empty, error
- [ ] Hit areas ≥44×44px (extend with pseudo if needed)
- [ ] Text-wrap: balance on headings; pretty on body
- [ ] Font-smoothing: antialiased on root
- [ ] Image outlines: 1px inset rgba(0,0,0,0.1) / rgba(255,255,255,0.1)
- [ ] Shadows over borders for elevation (Layer 2-3); borders for dividers/inputs

---

## Anti-Patterns (What We Don't Do)

- ❌ Harsh borders (if borders are first thing you see, they're too strong)
- ❌ Dramatic surface jumps (elevation = whisper-quiet)
- ❌ Flat hierarchy (everything same size/weight)
- ❌ Monotone layout (same card size, gap, density everywhere)
- ❌ Inconsistent spacing (clearest sign of no system)
- ❌ Mixed depth strategies (pick one: outlines)
- ❌ Missing states (hover, focus, disabled, loading, empty, error)
- ❌ Large radius on small elements; thick decorative borders
- ❌ Gradients/color for decoration (color = meaning)
- ❌ Multiple accent colors (dilutes focus)
- ❌ Different hues for different surfaces (one hue, shift lightness only)
- ❌ Default typography (system fonts, size-only hierarchy)
- ❌ Structural hacks (negative margins, escape-hatch calc, absolute to dodge flow)

---

## Signature Element Spec: Shift Pulse

**The one component that could only exist in PulseCare.**

```
┌─────────────────────────────────────────────────────────────┐
│ SHIFT PULSE                              ● Live · 2 min ago │
│ ──────────────────────────────────────────────────────────── │
│ Census is holding steady                                      │
│ Capacity comfortable, two transfer decisions watching        │
│ ──────────────────────────────────────────────────────────── │
│    42  / 48 beds                                    87.5%    │
│    ████████████████████████████░░░░░░░░░░░░░░ 90% ▲        │
│    Comfortable                                    Surge      │
│ ──────────────────────────────────────────────────────────── │
│    ▁▂▃▅▆▇█▇▆▅▃▂▁  (6-hour sparkline, terminal dot)         │
│    00:00      03:00      06:00                             │
└─────────────────────────────────────────────────────────────┘
```

**Measurements:**

- Container: `bg-primary` (teal), `rounded-lg`, `p-5 sm:p-6`, `shadow-layer-1`
- Hero number: `text-5xl` (60px) / `font-bold` / `tabular-nums` / `text-primary-foreground`
- Fraction label: `text-sm` / `text-primary-foreground/70`
- Occupancy %: `text-xs` / `font-semibold` / `tracking-[0.12em]` / `uppercase` / `text-primary-foreground/70`
- Progress bar: `h-3` / `rounded-full` / `bg-primary-foreground/20` track, `bg-primary-foreground` fill
- Threshold label: `text-[11px]` / `text-primary-foreground/65` / "Surge threshold · 90%"
- Sparkline: `h-32` / bars `rounded-t-sm` / `bg-secondary/15` track, `bg-secondary` fill with opacity gradient
- Time labels: `text-[11px]` / `text-muted-foreground`

---

## Usage Rules for Agents

1. **Read this file first** before any UI work
2. **Use CSS variables** — never hardcode hex/Tailwind color literals
3. **Reuse component patterns** — extract on 2nd real reuse
4. **Run checks** before presenting: Swap test, Squint test, Signature test, Token test
5. **Update this file** when new reusable patterns emerge (2+ uses, measurable)

---

## Version History

| Date       | Change                                               |
| ---------- | ---------------------------------------------------- |
| 2026-09-19 | Initial codification from DESIGN.md + codebase audit |
