<?php

use App\Models\User;
use Database\Seeders\RbacSeeder;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    $this->seed(RbacSeeder::class);
});

test('guests are redirected from the permissions listing', function () {
    $response = $this->get(route('admin.permissions.index'));
    $response->assertRedirect(route('login'));
});

test('users without the permissions.view permission cannot access the permissions listing', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $response = $this->actingAs($user)->get(route('admin.permissions.index'));
    $response->assertForbidden();
});

test('an admin user can view the permissions listing', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get(route('admin.permissions.index'));
    $response->assertOk();
});

test('an admin user can create a permission', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this
        ->actingAs($user)
        ->from(route('admin.permissions.create'))
        ->post(route('admin.permissions.store'), [
            'name' => 'users.export',
        ]);

    $response->assertRedirect(route('admin.permissions.index'));
    expect(Permission::where('guard_name', 'web')->where('name', 'users.export')->exists())->toBeTrue();
});

test('permission names must be unique per guard when creating a permission', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this
        ->actingAs($user)
        ->from(route('admin.permissions.create'))
        ->post(route('admin.permissions.store'), [
            'name' => 'users.view',
        ]);

    $response->assertSessionHasErrors('name');
});

test('an admin user can update a permission', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $permission = Permission::where('guard_name', 'web')->where('name', 'users.view')->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->patch(route('admin.permissions.update', $permission), [
            'name' => 'users.read',
        ]);

    $response->assertRedirect(route('admin.permissions.index'));
    expect($permission->refresh()->name)->toBe('users.read');
});

test('an admin user can delete a permission', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $permission = Permission::where('guard_name', 'web')->where('name', 'users.view')->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->delete(route('admin.permissions.destroy', $permission));

    $response->assertRedirect(route('admin.permissions.index'));
    expect(Permission::find($permission->id))->toBeNull();
});
