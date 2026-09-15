<?php

use App\Models\User;
use Database\Seeders\RbacSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(RbacSeeder::class);
});

test('guests are redirected from the roles listing', function () {
    $response = $this->get(route('admin.roles.index'));
    $response->assertRedirect(route('login'));
});

test('users without the roles.view permission cannot access the roles listing', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $response = $this->actingAs($user)->get(route('admin.roles.index'));
    $response->assertForbidden();
});

test('an admin user can view the roles listing', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get(route('admin.roles.index'));
    $response->assertOk();
});

test('an admin user can create a role with permissions', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $permission = Permission::where('guard_name', 'web')->where('name', 'users.view')->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->from(route('admin.roles.create'))
        ->post(route('admin.roles.store'), [
            'name' => 'auditor',
            'permissions' => [$permission->id],
        ]);

    $response->assertRedirect(route('admin.roles.index'));

    $role = Role::where('guard_name', 'web')->where('name', 'auditor')->firstOrFail();
    expect($role->permissions->pluck('id')->all())->toBe([$permission->id]);
});

test('role names must be unique per guard when creating a role', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this
        ->actingAs($user)
        ->from(route('admin.roles.create'))
        ->post(route('admin.roles.store'), [
            'name' => 'admin',
        ]);

    $response->assertSessionHasErrors('name');
    expect(Role::where('guard_name', 'web')->where('name', 'admin')->count())->toBe(1);
});

test('an admin user can update a role', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $role = Role::where('guard_name', 'web')->where('name', 'user')->firstOrFail();
    $permission = Permission::where('guard_name', 'web')->where('name', 'users.view')->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->patch(route('admin.roles.update', $role), [
            'name' => 'viewer',
            'permissions' => [$permission->id],
        ]);

    $response->assertRedirect(route('admin.roles.index'));

    $role->refresh();
    expect($role->name)->toBe('viewer');
    expect($role->permissions->pluck('id')->all())->toBe([$permission->id]);
});

test('an admin user can delete a role', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $role = Role::where('guard_name', 'web')->where('name', 'user')->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->delete(route('admin.roles.destroy', $role));

    $response->assertRedirect(route('admin.roles.index'));
    expect(Role::find($role->id))->toBeNull();
});
