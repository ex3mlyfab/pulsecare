---
name: Clinical Operations Engine
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#4648d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#6063ee'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  tabular-kpi:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  tabular-dense:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit-2xs: 0.125rem
  unit-xs: 0.25rem
  unit-sm: 0.5rem
  unit-md: 0.75rem
  unit-lg: 1rem
  unit-xl: 1.5rem
  unit-2xl: 2rem
  gutter-dense: 0.5rem
  gutter-normal: 1rem
  margin-screen: 1.5rem
---

## Brand & Style

This design system delivers an authoritative, mission-critical workspace tailored for hospital nursing leadership, triage coordinators, and clinical operations directors. The interface prioritizes calm situational awareness, cognitive decompression under duress, and instantaneous pattern recognition. 

Drawing from **Corporate / Modern** precision combined with high-density utility minimalism, the system minimizes visual fatigue during 12-hour shifts under harsh hospital lighting. Decorative ornamentation is stripped away in favor of crisp structural hierarchy, exact semantic signaling, and ultra-scannable data densities. Visual feedback is immediate, unambiguous, and governed by strict clinical criticality levels.

## Colors

The palette is engineered for clinical environments where ambient glare is common and errors carry high stakes. 

- **Primary & Action Layer (`#0D9488`, `#14B8A6`)**: Grounding clinical teal handles primary actions, selection states, active tab markers, and operational throughput elements.
- **Secondary & Auxiliary Actions (`#0284C7`)**: Cyan/sky blue governs telemetry streams, clinical charting integrations, and non-critical interactive elements.
- **Surfaces & Layout Canvas**:
  - `Surface-0 (Canvas)`: `#F8FAFC` for glare-free base background.
  - `Surface-1 (Card/Sheet)`: `#FFFFFF` for primary work surfaces, elevated tables, and modal drawers.
  - `Surface-2 (Inset/Muted)`: `#F1F5F9` for table headers, embedded sub-panels, and disabled states.
  - `Borders & Rules`: `#E2E8F0` for structural grid boundaries; `#CBD5E1` for active or focused panel delimiters.
- **Text & Structure**:
  - Primary Slate: `#0F172A`
  - Secondary Slate: `#334155`
  - Tertiary/Muted Slate: `#64748B`
- **Semantic Operational Indicators**:
  - **Stable / Discharged**: `#10B981` (Surface: `#ECFDF5`, Border: `#A7F3D0`)
  - **Bottleneck / Transfer Pending**: `#F59E0B` (Surface: `#FFFBEB`, Border: `#FDE68A`)
  - **ICU / Critical Care / High Acuity**: `#6366F1` (Surface: `#EEF2FF`, Border: `#C7D2FE`)
  - **Urgent Code / Alert / Mortality Risk**: `#EF4444` (Surface: `#FEF2F2`, Border: `#FECACA`)

## Typography

Inter serves as the foundational typeface across all roles to ensure maximum geometric clarity at ultra-small scales.

- **Tabular Numerics Rule**: All counters, vitals, time codes, bed IDs, and table cells must enforce `font-variant-numeric: tabular-nums lining-nums`. This eliminates column jitter across auto-refresh cycles and real-time census polling.
- **Label Capitalization**: `label-sm` is strictly uppercase for clinical metadata categorizations (e.g., `ACUITY TIER`, `PACU HOLD`, `LOS HRS`).
- **Hierarchy Enforcements**: Vital figures and KPI stat numbers must always pair with `label-sm` unit indicators aligned to baseline to prevent nurse reading errors.

## Layout & Spacing

The layout model utilizes a dense, fluid 12-column grid anchored by a 4px geometric scaling unit.

- **Desktop (1440px+)**: Multi-pane layout. Persistent 64px condensed operational navigation bar, fluid primary analytical grid, and an optional collapsible 360px triage inspection rail on the right. Gutters hold at `16px` (`unit-lg`).
- **Mid-Screen & Wall Display (1024px - 1439px)**: Tables condense with hidden auxiliary columns; charts collapse into vertical card sequences. Right inspection panel transforms into an overlay slide-out.
- **Tablets & Mobile Handhelds (< 1024px)**: Transition to single-column scroll with sticky category tabs, collapsing full tables into prioritized card lists with swipe action sheets.
- **Data Density Rules**:
  - High-Density Tables: Row heights locked strictly at 36px (`padding: 6px 12px`).
  - Standard Monitoring Cards: Inset padding locked to `16px` (`unit-lg`).
  - KPI Stat Grid: Minimum column size of 200px autofilling grid space.

## Elevation & Depth

To preserve clinical focus and reduce visual noise, depth relies primarily on **low-contrast outlines** paired with subtle tonal layers rather than pronounced drop shadows.

- **Layer 0 (Canvas Base)**: Flat `#F8FAFC`. Zero elevation.
- **Layer 1 (Cards, Modules, Dense Tables)**: `#FFFFFF` encased in a crisp 1px border of `#E2E8F0`. Shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Layer 2 (Dropdowns, Interactive Popovers, Hover Cards)**: `#FFFFFF` encased in a 1px border of `#CBD5E1`. Shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`.
- **Layer 3 (Modals, Urgent Clinical Interrupters, Census Drawers)**: `#FFFFFF` encased in a 1px border of `#94A3B8`. Shadow: `0 12px 24px -4px rgba(15, 23, 42, 0.16)`. Backdrop overlay is `#0F172A` at 40% opacity with a 2px blur.
- **Critical Status Flashers**: When a unit moves into Code Red / Divert status, elevation remains flat while the border shifts to a 2px solid `#EF4444` halo with an optional subtle pulse.

## Shapes

The design system employs a **Soft (`1`)** roundedness profile to maintain a clinical, engineered instrument appearance.

- **Base Radius (0.25rem / 4px)**: Applied to table cells, small badges, input fields, checkboxes, and micro button groups.
- **Container Radius (0.5rem / 8px)**: Applied to dashboard cards, KPI tiles, analytical widgets, and operational flyouts.
- **Badge Pills (Full Round / 9999px)**: Applied strictly to semantic status pills, patient triage acuity badges (ESI 1-5), and unit capacity tags to immediately distinguish operational markers from structural layout cards.

## Components

### 1. Buttons & Controls
- **Primary**: Solid `#0D9488` background, white text, 4px radius, 32px standard height. Hover shifts to `#0F766E`.
- **Secondary**: `#FFFFFF` background, 1px border `#CBD5E1`, text `#1E293B`. Hover shifts to `#F8FAFC`.
- **Critical / Rapid Action**: Solid `#EF4444`, white text. Reserved for bed lockout, divert status trigger, and rapid-response escalations.
- **Density**: Button heights fixed at 28px (compact) and 36px (standard). No buttons exceed 40px in height.

### 2. Semantic Badge Pills
- Compact pills (20px height) featuring a 6px status dot on the left.
- Composed of matching translucent background, darkened text, and boundary stroke:
  - *Stable/Discharged*: BG `#ECFDF5`, Text `#065F46`, Stroke `#A7F3D0`.
  - *Transfer/Delay*: BG `#FFFBEB`, Text `#92400E`, Stroke `#FDE68A`.
  - *Critical/ICU*: BG `#EEF2FF`, Text `#3730A3`, Stroke `#C7D2FE`.
  - *Urgent Alert*: BG `#FEF2F2`, Text `#991B1B`, Stroke `#FECACA`.

### 3. Compact Dense Data Tables
- Headers set in `#F1F5F9`, uppercase `label-sm` typography with sorting arrows anchored right.
- Row heights locked to 36px. Alternating zebra-striping is omitted; clean 1px bottom border (`#E2E8F0`) provides line clarity.
- Critical patient alerts highlight the row's left edge with a 4px vertical border matching the semantic indicator.
- All numerical data columns right-align; text columns left-align.

### 4. KPI Stat Cards & Trend Indicators
- Header displays category in `label-md` slate-500, followed by the metric in `tabular-kpi` slate-900.
- Footer displays inline delta comparisons (e.g., `+4 beds vs last shift`) with micro chevron arrows (emerald for optimal throughput, amber/rose for adverse backlog).
- Top-right corner reserves space for 48x20px inline sparkline components showing rolling 6-hour throughput.

### 5. Patient Census Flow & Micro Sparklines
- Flow visualizations utilize clean horizontal bar meters displaying Capacity vs. Surge Limits with distinct threshold steps (85% warning amber, 95% critical indigo).
- Sparklines render with a 1.5px stroke width, zero area fill, and a terminal indicator dot representing current live value.

### 6. Inputs & Filter Toolbars
- Compact input fields (32px height) with light slate borders (`#CBD5E1`) and clean inset iconography for bed search and MRN lookup. Focus states snap immediately to 1px `#0D9488` border with zero blur spread.