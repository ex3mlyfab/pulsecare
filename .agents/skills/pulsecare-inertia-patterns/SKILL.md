---
name: pulsecare-inertia-patterns
description: 'Non-obvious implementation patterns and gotchas specific to the PulseCare app (Laravel 13 + Inertia v3.7 + React + Wayfinder + Pest). Activates whenever writing or reviewing any CRUD controller, Inertia React page, form, model with ULID PK, Pest feature test, or migration in this repo. Covers the `$request->string()` Stringable strict-comparison trap, Inertia v3 `.layout` API shapes that crash React #31, the flash-toast + redirect flow, `useForm`/`useForm<Filters>` + `get`/`post`/`patch` idioms, Wayfinder controller imports, and the `foreignId` vs `foreignUlid` FK rule. Read this before touching any of those files; it is complementary to the `inertia-react-development` and `wayfinder-development` skills, not a replacement.'
---

# PulseCare Inertia & CRUD Patterns

This skill records the non-obvious patterns and bugs that have bitten this specific codebase. The generic Laravel/Inertia/Wayfinder skills cover the *syntax*; this covers the *gotchas* and the *conventions* that are easy to break.

## When to Apply

Activate this skill whenever you are about to:

- Add or modify an admin CRUD controller under `app/Http/Controllers/Admin/*Controller.php`
- Add or modify an Inertia React page under `resources/js/pages/admin/*`
- Add or modify a Pest feature test under `tests/Feature/*`
- Add or modify a migration that adds a new table with a ULID PK or an FK to a ULID table
- Add or modify a form request under `app/Http/Requests/Admin/*Request.php`
- Add or modify an Eloquent model that uses a ULID PK or a `Stringable`-returning request accessor

---

## Gotcha 1 — `$request->string()` returns a `Stringable`, not a `string`

**The trap.** `Illuminate\Http\Request::string()` returns an `Illuminate\Support\Stringable` object (a wrapper that implements `__toString`), **not** a plain `string`.

**Why it matters.** Any **strict** comparison against the empty string fails, because an object is never `===` to a string even when it implements `__toString`. This silently applies a `WHERE … = ''` filter to every index query and returns zero rows.

**The bug this produced.** `WardController@index` (and originally `ClinicController@index`) did:

```php
$status = $request->string('status');            // ← Stringable, NOT string
// ...
->when($status !== '', function ($query) use ($status): void {   // ← ALWAYS true
    $query->where('status', $status);              // ← WHERE status = '' → 0 rows
})
```

Symptom: "Ward created." toast shows, but the table on the index page says "No wards found." — even though the row IS in the database. The `store()` flash + redirect works; the index query just filters everything out.

**The fix — cast to a string with `trim((string) …)`.** Every index controller in this repo now uses:

```php
$search = trim((string) $request->string('search'));
$status = trim((string) $request->string('status'));
$day    = trim((string) $request->string('day'));
```

**Rule.** In any controller, **never** do a strict `===` / `!==` comparison between a `$request->string(...)` result and `''` (or any other literal). Always cast first:

```php
// ❌ Bad
$status = $request->string('status');
if ($status !== '') { /* … */ }                 // always true

// ✅ Good
$status = trim((string) $request->string('status'));
if ($status !== '') { /* … */ }                 // correct
```

**Checklist when writing a new index controller.**

1. Every `$request->string(...)` that feeds a `when($x !== '')` / `if ($x !== '')` filter must be `trim((string) …`.
2. `$request->input('per_page', 10)` cast to `(int)` is fine — `input()` returns a plain value.
3. After writing the index method, mentally trace the **no-filter** case (empty search + empty status) and confirm it returns all rows.

---

## Gotcha 2 — Inertia v3 `.layout`: never return a plain object from a function

**The trap.** In `@inertiajs/react` v3.7.0, a page component's `.layout` property accepts several shapes, and **exactly one of them crashes React with error #31** ("Element type is invalid: expected a string or class/function, but got: object with keys {breadcrumbs}"):

| Shape | Valid? | Notes |
|---|---|---|
| `Component.layout = { breadcrumbs: [...] }` | ✅ | Static props object. Inertia merges it onto the default layout from the `layout:` resolver in `createInertiaApp`. Used by ~25 pages in this repo (index/create pages). |
| `Component.layout = (child, props) => <Layout>{child}</Layout>` | ✅ | Render function **returning JSX**. Inertia calls it with `(child, props)` and renders the returned element. |
| `Component.layout = function (…) { return { breadcrumbs: […] }; }` | ❌ **CRASH** | Function that **returns a plain object**. This is the ambiguous shape that leaks `{breadcrumbs}` into a `createElement` slot on the save→index redirect. |
| `setLayoutProps({ breadcrumbs: […] })` inside the component body | ✅ | The supported way to pass **dynamic** (per-record) props to the default layout. Merged onto the `AppLayout` resolver. Reset on every new visit. |

**The bug this produced.** Three edit pages used the function-returns-object form:

```tsx
// ❌ BAD — do not do this
WardEdit.layout = function WardEditLayout({ ward }: { ward: Ward }) {
    return {
        breadcrumbs: [
            { title: 'Wards', href: WardController.index.url() },
            { title: 'Edit ward', href: WardController.edit.url({ ward: ward.id }) },
        ],
    };
};
```

On the 302→GET redirect after `store()`, Inertia re-invokes the layout resolver; the returned `{breadcrumbs}` object leaks into React's `createElement` and throws **React #31**. The error stack points at a `wayfinder-*.js` chunk because the layout code is bundled with the page, not because Wayfinder is the cause.

**The fix — use `setLayoutProps` for dynamic breadcrumbs.**

```tsx
import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';

export default function WardEdit({ ward }: { ward: Ward }) {
    // … form logic …

    setLayoutProps({
        breadcrumbs: [
            { title: 'Wards', href: WardController.index.url() },
            { title: 'Edit ward', href: WardController.edit.url({ ward: ward.id }) },
        ],
    });

    return (/* JSX */);
}
```

`setLayoutProps` is imported from `@inertiajs/react` and merges into the **default layout** resolved by `createInertiaApp({ layout: (name) => AppLayout, … })` in `resources/js/app.tsx:13-24`. For admin/wards, clinics, and other-metrics routes, the default case returns `AppLayout` (a single component, not an array). The nested `[AppLayout, SettingsLayout]` array is reserved for `settings/*` routes.

**Decision rule for new edit pages in this repo.**

- If the breadcrumb is **static** (does not depend on the record's id), use the plain-object form matching the index page of the same resource:
  ```tsx
  WardIndex.layout = { breadcrumbs: [{ title: 'Wards', href: WardController.index.url() }] };
  ```
- If the breadcrumb is **dynamic** (depends on `record.id` for the "Edit …" href), use `setLayoutProps` inside the component body. **Do not** write a function that returns a plain object.

---

## Gotcha 3 — `foreignId` vs `foreignUlid`: match the referenced PK type

**The rule.** Laravel's `Blueprint` helpers have two distinct FK methods:

- `foreignId('col')` → `BIGINT UNSIGNED` (auto-increment PK)
- `foreignUlid('col')` → `CHAR(26)` (ULID PK)

The FK column type **must match the referenced table's primary key type**, or MySQL will create a constraint that can never be satisfied.

**What this repo has.**

| Table | PK helper | PK type |
|---|---|---|
| `users` | `$table->id()` | `BIGINT UNSIGNED` (integer) |
| `roles`, `permissions`, `passkeys`, `jobs` | `$table->id()` | `BIGINT UNSIGNED` |
| `wards`, `clinics`, `other_metrics`, `record_stats` | `$table->ulid('id')->primary()` | `CHAR(26)` |

So:

- `wards.matron_in_charge_id` → `foreignId('matron_in_charge_id')->nullable()->constrained('users')->nullOnDelete()` ✅ (references integer `users.id`)
- `record_stats.ward_id` → `foreignUlid('ward_id')->constrained()->cascadeOnDelete()` ✅ (references `CHAR(26)` `wards.id`)

**The model cast must agree with the column type.** In `Ward`, `matron_in_charge_id` is cast to `'string'` (the model returns it as a string), but the column is `BIGINT UNSIGNED`. This works because Laravel's `'string'` cast is lenient on read (it stringifies integers) and the form posts `matron_in_charge_id` as a string that gets coerced to int on insert. If you ever see a "Data type mismatch" or "Invalid foreign key" error on a ULID-referencing FK, the first thing to check is whether the migration used `foreignId` where it should have used `foreignUlid` (or vice-versa).

**Checklist when writing a new migration with an FK.**

1. Look at the referenced table's PK helper (`$table->id()` vs `$table->ulid('id')`).
2. Pick `foreignId` or `foreignUlid` accordingly.
3. In the model, cast the FK column to a type that matches the column's SQL type (`'integer'` for `foreignId`, `'string'` for `foreignUlid`).
4. In the `StoreXxxRequest`, validate the FK with `Rule::exists('<referenced_table>', '<pk>')` and `nullable` if optional.

---

## Pattern — Flash toast + redirect after a successful write

**The convention.** Every write endpoint (store/update/destroy) in this repo follows the same shape:

```php
public function store(StoreWardRequest $request): RedirectResponse
{
    $data = $request->validated();
    $data['beds_count'] = $data['beds_count'] !== null && $data['beds_count'] !== ''
        ? (int) $data['beds_count'] : null;

    Ward::create($data);

    Inertia::flash('toast', ['type' => 'success', 'message' => __('Ward created.')]);

    return to_route('admin.wards.index');
}
```

Key points:

- `Inertia::flash('toast', …)` stores a flash entry in the session keyed `toast`. It is **not** the same as Laravel's `session()->flash('toast', …)`. Inertia's `flash()` is what the client's `router.on('flash', …)` listener picks up.
- The redirect target is **always** `to_route('<resource>.index')` — never `back()`, never `redirect()->to()`. This is what triggers the Inertia redirect-follow that re-renders the index with the new row.
- For `destroy`, wrap the delete in a `try/catch` so a `QueryException` (e.g. FK constraint from `record_stats`) shows an error toast instead of a 500:
  ```php
  try {
      $ward->delete();
      Inertia::flash('toast', ['type' => 'success', 'message' => __('Ward deleted.')]);
  } catch (Throwable $exception) {
      Inertia::flash('toast', [
          'type' => 'error',
          'message' => __('Unable to delete ward. It may be referenced by other records.'),
      ]);
  }
  ```

**Client side.** The toast is rendered by `resources/js/components/ui/sonner.tsx` via the `useFlashToast` hook (`resources/js/hooks/use-flash-toast.ts`), which subscribes to `router.on('flash', …)` and calls `toast.success/info/warning/error` from `sonner`. The hook is wired into the `Toaster` component in `resources/js/app.tsx`. **Do not** add a second toast mechanism; if you need a new toast, just call `Inertia::flash('toast', …)` on the server.

**The flash event fires on the redirect target, not the origin.** After `store()` redirects to `admin.wards.index`, the index page's first render is the one that receives the `flash` event and shows the toast. This is why the index page must be a full Inertia visit (not a client-side `get` with `only: ['wards']`) for the toast to appear — which is exactly what `to_route('admin.wards.index')` produces.

---

## Pattern — Create page: `useForm` + `post` + `onSuccess: () => reset()`

**The convention.** Every create page in `resources/js/pages/admin/*/create.tsx` uses the same shape:

```tsx
const { data, setData, post, processing, errors, reset } =
    useForm<WardForm>({
        name: '',
        beds_count: '',
        location: '',
        status: 'Active',
        matron_in_charge_id: '',
    });

const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(WardController.store.url(), {
        onSuccess: () => reset(),
    });
};
```

Key points:

- `onSuccess: () => reset()` resets the form fields after the server confirms the write. This runs **after** the Inertia redirect has been followed, so it does not interfere with the index page re-render.
- The `post` URL comes from the Wayfinder-generated `WardController.store.url()` (see the next section), never a hardcoded string.
- `processing` drives the disabled state of the Save button.
- `errors.<field>` is rendered with `<InputError message={errors.name} />` next to each input.

**Do not** add `onError` handlers unless the UX genuinely needs them; the default Inertia behaviour (showing `errors._` and field-level `errors.<field>`) is what every other page in the repo does.

---

## Pattern — Index page: `useForm<Filters>` + `get` with `only: [ … ]`

**The convention.** Every index page uses a filter form that does a client-side `get` with `only` to refetch just the table slice:

```tsx
const { data, setData, get, processing } = useForm<Filters>(filters);

const submitFilters = (e: React.FormEvent) => {
    e.preventDefault();
    get(WardController.index.url(), {
        preserveState: true,
        replace: true,
        only: ['wards', 'filters', 'pagination'],
    });
};

const resolvePageUrl = (page: number) =>
    WardController.index.url({ query: { ...data, page } });
```

Key points:

- `only: ['wards', 'filters', 'pagination']` tells Inertia to refetch **only** those props; the rest of the page state (other components, unrelated props) is preserved via `preserveState: true`.
- `replace: true` means the filter visit replaces the current history entry instead of pushing a new one — so the back button from a filtered view goes to the previous page, not through every filter state.
- `resolvePageUrl` is passed to the `Pagination` component (`resources/js/components/pagination.tsx`) and must spread the current filter `data` into the query so pagination preserves active filters.
- The `pagination` prop is a `PaginationMeta` object: `{ current_page, last_page, per_page, total }`.

**Do not** use `router.get(...)` directly here; use the `get` from `useForm` so the form's `data` state stays in sync with the query params.

---

## Pattern — Wayfinder controller imports

**The convention.** Inertia React pages import controller actions from `@/actions/…` (the Wayfinder-generated TypeScript module), never from a hardcoded URL string:

```tsx
import WardController from '@/actions/App/Http/Controllers/Admin/WardController';
// or, for tree-shaking:
import { index, store, create } from '@/actions/App/Http/Controllers/Admin/WardController';
```

The generated module (`resources/js/actions/App/Http/Controllers/Admin/WardController.ts`) exposes, for each route method:

- `WardController.index` / `WardController.store` / `WardController.edit` / `WardController.update` / `WardController.destroy` — route definitions with `.url()`, `.get()`, `.post()`, `.patch()`, `.delete()`, `.form()`.
- For routes with model binding, the `url()` method takes an object or array of args: `WardController.edit.url({ ward: ward.id })` or `WardController.edit.url(ward.id)`.
- `WardController.destroy.form({ ward: wardId })` returns `{ action, method }` suitable for spreading into Inertia's `<Form>` component (used by the delete dialogs in every index page).

**Regeneration.** The generated files live under `resources/js/actions/` and are produced by the `@laravel/vite-plugin-wayfinder` Vite plugin (`vite.config.ts:27,52`). They are committed to the repo. If you add a new route to `routes/web.php`, run `npm run dev` or `npm run build` once so the plugin regenerates the module; do **not** hand-edit files under `resources/js/actions/`.

**Route arg names.** Wayfinder derives the arg name from the route's placeholder, not the model class. For `wards/{ward}/edit` the arg key is `ward`; for `wards/{ward}` (update/destroy) it is also `ward`. For `other-metrics/{other_metric}/edit` the arg key is `other_metric` (snake_case, matching the placeholder). Always use the placeholder name, not the model name.

---

## Pattern — Pest feature tests for an admin CRUD resource

**The convention** (see `tests/Feature/WardCrudTest.php` as the reference). Every admin resource test file follows the same skeleton:

```php
<?php

use App\Models\User;
use App\Models\Ward;
use App\WardStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $this->matronRole = Role::firstOrCreate(['name' => 'matron', 'guard_name' => 'web']);
    $this->userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

    $permissions = collect([
        'wards.view',
        'wards.create',
        'wards.update',
        'wards.delete',
    ])->map(fn ($name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));

    $this->adminRole->syncPermissions($permissions);

    $this->admin = User::factory()->create()->assignRole('admin');
    $this->matron = User::factory()->create()->assignRole('matron');
    $this->regularUser = User::factory()->create()->assignRole('user');

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('admin can view wards index', function () {
    Ward::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get(route('admin.wards.index'));

    $response->assertStatus(200);
    $this->assertEquals(3, Ward::count());
});

test('admin can create a ward', function () {
    $data = [
        'name' => 'ICU Ward',
        'location' => 'Building A, Floor 2',
        'status' => 'Active',
        'matron_in_charge_id' => $this->matron->id,
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.wards.store'), $data);

    $response->assertRedirect(route('admin.wards.index'));
    $this->assertDatabaseHas('wards', [
        'name' => 'ICU Ward',
    ]);
});
```

Key points:

- **`RefreshDatabase`** is required for any test that touches the DB.
- **Roles + permissions** are created in `beforeEach` via `firstOrCreate` and synced onto the admin role. The user factory + `assignRole` is the standard way to seed test users.
- **`app(PermissionRegistrar::class)->forgetCachedPermissions()`** is called at the end of `beforeEach` because Spatie caches the permission list; without it, a test that runs after another test that added permissions will see stale data.
- **Route names** use the full `admin.wards.*` prefix (from `Route::middleware(['auth','verified'])->prefix('admin')->name('admin.')->group(...)` in `routes/web.php:21`).
- **Assert redirect to index** after store/update/destroy: `$response->assertRedirect(route('admin.wards.index'))`.
- **Assert DB state** with `assertDatabaseHas` / `assertDatabaseMissing`, not model counts alone.
- **Validation-failure tests** POST to `route('admin.wards.store')` with bad data and assert `$response->assertSessionHasErrors('name')`.

**Test file naming.** One file per resource under `tests/Feature/`, named `<Resource>CrudTest.php` (e.g. `WardCrudTest.php`, `RecordStatsTest.php`). Use `php artisan make:test --pest {Name}` to scaffold — **do not** include the `Feature/` directory in the name.

**Run the narrowest set first:**

```bash
vendor/bin/pest tests/Feature/WardCrudTest.php
# or by filter:
php artisan test --compact --filter=admin.can.create.a.ward
```

Then run the full suite before declaring done:

```bash
php artisan test --compact
```

---

## Pattern — ULID PK on a new Eloquent model

**The convention** (see `app/Models/Ward.php` and `app/Models/RecordStat.php`). Every model that owns a ULID PK follows this exact shape:

```php
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\Uid\Ulid;

#[Fillable(['name', 'beds_count', 'location', 'status', 'matron_in_charge_id'])]
class Ward extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (Ward $ward) {
            if (empty($ward->id)) {
                $ward->id = (string) Ulid::generate();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'status' => WardStatus::class,
            'beds_count' => 'integer',
            'matron_in_charge_id' => 'string',
        ];
    }
}
```

Key points:

- **`#[Fillable([...])]`** is the attribute form (Laravel 13). Do not use `protected $fillable = [...]` in new models; match the existing style.
- **`protected $keyType = 'string';`** and **`public $incrementing = false;`** are required so Eloquent does not try to auto-increment the PK.
- **The `creating` hook generates the ULID** via `Symfony\Component\Uid\Ulid::generate()`. This is the project convention; the `HasUlids` trait mentioned in `AGENTS.md` is *not* used in this codebase.
- **Casts** include any enum column as `<EnumClass>::class`, any integer column as `'integer'`, and any FK as the matching SQL type (`'string'` for `foreignUlid`, `'integer'` for `foreignId`).

**Factory + seeder.** When you create a new model, also create `database/factories/<Model>Factory.php` and a seeder if the resource is meant to have seed data. Match the existing `WardFactory` / `RecordStatFactory` shape:

```php
public function definition(): array
{
    return [
        'name' => fake()->unique()->word().' Ward',
        'beds_count' => fake()->optional(0.7)->numberBetween(1, 100),
        'location' => fake()->optional()->streetName(),
        'status' => fake()->randomElement(WardStatus::cases()),
        'matron_in_charge_id' => null,
    ];
}
```

---

## Pattern — Form requests for store/update

**The convention** (see `app/Http/Requests/Admin/StoreWardRequest.php` and `UpdateWardRequest.php`). Every admin write request has:

- An `authorize()` that checks the matching gate: `$this->user()->can('wards.create')` for store, `$this->user()->can('wards.update')` for update.
- `rules()` returning an array of validation rules. Nullable FKs use `'nullable'` + `Rule::exists('<table>', '<pk>')`. Unique name fields use `Rule::unique('<table>', 'name')` for store and `Rule::unique('<table>', 'name', null, 'ignore', $this->route('ward')->id)` for update.
- Enum-typed fields use `Rule::in(['Active', 'Inactive'])` (the `WardStatus::cases()` values).

**The `validated()` data shape.** After validation, `$request->validated()` returns a flat array with **only** the keys present in `rules()`. Optional fields that were not sent will be absent, not `null`. The controllers in this repo handle the "empty string from a form input" case explicitly:

```php
$data = $request->validated();
$data['beds_count'] = $data['beds_count'] ?? null;
$data['beds_count'] = $data['beds_count'] !== null && $data['beds_count'] !== ''
    ? (int) $data['beds_count']
    : null;
```

This two-line normalization is repeated in every `store` and `update` method that has an optional integer column. Keep it.

---

## Checklist — before you finish a CRUD feature in this repo

Run through this list for any new or modified admin resource:

### Migration

- [ ] PK helper matches the repo convention (`$table->ulid('id')->primary()` for new resource tables; `$table->id()` only for system tables).
- [ ] Every FK uses `foreignId` or `foreignUlid` to match the referenced PK type (see Gotcha 3).
- [ ] `->constrained()` + `->cascadeOnDelete()` or `->nullOnDelete()` is set.
- [ ] Run `php artisan migrate` and confirm no FK errors on a clean database.

### Model

- [ ] `#[Fillable([...])]` lists every mass-assignable column.
- [ ] `protected $keyType = 'string';` + `public $incrementing = false;` present for ULID PKs.
- [ ] `static::creating` hook generates the ULID.
- [ ] `casts()` includes every enum as `<Enum>::class`, every FK as `'string'`/`'integer'`, every datetime as `'datetime'`.
- [ ] A `HasFactory` + `database/factories/<Model>Factory.php` exists.

### Controller

- [ ] `index` casts every `$request->string(...)` that feeds a `!== ''` filter with `trim((string) …)` (see Gotcha 1).
- [ ] `index` builds the Inertia props array with explicit keys (`wards`, `filters`, `pagination`); no implicit `->all()` leaks.
- [ ] `store` / `update` normalize optional numeric fields from `''` → `null` (see Pattern above).
- [ ] `store` / `update` / `destroy` call `Inertia::flash('toast', …)` and `return to_route('<resource>.index')`.
- [ ] `destroy` wraps the delete in `try/catch (Throwable)` and flashes an error toast on FK failure.
- [ ] Every public method has a `Gate::authorize('<resource>.<ability>', $request->user())` (or equivalent via the form request's `authorize()`).

### Form requests

- [ ] `authorize()` checks the matching gate.
- [ ] `rules()` includes `Rule::unique` / `Rule::exists` / `Rule::in` where appropriate.
- [ ] For update requests, `Rule::unique(..., null, 'ignore', $this->route('<model>')->id)`.

### Inertia React page

- [ ] Import controller actions from `@/actions/…` (Wayfinder), never hardcoded URL strings.
- [ ] Create page: `useForm<T>` + `post(WardController.store.url(), { onSuccess: () => reset() })`.
- [ ] Edit page: dynamic breadcrumbs via `setLayoutProps({ breadcrumbs })` inside the component body — **not** a static function that returns an object (see Gotcha 2).
- [ ] Index page: `useForm<Filters>` + `get(..., { preserveState: true, replace: true, only: [...] })`.
- [ ] Delete dialog: `<Form {...WardController.destroy.form({ ward: wardId })}>` with `<InputError message={errors._} />`.
- [ ] `<Head title="…" />` is the first child of the returned fragment.
- [ ] A `.layout` static object or `setLayoutProps` call is present for every page (so the breadcrumbs render).

### Pest test

- [ ] `uses(RefreshDatabase::class)` at the top.
- [ ] `beforeEach` creates roles + permissions + factory users, then `app(PermissionRegistrar::class)->forgetCachedPermissions()`.
- [ ] One `test(...)` block per ability: index, store, update, destroy, plus validation-failure cases.
- [ ] `assertRedirect(route('admin.<resource>.index'))` after every write.
- [ ] `assertDatabaseHas` / `assertDatabaseMissing` to confirm DB state.
- [ ] A "regular user cannot …" test for each write ability.

### Final verification

```bash
# Narrowest first
vendor/bin/pest tests/Feature/WardCrudTest.php

# Then the full suite
php artisan test --compact

# Then static checks
vendor/bin/pint --dirty --format agent
npx tsc --noEmit
```

All four must be clean before the feature is done.
