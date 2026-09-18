<?php

use App\Models\User;
use App\Models\Ward;
use App\WardStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $this->matronRole = Role::firstOrCreate(['name' => 'matron', 'guard_name' => 'web']);
    $this->userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

    $permissions = collect([
        'wards.view',
        'wards.create',
        'wards.update',
        'wards.delete',
    ])->map(fn ($name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));

    $this->adminRole->syncPermissions($permissions);

    $this->admin = User::factory()->create()->assignRole('admin');
    $this->matron = User::factory()->create()->assignRole('matron');
    $this->regularUser = User::factory()->create()->assignRole('user');

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('admin can view wards index', function () {
    Ward::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get(route('admin.wards.index'));

    $response->assertStatus(200);
    $this->assertEquals(3, Ward::count());
});

test('admin can create a ward', function () {
    $data = [
        'name' => 'ICU Ward',
        'location' => 'Building A, Floor 2',
        'status' => 'Active',
        'matron_in_charge_id' => $this->matron->id,
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.wards.store'), $data);

    $response->assertRedirect(route('admin.wards.index'));
    $this->assertDatabaseHas('wards', [
        'name' => 'ICU Ward',
        'location' => 'Building A, Floor 2',
        'status' => 'Active',
        'matron_in_charge_id' => $this->matron->id,
    ]);
});

test('admin can update a ward', function () {
    $ward = Ward::factory()->create([
        'name' => 'General Ward',
        'status' => 'Active',
    ]);

    $data = [
        'name' => 'Updated Ward',
        'location' => 'Building B',
        'status' => 'Inactive',
        'matron_in_charge_id' => $this->matron->id,
    ];

    $response = $this->actingAs($this->admin)->patch(route('admin.wards.update', $ward), $data);

    $response->assertRedirect(route('admin.wards.index'));
    $this->assertDatabaseHas('wards', [
        'id' => $ward->id,
        'name' => 'Updated Ward',
        'location' => 'Building B',
        'status' => 'Inactive',
        'matron_in_charge_id' => $this->matron->id,
    ]);
});

test('admin can delete a ward', function () {
    $ward = Ward::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('admin.wards.destroy', $ward));

    $response->assertRedirect(route('admin.wards.index'));
    $this->assertDatabaseMissing('wards', ['id' => $ward->id]);
});

test('regular user cannot view wards index', function () {
    $response = $this->actingAs($this->regularUser)->get(route('admin.wards.index'));

    $response->assertStatus(403);
});

test('regular user cannot create a ward', function () {
    $data = [
        'name' => 'ICU Ward',
        'location' => 'Building A',
        'status' => 'Active',
    ];

    $response = $this->actingAs($this->regularUser)->post(route('admin.wards.store'), $data);

    $response->assertStatus(403);
});

test('ward name is required', function () {
    $data = [
        'location' => 'Building A',
        'status' => 'Active',
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.wards.store'), $data);

    $response->assertSessionHasErrors('name');
});

test('ward status must be Active or Inactive', function () {
    $data = [
        'name' => 'Test Ward',
        'status' => 'InvalidStatus',
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.wards.store'), $data);

    $response->assertSessionHasErrors('status');
});

test('matron_in_charge_id must exist in users table', function () {
    $data = [
        'name' => 'Test Ward',
        'status' => 'Active',
        'matron_in_charge_id' => '00000000-0000-0000-0000-000000000000',
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.wards.store'), $data);

    $response->assertSessionHasErrors('matron_in_charge_id');
});

test('ward model uses ulid primary key', function () {
    $ward = Ward::factory()->create();

    $this->assertIsString($ward->id);
    $this->assertEquals(26, strlen($ward->id)); // ULID length
});

test('ward status is cast to WardStatus enum', function () {
    $ward = Ward::factory()->create(['status' => 'Active']);

    $this->assertInstanceOf(WardStatus::class, $ward->status);
    $this->assertEquals('Active', $ward->status->value);
});

test('ward belongs to matron in charge', function () {
    $ward = Ward::factory()->create(['matron_in_charge_id' => $this->matron->id]);

    $this->assertInstanceOf(User::class, $ward->matronInCharge);
    $this->assertEquals($this->matron->id, $ward->matronInCharge->id);
});

test('ward name must be unique', function () {
    Ward::factory()->create(['name' => 'ICU Ward']);

    $response = $this->actingAs($this->admin)->post(route('admin.wards.store'), [
        'name' => 'ICU Ward',
        'status' => 'Active',
    ]);

    $response->assertSessionHasErrors('name');
});

test('beds_count is optional and stored as integer', function () {
    $data = [
        'name' => 'Peds Ward',
        'beds_count' => 40,
        'status' => 'Active',
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.wards.store'), $data);

    $response->assertRedirect(route('admin.wards.index'));
    $this->assertDatabaseHas('wards', [
        'name' => 'Peds Ward',
        'beds_count' => 40,
    ]);
});

test('beds_count can be null', function () {
    $data = [
        'name' => 'Isolation Ward',
        'status' => 'Active',
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.wards.store'), $data);

    $response->assertRedirect(route('admin.wards.index'));
    $this->assertDatabaseHas('wards', [
        'name' => 'Isolation Ward',
        'beds_count' => null,
    ]);
});
