<?php

use App\Models\OtherMetric;
use App\Models\User;
use App\OtherMetricsStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $this->userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

    $permissions = collect([
        'other_metrics.view',
        'other_metrics.create',
        'other_metrics.update',
        'other_metrics.delete',
    ])->map(fn ($name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));

    $this->adminRole->syncPermissions($permissions);

    $this->admin = User::factory()->create()->assignRole('admin');
    $this->regularUser = User::factory()->create()->assignRole('user');

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('admin can view other metrics index', function () {
    OtherMetric::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get(route('admin.other-metrics.index'));

    $response->assertStatus(200);
    $this->assertEquals(3, OtherMetric::count());
});

test('admin can view other metrics index with a search filter', function () {
    OtherMetric::factory()->create(['name' => 'Blood Pressure']);
    OtherMetric::factory()->create(['name' => 'Heart Rate']);
    OtherMetric::factory()->create(['name' => 'Glucose Level']);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.other-metrics.index', ['search' => 'Heart']));

    $response->assertStatus(200);
    $this->assertEquals(1, OtherMetric::where('name', 'like', '%Heart%')->count());
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/other-metrics/index')
        ->where('filters.search', 'Heart'));
});

test('admin can view other metrics index with a status filter', function () {
    OtherMetric::factory()->create(['name' => 'Blood Pressure', 'status' => 'Active']);
    OtherMetric::factory()->create(['name' => 'Heart Rate', 'status' => 'Inactive']);
    OtherMetric::factory()->create(['name' => 'Glucose', 'status' => 'Active']);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.other-metrics.index', ['status' => 'Inactive']));

    $response->assertStatus(200);
    $this->assertEquals(1, OtherMetric::where('status', 'Inactive')->count());
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/other-metrics/index')
        ->where('filters.status', 'Inactive'));
});

test('admin can paginate other metrics', function () {
    OtherMetric::factory()->count(12)->create();

    $response = $this->actingAs($this->admin)
        ->get(route('admin.other-metrics.index', ['per_page' => 5]));

    $response->assertStatus(200);
    $this->assertEquals(12, OtherMetric::count());
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/other-metrics/index')
        ->where('pagination.per_page', 5)
        ->where('pagination.current_page', 1)
        ->where('pagination.total', 12));
});

test('admin can create an other metric', function () {
    $data = [
        'name' => 'Blood Pressure',
        'status' => 'Active',
    ];

    $response = $this->actingAs($this->admin)->post(route('admin.other-metrics.store'), $data);

    $response->assertRedirect(route('admin.other-metrics.index'));
    $this->assertDatabaseHas('other_metrics', [
        'name' => 'Blood Pressure',
        'status' => 'Active',
    ]);
});

test('admin can update an other metric', function () {
    $metric = OtherMetric::factory()->create([
        'name' => 'Blood Pressure',
        'status' => 'Active',
    ]);

    $data = [
        'name' => 'Heart Rate',
        'status' => 'Inactive',
    ];

    $response = $this->actingAs($this->admin)->patch(route('admin.other-metrics.update', $metric), $data);

    $response->assertRedirect(route('admin.other-metrics.index'));
    $this->assertDatabaseHas('other_metrics', [
        'id' => $metric->id,
        'name' => 'Heart Rate',
        'status' => 'Inactive',
    ]);
});

test('admin can rename an other metric to its own current name', function () {
    $metric = OtherMetric::factory()->create([
        'name' => 'Blood Pressure',
        'status' => 'Active',
    ]);
    OtherMetric::factory()->create(['name' => 'Heart Rate']);

    $data = [
        'name' => 'Blood Pressure',
        'status' => 'Active',
    ];

    $response = $this->actingAs($this->admin)->patch(route('admin.other-metrics.update', $metric), $data);

    $response->assertRedirect(route('admin.other-metrics.index'));
    $this->assertDatabaseHas('other_metrics', [
        'id' => $metric->id,
        'name' => 'Blood Pressure',
    ]);
});

test('admin cannot rename an other metric to another metric name', function () {
    $metric = OtherMetric::factory()->create([
        'name' => 'Blood Pressure',
        'status' => 'Active',
    ]);
    OtherMetric::factory()->create(['name' => 'Heart Rate']);

    $data = [
        'name' => 'Heart Rate',
        'status' => 'Active',
    ];

    $response = $this->actingAs($this->admin)->patch(route('admin.other-metrics.update', $metric), $data);

    $response->assertSessionHasErrors('name');
    $this->assertDatabaseHas('other_metrics', [
        'id' => $metric->id,
        'name' => 'Blood Pressure',
    ]);
});

test('admin can delete an other metric', function () {
    $metric = OtherMetric::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('admin.other-metrics.destroy', $metric));

    $response->assertRedirect(route('admin.other-metrics.index'));
    $this->assertDatabaseMissing('other_metrics', ['id' => $metric->id]);
});

test('regular user cannot view other metrics index', function () {
    $response = $this->actingAs($this->regularUser)->get(route('admin.other-metrics.index'));

    $response->assertStatus(403);
});

test('regular user cannot create an other metric', function () {
    $response = $this->actingAs($this->regularUser)->post(route('admin.other-metrics.store'), [
        'name' => 'Blood Pressure',
        'status' => 'Active',
    ]);

    $response->assertStatus(403);
});

test('other metric name is required', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.other-metrics.store'), [
        'status' => 'Active',
    ]);

    $response->assertSessionHasErrors('name');
});

test('other metric name must be unique', function () {
    OtherMetric::factory()->create(['name' => 'Blood Pressure']);

    $response = $this->actingAs($this->admin)->post(route('admin.other-metrics.store'), [
        'name' => 'Blood Pressure',
        'status' => 'Active',
    ]);

    $response->assertSessionHasErrors('name');
});

test('other metric status must be Active or Inactive', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.other-metrics.store'), [
        'name' => 'Blood Pressure',
        'status' => 'InvalidStatus',
    ]);

    $response->assertSessionHasErrors('status');
});

test('check name endpoint reports existing names', function () {
    OtherMetric::factory()->create(['name' => 'Blood Pressure']);

    $response = $this->actingAs($this->admin)
        ->getJson(route('admin.other-metrics.check-name', ['name' => 'Blood Pressure']));

    $response->assertStatus(200);
    $response->assertJson(['exists' => true]);
});

test('check name endpoint reports available names', function () {
    $response = $this->actingAs($this->admin)
        ->getJson(route('admin.other-metrics.check-name', ['name' => 'Heart Rate']));

    $response->assertStatus(200);
    $response->assertJson(['exists' => false]);
});

test('check name endpoint can ignore a specific id', function () {
    $metric = OtherMetric::factory()->create(['name' => 'Blood Pressure']);

    $response = $this->actingAs($this->admin)
        ->getJson(route('admin.other-metrics.check-name', [
            'name' => 'Blood Pressure',
            'ignore' => $metric->id,
        ]));

    $response->assertStatus(200);
    $response->assertJson(['exists' => false]);
});

test('check name endpoint requires a name', function () {
    $response = $this->actingAs($this->admin)
        ->getJson(route('admin.other-metrics.check-name', []));

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name']);
});

test('regular user cannot call check name endpoint', function () {
    $response = $this->actingAs($this->regularUser)
        ->getJson(route('admin.other-metrics.check-name', ['name' => 'Blood Pressure']));

    $response->assertStatus(403);
});

test('other metric model uses ulid primary key', function () {
    $metric = OtherMetric::factory()->create();

    $this->assertIsString($metric->id);
    $this->assertEquals(26, strlen($metric->id));
});

test('other metric status is cast to OtherMetricsStatus enum', function () {
    $metric = OtherMetric::factory()->create(['status' => 'Active']);

    $this->assertInstanceOf(OtherMetricsStatus::class, $metric->status);
    $this->assertEquals('Active', $metric->status->value);
});
