<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RbacSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * The guard that owns the seeded roles and permissions.
     */
    public const GUARD = 'web';

    /**
     * Run the database seeds.
     *
     * Roles and permissions are created idempotently via `firstOrCreate`, so
     * the seeder is safe to re-run and automatically picks up any permission
     * or role added to `permissions()` / `roles()` below on subsequent runs.
     */
    public function run(): void
    {
        $permissions = $this->permissions();

        foreach ($permissions as $entity => $actions) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "{$entity}.{$action}", 'guard_name' => self::GUARD]);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissionNames = collect($permissions)
            ->flatMap(fn (array $actions, string $entity) => collect($actions)->map(fn (string $action) => "{$entity}.{$action}"))
            ->values()
            ->all();

        foreach ($this->roles($permissionNames) as $role => $rolePermissions) {
            $roleModel = Role::firstOrCreate(['name' => $role, 'guard_name' => self::GUARD]);

            $roleModel->syncPermissions($rolePermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * The canonical list of permissions, grouped by entity.
     *
     * Adding a new key/value here is all that's needed to have it created
     * the next time this seeder runs.
     *
     * @return array<string, array<int, string>>
     */
    protected function permissions(): array
    {
        return [
            'roles' => ['view', 'create', 'update', 'delete'],
            'permissions' => ['view', 'create', 'update', 'delete'],
            'users' => ['view', 'create', 'update', 'delete'],
            'wards' => ['view', 'create', 'update', 'delete'],
        ];
    }

    /**
     * The canonical list of roles and the permissions each should have.
     *
     * @param  array<int, string>  $permissionNames
     * @return array<string, array<int, string>>
     */
    protected function roles(array $permissionNames): array
    {
        $all = collect($permissionNames);

        return [
            'super_admin' => $all->all(),
            'admin' => $all->all(),
            'user' => $all
                ->filter(fn (string $permission) => str_starts_with($permission, 'users.'))
                ->filter(fn (string $permission) => str_ends_with($permission, '.view'))
                ->values()
                ->all(),
        ];
    }
}
