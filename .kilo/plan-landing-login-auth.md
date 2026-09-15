# PulseCare — Landing Page & Login + Auth Cleanup

## Context
PulseCare is a clinical Operations Engine for hospital nursing units: collect data, display it, filter it interactively, and drive decisions via charts/dense KPIs. The app still has the default Laravel/Inertia starter UI (Laravel-branded `welcome` page, default login screen, self-service **registration** and **account deletion**). Goal: replace with a PulseCare landing page + an excellent login, matching the Clinical Operations design system (`DESIGN.md` / `pulsecare-design-system`), and strip self-serve registration & account deletion.

Stack in scope: Inertia v3 + React, Tailwind v4, shadcn-style `@/components/ui`, Wayfinder routes, Fortify auth. Design system is load-bearing: read `DESIGN.md` before any UI work and map every color to a DESIGN.md token.

---

## Part 1 — Remove registration & delete-account ability

### 1a. Disable Fortify registration (backend)
File: `config/fortify.php`
- Remove `Features::registration()` from the `'features'` array (leave reset-passwords, email-verification, two-factor, passkeys).
- Set `'views' => false` only if we drop Fortify's register view route; otherwise keep as-is. Recommended: disable the feature so the `/register` route stops resolving.
- Effect: `GET/POST /register` are no longer registered by Fortify.

### 1b. Remove registration entry points (frontend)
- `resources/js/pages/auth/register.tsx` — delete the file.
- `resources/js/pages/welcome.tsx` — remove the `register` link and its import.
- `resources/js/pages/auth/login.tsx` — remove the "Don't have an account? Sign up" block (lines ~95–100) and the `register` import.
- Verify no other `register` route imports remain (`grep -rn "register" resources/js` after edits).
- Regenerate Wayfinder so `resources/js/routes/register` (and `resources/js/actions/.../RegisteredUserController.ts`) are no longer emitted (run `wayfinder:generate` after the Fortify change, then commit the diff).

### 1c. Remove account deletion (backend)
File: `app/Http/Controllers/Settings/ProfileController.php`
- Remove the `destroy` action method.
File: `routes/settings.php`
- Remove `Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');`.

### 1d. Remove account deletion (frontend)
- `resources/js/components/delete-user.tsx` — delete the file.
- `resources/js/pages/settings/profile.tsx` — remove the `<DeleteUser />` import + usage.
- Regenerate Wayfinder (`ProfileController.destroy` action file goes away).

### 1e. Tests
- Add/update feature tests asserting: `/register` returns 404, `DELETE settings/profile` returns 404, and the register/delete no longer appear in link sets. Read `testing-best-practices` skill first. Keep test scope to these behaviors only.

---

## Part 2 — Excellent Login page

Rework `resources/js/pages/auth/login.tsx` (and its layout `resources/js/layouts/auth/auth-split-layout.tsx`) into a clinical, branded screen.

### Layout: `auth-split-layout.tsx`
- Replace the generic dark `bg-slate-900` brand panel with a PulseCare brand panel:
  - Background = DESIGN token `surface`/`Canvas` gradient or a subtle telemetry motif (calm, low-contrast; no decorative ornament).
  - PulseCare wordmark (`PulseCare`) using `AppLogoIcon` recolored to `primary`/`primary-container` (#00685f / #008378).
  - Optional: a short trust line + 1–2 KPI/throughput motifs consistent with the design system (sparkline, tabular nums) to signal the "operations engine" product.
- Keep the right-hand form column intact (it's what the child form uses).

### Form: `login.tsx`
- Field order: email → password → remember → submit.
- Use existing `Input`, `Label`, `PasswordInput`, `Checkbox`, `Button`, `Spinner`, `InputError` components (they already exist) — restyle to DESIGN tokens:
  - Inputs 32px height, 1px `outline-variant` (#CBD5E1) border; focus = 1px `primary` border, zero spread.
  - Primary button = `#0D9488`/`primary` with `#0F766E` hover; height ≤40px; `label-md` weight.
- Title/description via `AuthLayout` props: "Sign in to PulseCare" / "Access your nursing unit's operations dashboard".
- Keep "Forgot your password?" (conditional on `canResetPassword`) and `PasskeyVerify` (passkeys are a configured feature).
- Keep `status` success message.
- Remove register CTA (Part 1b).

### Validation
- Type-check: `npm run types:check` (tsc). Frontend lint/format per repo.

---

## Part 3 — PulseCare Landing page (`welcome.tsx`)

Replace the Laravel starter `welcome` page with a PulseCare marketing/product landing page.

### Structure (single Inertia page, sections top→bottom)
1. **Header / nav** — `PulseCare` wordmark left; right-side actions:
   - Authenticated: "Dashboard" button (`dashboard()`).
   - Guest: "Sign in" button (`login()`). (No Register — removed.)
2. **Hero** — headline (display-lg 32px) framing the product: calm situational awareness for nursing units; subhead (body-lg) on data collection + interactive filtering/charts; primary CTA "Sign in" + secondary "Learn more" anchor.
3. **Feature/proof section** — 3–4 capability cards (KPI stat card pattern: label-md category, tabular-kpi metric, delta, sparkline slot) showcasing: real-time census, throughput trend, acuity triage, filterable unit data.
4. **How it works / data flow** — brief steps (collect → filter → visualize → act) using badge pills for acuity tiers (ESI/Stable/Transfer/Critical/Urgent semantic colors).
5. **Footer** — minimal, on-brand.

### Constraints
- Follow `pulsecare-design-system`: canvas #F8FAFC, card #FFFFFF with 1px #E2E8F0 border, semantic status pills only for operational markers, tabular-nums for all numeric displays, no decorative ornamentation.
- Reuse existing UI primitives (`Button`, `Card`, `Badge`, etc.). Do not add new base folders.
- If charts are desired on the landing page, keep them static/illustrative at first (no new chart dependency) — a later task can wire live data.
- Keep it a guest-accessible public page (`home` route already public).

---

## Part 4 — Verification & housekeeping

- `php artisan route:list --except-vendor` → confirm no `register` route and no `DELETE settings/profile`.
- `npm run types:check` and `npm run build` (or dev) → no errors.
- Feature tests (Pest) for the removals (Part 1e).
- Run `vendor/bin/pint --format agent` if any PHP files changed.
- Run `wayfinder:generate` and commit regenerated `resources/js/actions` + `resources/js/routes`.

---

## Out of scope (do now, note for later)
- Live charts/filters on the dashboard itself (dashboard work is separate).

## Open question for user
1. Should the landing page include live/illustrative charts, or stay static on this pass?

## Notes
- `.env` `APP_NAME` is currently `Laravel`. Change to `PulseCare` in `.env` and `.env.example` so the brand wordmark and `usePage().props.name` read correctly.
