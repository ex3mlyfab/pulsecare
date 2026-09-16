<?php

use App\Models\User;
use Database\Seeders\RbacSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('rbac seeder creates the canonical permissions and roles', function () {
    $this->seed(RbacSeeder::class);

    expect(Permission::where('guard_name', 'web')->count())->toBe(12);
    expect(Role::where('guard_name', 'web')->count())->toBe(3);
});

test('rbac seeder is idempotent and re-syncs role permissions', function () {
    $this->seed(RbacSeeder::class);

    $this->seed(RbacSeeder::class);

    expect(Permission::where('guard_name', 'web')->count())->toBe(12);
    expect(Role::where('guard_name', 'web')->count())->toBe(3);
});

test('admin role is seeded with full permission access', function () {
    $this->seed(RbacSeeder::class);

    $admin = Role::where('guard_name', 'web')->where('name', 'admin')->firstOrFail();
    $user = Role::where('guard_name', 'web')->where('name', 'user')->firstOrFail();

    expect($admin->permissions->count())->toBe(12);
    expect($user->permissions->pluck('name')->all())->toBe(['users.view']);
});

test('super_admin role is seeded with full permission access', function () {
    $this->seed(RbacSeeder::class);

    $superAdmin = Role::where('guard_name', 'web')->where('name', 'super_admin')->firstOrFail();

    expect($superAdmin->permissions->count())->toBe(12);
});

test('users seeded through the database seeder have no role by default', function () {
    $user = User::factory()->create();

    expect($user->roles->count())->toBe(0);
});

test('re-running the seeder after adding a permission picks it up', function () {
    $this->seed(RbacSeeder::class);

    // Simulate a developer extending the canonical permission/role lists
    // (e.g. adding a `patients.view` permission and granting it to `admin`),
    // then re-running the seeder: the seeder must pick up the new entries.
    $extended = new class extends RbacSeeder
    {
        protected function permissions(): array
        {
            $permissions = parent::permissions();
            $permissions['patients'] = ['view'];

            return $permissions;
        }
    };

    $extended->run();

    expect(Permission::where('guard_name', 'web')->where('name', 'patients.view')->exists())->toBeTrue();

    $admin = Role::where('guard_name', 'web')->where('name', 'admin')->firstOrFail();
    expect($admin->permissions->pluck('name')->all())->toContain('patients.view');
});
