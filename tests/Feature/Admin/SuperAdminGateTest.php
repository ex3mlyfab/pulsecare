<?php

use App\Models\User;
use Database\Seeders\RbacSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('a user with the super_admin role passes every gate', function () {
    $this->seed(RbacSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('super_admin');

    // Existing seeded abilities
    expect($user->can('roles.view'))->toBeTrue();
    expect($user->can('roles.create'))->toBeTrue();
    expect($user->can('users.delete'))->toBeTrue();

    // A permission created at runtime that the role was not explicitly granted
    Permission::create(['name' => 'patients.view', 'guard_name' => 'web']);
    expect($user->can('patients.view'))->toBeTrue();
});

test('a user with the admin role still uses per-permission gates', function () {
    $this->seed(RbacSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('admin');

    // admin has all seeded permissions, but no runtime-created ones
    expect($user->can('roles.view'))->toBeTrue();

    $adminRole = Role::where('name', 'admin')->where('guard_name', 'web')->firstOrFail();
    $adminRole->givePermissionTo(Permission::create(['name' => 'patients.view', 'guard_name' => 'web']));

    expect($user->can('patients.view'))->toBeTrue();
    expect($user->can('other.area.view'))->toBeFalse();
});

test('a user without the super_admin role does not pass gates', function () {
    $this->seed(RbacSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('user');

    expect($user->can('roles.view'))->toBeFalse();
    expect($user->can('users.create'))->toBeFalse();
});
