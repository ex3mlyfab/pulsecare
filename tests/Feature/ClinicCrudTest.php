<?php

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $this->userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

    $permissions = collect([
        'clinics.view',
        'clinics.create',
        'clinics.update',
        'clinics.delete',
    ])->map(fn ($name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));

    $this->adminRole->syncPermissions($permissions);

    $this->admin = User::factory()->create()->assignRole('admin');
    $this->regularUser = User::factory()->create()->assignRole('user');

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('admin can view clinics index', function () {
    Clinic::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get(route('admin.clinics.index'));

    $response->assertStatus(200);
    $this->assertEquals(3, Clinic::count());
});

test('admin can create a clinic', function () {
    $data = [
        'name' => 'Cardiology Clinic',
        'location' => 'Main campus, 2nd floor',
        'operating_days' => ['Monday', 'Wednesday'],
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.clinics.store'), $data);

    $response->assertRedirect(route('admin.clinics.index'));
    $this->assertDatabaseHas('clinics', [
        'name' => 'Cardiology Clinic',
        'location' => 'Main campus, 2nd floor',
    ]);

    $clinic = Clinic::where('name', 'Cardiology Clinic')->first();
    $this->assertEquals(['Monday', 'Wednesday'], $clinic->operating_days);
});

test('admin can update a clinic', function () {
    $clinic = Clinic::factory()->create([
        'name' => 'Dental Clinic',
        'operating_days' => ['Monday'],
    ]);

    $data = [
        'name' => 'Updated Dental Clinic',
        'location' => 'Building B',
        'operating_days' => ['Tuesday', 'Friday'],
    ];

    $response = $this->actingAs($this->admin)->patch(route('admin.clinics.update', $clinic), $data);

    $response->assertRedirect(route('admin.clinics.index'));
    $this->assertDatabaseHas('clinics', [
        'id' => $clinic->id,
        'name' => 'Updated Dental Clinic',
        'location' => 'Building B',
    ]);

    $this->assertEquals(['Tuesday', 'Friday'], $clinic->fresh()->operating_days);
});

test('admin can delete a clinic', function () {
    $clinic = Clinic::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('admin.clinics.destroy', $clinic));

    $response->assertRedirect(route('admin.clinics.index'));
    $this->assertDatabaseMissing('clinics', ['id' => $clinic->id]);
});

test('regular user cannot view clinics index', function () {
    $response = $this->actingAs($this->regularUser)->get(route('admin.clinics.index'));

    $response->assertStatus(403);
});

test('regular user cannot create a clinic', function () {
    $response = $this->actingAs($this->regularUser)->post(route('admin.clinics.store'), [
        'name' => 'Test Clinic',
        'operating_days' => ['Monday'],
    ]);

    $response->assertStatus(403);
});

test('clinic name is required', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.clinics.store'), [
        'operating_days' => ['Monday'],
    ]);

    $response->assertSessionHasErrors('name');
});

test('clinic name must be unique', function () {
    Clinic::factory()->create(['name' => 'Eye Clinic']);

    $response = $this->actingAs($this->admin)->post(route('admin.clinics.store'), [
        'name' => 'Eye Clinic',
        'operating_days' => ['Monday'],
    ]);

    $response->assertSessionHasErrors('name');
});

test('operating days are required to be present', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.clinics.store'), [
        'name' => 'Test Clinic',
    ]);

    $response->assertSessionHasErrors('operating_days');
});

test('operating days must be valid day names', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.clinics.store'), [
        'name' => 'Test Clinic',
        'operating_days' => ['NotADay'],
    ]);

    $response->assertSessionHasErrors('operating_days.0');
});

test('location is optional and can be null', function () {
    $data = [
        'name' => 'Test Clinic',
        'operating_days' => ['Monday'],
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.clinics.store'), $data);

    $response->assertRedirect(route('admin.clinics.index'));
    $this->assertDatabaseHas('clinics', [
        'name' => 'Test Clinic',
        'location' => null,
    ]);
});

test('clinic model uses ulid primary key', function () {
    $clinic = Clinic::factory()->create();

    $this->assertIsString($clinic->id);
    $this->assertEquals(26, strlen($clinic->id));
});

test('clinic operating days are cast to array', function () {
    $clinic = Clinic::factory()->create(['operating_days' => ['Monday', 'Tuesday']]);

    $this->assertSame(['Monday', 'Tuesday'], $clinic->operating_days);
});
