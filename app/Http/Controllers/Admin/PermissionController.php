<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePermissionRequest;
use App\Http\Requests\Admin\UpdatePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display the permission listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('permissions.view', $request->user());

        $search = trim((string) $request->string('search'));
        $perPage = (int) $request->input('per_page', 10);

        $permissions = Permission::where('guard_name', 'web')
            ->withCount('roles')
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/permissions/index', [
            'permissions' => collect($permissions->items())
                ->map(fn (Permission $permission) => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'guard_name' => $permission->guard_name,
                    'roles_count' => $permission->roles_count,
                    'created_at' => $permission->created_at->toIso8601String(),
                ])
                ->values()
                ->all(),
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'pagination' => [
                'current_page' => $permissions->currentPage(),
                'last_page' => $permissions->lastPage(),
                'per_page' => $permissions->perPage(),
                'total' => $permissions->total(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create(): Response
    {
        Gate::authorize('permissions.create', request()->user());

        return Inertia::render('admin/permissions/create');
    }

    /**
     * Store a newly created permission.
     */
    public function store(StorePermissionRequest $request): RedirectResponse
    {
        Permission::create(['name' => $request->validated('name'), 'guard_name' => 'web']);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Permission created.')]);

        return to_route('admin.permissions.index');
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Request $request, Permission $permission): Response
    {
        Gate::authorize('permissions.update', $request->user());

        return Inertia::render('admin/permissions/edit', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
            ],
        ]);
    }

    /**
     * Update the specified permission.
     */
    public function update(UpdatePermissionRequest $request, Permission $permission): RedirectResponse
    {
        $permission->name = $request->validated('name');
        $permission->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Permission updated.')]);

        return to_route('admin.permissions.index');
    }

    /**
     * Remove the specified permission.
     */
    public function destroy(Request $request, Permission $permission): RedirectResponse
    {
        Gate::authorize('permissions.delete', $request->user());

        $permission->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Permission deleted.')]);

        return to_route('admin.permissions.index');
    }
}
