<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display the role listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('roles.view', $request->user());

        $search = trim((string) $request->string('search'));
        $perPage = (int) $request->input('per_page', 10);

        $roles = Role::where('guard_name', 'web')
            ->with('permissions')
            ->withCount('users')
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/roles/index', [
            'roles' => collect($roles->items())
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'users_count' => $role->users_count,
                    'permissions' => $role->permissions->pluck('name')->values()->all(),
                    'created_at' => $role->created_at->toIso8601String(),
                ])
                ->values()
                ->all(),
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'pagination' => [
                'current_page' => $roles->currentPage(),
                'last_page' => $roles->lastPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        Gate::authorize('roles.create', request()->user());

        return Inertia::render('admin/roles/create', [
            'availablePermissions' => Permission::where('guard_name', 'web')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create(['name' => $request->validated('name'), 'guard_name' => 'web']);

        $role->syncPermissions($request->validated('permissions', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role created.')]);

        return to_route('admin.roles.index');
    }

    /**
     * Show the specified role.
     */
    public function edit(Role $role): Response
    {
        Gate::authorize('roles.update', request()->user());

        return Inertia::render('admin/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'users_count' => $role->users()->count(),
                'permissions' => $role->permissions()->pluck('id')->all(),
            ],
            'availablePermissions' => Permission::where('guard_name', 'web')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $data = $request->validated();

        $role->name = $data['name'];
        $role->syncPermissions($data['permissions'] ?? []);
        $role->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role updated.')]);

        return to_route('admin.roles.index');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Request $request, Role $role): RedirectResponse
    {
        Gate::authorize('roles.delete', $request->user());

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role deleted.')]);

        return to_route('admin.roles.index');
    }
}
