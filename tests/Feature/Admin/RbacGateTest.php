<?php

use App\Models\User;
use Database\Seeders\RbacSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('a user with the admin role can pass the roles.view gate', function () {
    $this->seed(RbacSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('admin');

    expect($user->can('roles.view'))->toBeTrue();
    expect($user->can('roles.create'))->toBeTrue();
    expect($user->can('roles.delete'))->toBeTrue();
});

test('a user with the user role cannot pass the roles.view gate', function () {
    $this->seed(RbacSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('user');

    expect($user->can('roles.view'))->toBeFalse();
    expect($user->can('users.view'))->toBeTrue();
});

test('a user with no roles cannot pass the roles.view gate', function () {
    $user = User::factory()->create();

    expect($user->can('roles.view'))->toBeFalse();
});

test('permission records created via CRUD are picked up by the gate', function () {
    $this->seed(RbacSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('admin');

    Permission::create(['name' => 'patients.view', 'guard_name' => 'web']);

    $role = Role::where('name', 'admin')->where('guard_name', 'web')->firstOrFail();
    $role->givePermissionTo('patients.view');

    expect($user->can('patients.view'))->toBeTrue();
});
