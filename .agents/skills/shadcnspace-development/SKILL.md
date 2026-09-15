---
name: shadcnspace-development
description: Develops Shadcn UI interfaces using ShadcnSpace blocks, templates, and components built on Radix UI / Base UI and Tailwind CSS. Activates when creating React pages, dashboards, marketing sections, or interactive components; when installing ShadcnSpace blocks or templates; or when user mentions ShadcnSpace, shadcn blocks, dashboard shells, hero sections, pricing sections, or similar pre-built UI patterns.
---

# ShadcnSpace UI Development

When building UI components, blocks, sections, or full-page templates, always consult the ShadcnSpace MCP server and registry before hand-rolling a solution. ShadcnSpace provides 438+ blocks, 12+ templates, 427+ components, and 28+ pre-built pages designed for React/Next.js with Tailwind CSS, Radix UI, or Base UI primitives.

## MCP Server

The ShadcnSpace live MCP server is available at:

```
https://mcp.shadcnspace.com/mcp
```

Use this endpoint to:
- Search and explore available blocks, components, and templates
- Retrieve component/block code for copy-paste or CLI install
- Discover what already exists before writing new UI code
- Get install commands for specific blocks or templates

When working on any UI task, first query the MCP server to see if a matching block, component, or template already exists. **Do not hand-roll what the registry already provides.**

## Project Context

- Components live in `resources/js/pages` (Inertia) and `resources/js/components` (shared components)
- UI primitives: Radix UI or Base UI — match whatever the project already uses
- Styling: Tailwind CSS with CVA (class-variance-authority) patterns
- Language: TypeScript
- Bundle: Vite (`npm run build` / `npm run dev`)

## When to Use This Skill

Activate this skill when:

- Creating or modifying any React UI component, page, or section
- Building dashboard layouts, sidebars, navigation bars, or data views
- Adding marketing sections (hero, pricing, testimonials, feature grids, CTAs, footers)
- Creating form fields, dialogs, dropdowns, tables, or other interactive controls
- Setting up a new page template or adapting an existing one
- Installing or updating UI blocks from the ShadcnSpace registry
- User explicitly mentions ShadcnSpace, shadcn blocks, or wants pre-built UI patterns

## Workflow

### Step 1: Check the Registry First

Before writing any new UI component or section:

1. Query the ShadcnSpace MCP server for what already exists that matches the requirement
2. If a suitable block/component/template is found, use its code or install command
3. Only hand-roll a component if no registry entry covers the need

### Step 2: Follow Project Conventions

When integrating ShadcnSpace code into this project:

- Match the existing import alias (`@/components`, `@/lib`, etc.)
- Use the project's Tailwind tokens (`bg-card`, `text-muted-foreground`, etc.) instead of raw colors
- Preserve existing component structure — do not restructure directories without approval
- Run `npm run build` or `npm run dev` after integration to verify bundling

### Step 3: Adapt, Don't Blindly Copy

ShadcnSpace blocks are copy-paste ready, but they must be adapted to:

- The project's actual data model and API responses
- Existing component APIs (props, slots, context)
- The project's design language (spacing, typography, color tokens)
- Accessibility requirements (ARIA labels, keyboard navigation)

### Step 4: Verify

After adding or modifying UI code:

- Run `npm run build` and fix any bundling errors
- Inspect the result in the browser for layout, spacing, and state issues
- Check for missing states: loading, empty, error, hover, focus, disabled
- Ensure tabular numbers for dynamic numeric values
- Verify keyboard navigation and ARIA roles on interactive elements

## Component Style Guidelines

When writing or reviewing UI code:

- Use semantic HTML elements (`<button>`, `<a>`, `<input>`, `<dialog>`) — never `<div onClick>` for interactive elements
- Prefer headless primitives (Radix UI / Base UI) for stateful controls: select, combobox, dialog, popover, tooltip, dropdown menu, tabs, date picker
- Bind styling to design tokens, not hardcoded hex values: `bg-card border-border text-muted-foreground`
- When a styled element repeats more than twice, extract it into a component with CVA variants
- Maintain focus rings, hover states, disabled states on every interactive element
- Use `font-variant-numeric: tabular-nums` for any dynamic numbers (counts, prices, metrics)
- Respect `prefers-reduced-motion` — keep opacity transitions, drop movement
- Nested rounded elements: outer radius = inner radius + padding (concentric radius)
- Hit areas: minimum 44×44px; if the visible control is smaller, extend with a pseudo-element

## ShadcnSpace Registry Categories

| Category | Examples |
|---|---|
| Dashboard blocks | Dashboard shells, chart components, widgets, sidebars, login pages, dialog blocks |
| Marketing blocks | Hero sections, pricing sections, feature sections, testimonials, CTAs, footers, newsletters |
| Components | Accordion, avatar, button, badge, calendar, input, select, checkbox, card, tooltip, combobox, carousel, slider, collapsible, dropdown menu, slider, marquee, animated list |
| Templates | Saazio (SaaS product), Atomist (SaaS landing), Awake (agency/portfolio) |
| Pages | Login, dashboard, settings, 404, onboarding |

## Installation

ShadcnSpace blocks and templates can be installed via the ShadcnSpace CLI or copied directly from the MCP server response. When using the CLI:

```bash
npx shadcnspace add <block-or-component-name>
```

Check the ShadcnSpace docs at https://shadcnspace.com/docs/getting-started/introduction for full CLI and MCP setup instructions.

## Links

- Registry & docs: https://shadcnspace.com
- MCP server: https://mcp.shadcnspace.com/mcp
- GitHub: https://github.com/shadcnspace/shadcnspace
- Builder: https://builder.shadcnspace.com
