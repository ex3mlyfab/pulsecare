<?php

use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(RbacSeeder::class);
});

test('guests are redirected from the users listing', function () {
    $response = $this->get(route('admin.users.index'));
    $response->assertRedirect(route('login'));
});

test('users without the users.view permission cannot access the users listing', function () {
    // A fresh user with no roles has no `users.view` permission.
    $stranger = User::factory()->create();

    $response = $this->actingAs($stranger)->get(route('admin.users.index'));
    $response->assertForbidden();
});

test('an admin user can view the users listing', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    User::factory(3)->create();

    $response = $this->actingAs($admin)->get(route('admin.users.index'));
    $response->assertOk();
});

test('an admin user can create a user with roles', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $role = Role::where('guard_name', 'web')->where('name', 'user')->firstOrFail();

    $response = $this
        ->actingAs($admin)
        ->from(route('admin.users.create'))
        ->post(route('admin.users.store'), [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'roles' => [$role->id],
        ]);

    $response->assertRedirect(route('admin.users.index'));

    $user = User::where('email', 'new@example.com')->firstOrFail();
    expect($user->name)->toBe('New User');
    expect(Hash::check('secret-password', $user->password))->toBeTrue();
    expect($user->roles->pluck('name')->all())->toBe(['user']);
});

test('user emails must be unique when creating a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $existing = User::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->from(route('admin.users.create'))
        ->post(route('admin.users.store'), [
            'name' => 'Duplicate',
            'email' => $existing->email,
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ]);

    $response->assertSessionHasErrors('email');
    expect(User::where('email', $existing->email)->count())->toBe(1);
});

test('an admin user can update a user and reassign roles', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $target = User::factory()->create();
    $role = Role::where('guard_name', 'web')->where('name', 'user')->firstOrFail();

    $response = $this
        ->actingAs($admin)
        ->patch(route('admin.users.update', $target), [
            'name' => 'Renamed User',
            'email' => $target->email,
            'password' => '',
            'password_confirmation' => '',
            'roles' => [$role->id],
        ]);

    $response->assertRedirect(route('admin.users.index'));

    $target->refresh();
    expect($target->name)->toBe('Renamed User');
    expect($target->roles->pluck('id')->all())->toBe([$role->id]);
});

test('an admin user can delete a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $target = User::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->delete(route('admin.users.destroy', $target));

    $response->assertRedirect(route('admin.users.index'));
    expect(User::find($target->id))->toBeNull();
});

test('an admin user cannot delete their own account', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this
        ->actingAs($admin)
        ->delete(route('admin.users.destroy', $admin));

    $response->assertRedirect(route('admin.users.index'));
    expect(User::find($admin->id))->not->toBeNull();
});
