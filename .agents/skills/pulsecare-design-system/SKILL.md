---
name: pulsecare-design-system
description: Clinical Operations Engine design system for PulseCare. Ensures all UI code follows DESIGN.md tokens, layout rules, elevation, typography, and component patterns. Activates whenever writing, editing, reviewing, or auditing any React/Inertia page, component, Tailwind class, or Blade template in this project. Must read DESIGN.md before any UI work.
---

# PulseCare Design System

**Every UI change in this project MUST follow `DESIGN.md` at the project root.** Before writing any HTML, JSX, Blade, Tailwind class, or component code, read and comply with the full design token specification in `DESIGN.md`.

```bash
# Read DESIGN.md before any UI work
cat DESIGN.md
```

If `DESIGN.md` is absent or truncated, stop and ask the user. Do not improvise design tokens.

---

## Color Tokens

All colors in UI code must map to DESIGN.md token names. Never use raw hex values without a DESIGN.md reference.

| Token                       | Hex       | Use                           |
| --------------------------- | --------- | ----------------------------- |
| `surface`                   | `#faf8ff` | Base canvas background        |
| `surface-dim`               | `#d2d9f4` | Dim/disabled surface          |
| `surface-container-low`     | `#f2f3ff` | Low-elevation container       |
| `surface-container`         | `#eaedff` | Standard container            |
| `surface-container-high`    | `#e2e7ff` | High-elevation container      |
| `surface-container-highest` | `#dae2fd` | Highest container             |
| `on-surface`                | `#131b2e` | Primary text on surface       |
| `on-surface-variant`        | `#3d4947` | Secondary text                |
| `outline`                   | `#6d7a77` | Standard border color         |
| `outline-variant`           | `#bcc9c6` | Subtle/soft border            |
| `primary`                   | `#00685f` | Primary action color          |
| `on-primary`                | `#ffffff` | Text on primary               |
| `primary-container`         | `#008378` | Primary hover / active state  |
| `on-primary-container`      | `#f4fffc` | Text on primary-container     |
| `secondary`                 | `#006398` | Secondary / auxiliary actions |
| `secondary-container`       | `#5bb8fe` | Secondary highlight           |
| `tertiary`                  | `#4648d4` | Accent / highlight accent     |
| `error`                     | `#ba1a1a` | Destructive / error           |
| `on-error`                  | `#ffffff` | Text on error                 |
| `error-container`           | `#ffdad6` | Error background              |

**Semantic status indicators:**

| Status                | Color     | Surface   | Border    |
| --------------------- | --------- | --------- | --------- |
| Stable / Discharged   | `#10B981` | `#ECFDF5` | `#A7F3D0` |
| Bottleneck / Transfer | `#F59E0B` | `#FFFBEB` | `#FDE68A` |
| Critical / ICU        | `#6366F1` | `#EEF2FF` | `#C7D2FE` |
| Urgent / Alert        | `#EF4444` | `#FEF2F2` | `#FECACA` |

**Clinical operational colors (from DESIGN.md prose):**

| Token                           | Hex       | Use                                                  |
| ------------------------------- | --------- | ---------------------------------------------------- |
| Clinical teal (primary actions) | `#0D9488` | Primary buttons, active tabs, selection states       |
| Clinical teal hover             | `#0F766E` | Hover state on primary teal                          |
| Cyan/sky blue (auxiliary)       | `#0284C7` | Telemetry streams, non-critical interactive elements |
| Canvas base                     | `#F8FAFC` | Glare-free base background                           |
| Card surface                    | `#FFFFFF` | Elevated tables, modals, drawers                     |
| Inset/muted                     | `#F1F5F9` | Table headers, sub-panels, disabled states           |
| Structural border               | `#E2E8F0` | Grid boundaries, card outlines                       |
| Active border                   | `#CBD5E1` | Focused panel delimiters                             |
| Primary text                    | `#0F172A` | Main content text (slate-900)                        |
| Secondary text                  | `#334155` | Supporting text (slate-700)                          |
| Muted text                      | `#64748B` | Tertiary / metadata (slate-500)                      |

---

## Typography

Font: **Inter** throughout.

| Role            | Size | Weight | Line Height | Letter Spacing |
| --------------- | ---- | ------ | ----------- | -------------- |
| `display-lg`    | 32px | 600    | 40px        | -0.02em        |
| `headline-lg`   | 24px | 600    | 32px        | -0.015em       |
| `headline-md`   | 20px | 600    | 28px        | -0.01em        |
| `headline-sm`   | 16px | 600    | 24px        | -0.005em       |
| `body-lg`       | 15px | 400    | 22px        | 0em            |
| `body-md`       | 13px | 400    | 18px        | 0em            |
| `body-sm`       | 12px | 400    | 16px        | 0.005em        |
| `tabular-kpi`   | 28px | 700    | 32px        | -0.02em        |
| `tabular-dense` | 12px | 500    | 16px        | 0em            |
| `label-md`      | 12px | 600    | 16px        | 0.02em         |
| `label-sm`      | 10px | 700    | 12px        | 0.05em         |

**Rules:**

- All numeric data (counters, vitals, time codes, bed IDs, table cells) MUST use `font-variant-numeric: tabular-nums lining-nums`
- `label-sm` is strictly **uppercase** for clinical metadata (e.g. `ACUITY TIER`, `PACU HOLD`, `LOS HRS`)
- Vital figures and KPI stat numbers MUST pair with `label-sm` unit indicators aligned to baseline
- `tabular-kpi` for headline KPI numbers; `tabular-dense` for table cell values

---

## Layout & Spacing

Base unit: **4px** geometric scale.

| Token           | Value          | Use                                 |
| --------------- | -------------- | ----------------------------------- |
| `unit-2xs`      | 0.125rem (2px) | Micro gaps between icons and labels |
| `unit-xs`       | 0.25rem (4px)  | Tightest padding                    |
| `unit-sm`       | 0.5rem (8px)   | Compact component padding           |
| `unit-md`       | 0.75rem (12px) | Standard component padding          |
| `unit-lg`       | 1rem (16px)    | Card inset padding, gutters         |
| `unit-xl`       | 1.5rem (24px)  | Section spacing                     |
| `unit-2xl`      | 2rem (32px)    | Major section spacing               |
| `gutter-dense`  | 0.5rem         | Dense grid gutters                  |
| `gutter-normal` | 1rem           | Standard grid gutters               |
| `margin-screen` | 1.5rem         | Screen edge margins                 |

**Density rules:**

- High-density table row heights: **36px** (padding: 6px 12px)
- Standard monitoring card inset padding: **16px** (`unit-lg`)
- KPI stat grid: minimum column **200px**, auto-fill

**Responsive breakpoints:**

- Desktop (1440px+): multi-pane, 64px condensed nav bar, optional 360px right inspection rail
- Mid-screen (1024–1439px): condensed tables, right panel becomes overlay slide-out
- Tablet/Mobile (< 1024px): single-column, sticky category tabs, tables become card lists

---

## Elevation & Depth

Depth uses **low-contrast borders + subtle tonal layers**, not pronounced shadows.

| Layer                        | Surface        | Border        | Shadow                                                                    |
| ---------------------------- | -------------- | ------------- | ------------------------------------------------------------------------- |
| Layer 0 (Canvas)             | `#F8FAFC` flat | none          | none                                                                      |
| Layer 1 (Cards/Tables)       | `#FFFFFF`      | 1px `#E2E8F0` | `0 1px 2px 0 rgba(15,23,42,0.04)`                                         |
| Layer 2 (Popovers/Dropdowns) | `#FFFFFF`      | 1px `#CBD5E1` | `0 4px 12px -2px rgba(15,23,42,0.08), 0 2px 4px -1px rgba(15,23,42,0.04)` |
| Layer 3 (Modals/Drawers)     | `#FFFFFF`      | 1px `#94A3B8` | `0 12px 24px -4px rgba(15,23,42,0.16)`                                    |

- Modal backdrop: `#0F172A` at 40% opacity, 2px blur
- **Critical status flashers**: elevation stays flat; border shifts to 2px solid `#EF4444` with optional subtle pulse

---

## Shapes

Soft (`1`) roundedness profile — clinical, engineered appearance.

| Token               | Value          | Use                                                                      |
| ------------------- | -------------- | ------------------------------------------------------------------------ |
| `rounded-sm`        | 0.125rem (2px) | Micro elements                                                           |
| `rounded` (DEFAULT) | 0.25rem (4px)  | Table cells, small badges, input fields, checkboxes, micro button groups |
| `rounded-md`        | 0.375rem (6px) | Standard buttons, cards                                                  |
| `rounded-lg`        | 0.5rem (8px)   | Dashboard cards, KPI tiles, analytical widgets                           |
| `rounded-xl`        | 0.75rem (12px) | Larger containers                                                        |
| `rounded-full`      | 9999px         | Semantic status pills, ESI acuity badges, capacity tags                  |

**Rule:** Badge pills (`rounded-full`) are reserved for operational markers only — never for structural layout elements.

---

## Component Rules

### Buttons

| Variant        | Background | Text      | Height | Hover     |
| -------------- | ---------- | --------- | ------ | --------- |
| Primary        | `#0D9488`  | white     | 32px   | `#0F766E` |
| Secondary      | `#FFFFFF`  | `#1E293B` | 32px   | `#F8FAFC` |
| Critical/Rapid | `#EF4444`  | white     | 32px   | `#DC2626` |

- Compact density: 28px height; Standard: 36px height
- No button exceeds 40px in height
- All buttons: 4px border radius, `label-md` weight, clear focus ring

### Semantic Badge Pills

- 20px height, 6px status dot on the left
- Composed of: translucent background + darkened text + matching boundary stroke
- Use `rounded-full` only for these

### Data Tables

- Header background: `#F1F5F9`, uppercase `label-sm` typography, right-anchored sort arrows
- Row height: 36px
- No zebra striping; clean 1px bottom border `#E2E8F0`
- Critical patient rows: 4px left vertical border matching semantic color
- Numeric columns right-aligned; text columns left-aligned

### KPI Stat Cards

- Header: category in `label-md` slate-500; metric in `tabular-kpi` slate-900
- Footer: inline delta with micro chevron arrows
    - Emerald `#10B981` for optimal throughput
    - Amber `#F59E0B` / Rose `#EF4444` for adverse backlog
- Top-right corner: 48×20px inline sparkline slot

### Sparklines

- 1.5px stroke width, zero area fill, terminal indicator dot for live value

### Inputs & Filter Toolbars

- Compact input: 32px height, 1px `#CBD5E1` border
- Inset iconography for bed search and MRN lookup
- Focus state: 1px `#0D9488` border, zero blur spread (no spread on focus ring)

---

## Enforcing the System in Code

When writing or reviewing UI code in this project:

1. **Before any UI work**, read `DESIGN.md` in full.
2. **All colors** must map to DESIGN.md tokens. Raw hex values without a token reference are violations.
3. **All typography** must use Inter at the sizes/weights/line-heights in DESIGN.md.
4. **Tabular numbers** (`tabular-nums lining-nums`) is mandatory for every numeric data display.
5. **Elevation layers** must use the exact border colors and shadow values from DESIGN.md.
6. **Button and input heights** are fixed. Do not exceed 40px button height.
7. **Badge pills** use `rounded-full`; all other structural elements use the rounded scale from DESIGN.md.
8. **Semantic status colors** (Stable/Transfer/Critical/Urgent) use only the exact color pairs in DESIGN.md.
9. **No zebra striping** on data tables.
10. **No decorative ornamentation.** Every element must serve an operational or informational purpose.
