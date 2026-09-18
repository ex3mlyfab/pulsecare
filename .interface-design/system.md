# PulseCare Interface System

## Direction

Clinical operations workspace for nursing leadership and shift coordinators. The interface should feel calm, alert, and engineered for fast scanning during handoff. Use color to communicate operational meaning, not decoration.

## Visual Language

- Canvas: `bg-background` / glare-free slate canvas.
- Surfaces: `bg-card` with `border-border` and `shadow-layer-1`.
- Depth: low-contrast borders plus the existing subtle layer shadows; avoid dramatic elevation.
- Radius: `rounded-md` for controls and `rounded-lg` for dashboard modules; `rounded-full` only for semantic status pills.
- Spacing: 4px base scale, with 16px card insets and 16px standard grid gutters.
- Typography: existing Inter system and tabular numerics for all operational values.

## Color Roles

- Teal / `primary`: actions, active states, shift pulse focal module.
- Sky blue / `secondary`: telemetry, flow, and auxiliary operational signals.
- Indigo / `critical`: high-acuity or close-watch states.
- Amber / `bottleneck`: transfer queues, delays, and decisions needing coordination.
- Emerald / `stable`: on-plan throughput, no active alerts, and healthy states.
- Red / `urgent`: reserved for active escalation or destructive actions.

## Hierarchy

Every operational view gets one focal task. For the dashboard, the focal task is scanning the current shift state. The `Shift pulse` module leads with census, occupancy, and surge threshold in one coordinated band. Supporting KPI cards and signal rows are quieter and more compact.

## Reusable Patterns

### Shift pulse

Use a teal surface module with:

- Small uppercase context label.
- Plain-language operational headline.
- Primary tabular census value with capacity denominator.
- Horizontal occupancy meter with a named surge threshold.
- Supporting attention queue beside it on wide screens.

### Operational KPI card

Use a white card with a muted uppercase label, 28px or larger tabular value, optional unit, short comparison detail, and a small semantic icon block. Minimum grid column width is 200px.

### Signal row

Use a compact row with a semantic status dot, label, short interpretation, and right-aligned tabular value. Keep row groups separated by quiet dividers rather than heavy borders.

### Status pill

Use a compact full-round pill with a 6px status dot, translucent semantic surface, semantic border, and semantic text. Use for operational state only.

### Filter rail

Group search, status selection, and filter action in a muted inset toolbar. Keep controls compact and place the creation action at the far edge.

### Dense table

Use uppercase muted headers, 36px row rhythm, no zebra striping, text columns left-aligned, numerical values right-aligned, and status pills for semantic state. Empty states should remain centered and quiet.

## Responsive Behavior

- Desktop: dashboard modules use a wide primary analytical column with a narrower attention/inspection column.
- Mid-screen: modules stack naturally while preserving the shift pulse as the first focal element.
- Mobile: use one-column flow, preserve the census value and threshold together, and allow KPI cards to auto-fill at a 200px minimum.

## Motion

Use restrained transitions under 300ms for hover and interactive surfaces. Prefer opacity and transform. Respect reduced-motion preferences. Repeated operational actions should feel immediate rather than animated.
