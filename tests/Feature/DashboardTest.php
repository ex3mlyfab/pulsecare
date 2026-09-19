<?php

use App\Models\Clinic;
use App\Models\ClinicAttendance;
use App\Models\OtherMetric;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Date;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $this->userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

    $permissions = collect([
        'dashboard.view',
        'dashboard.update',
        'record_stats.view',
        'record_stats.update',
        'clinics.view',
        'other_metrics.view',
    ])->map(fn ($name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));

    $this->adminRole->syncPermissions($permissions);
    $this->userRole->syncPermissions(collect($permissions)
        ->filter(fn ($permission) => str_starts_with($permission->name, 'dashboard.view'))
        ->all());

    $this->admin = User::factory()->create()->assignRole('admin');
    $this->regularUser = User::factory()->create()->assignRole('user');

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users with dashboard.view can visit the dashboard', function () {
    $response = $this->actingAs($this->regularUser)->get(route('dashboard'));
    $response->assertOk();
});

test('a user without record_stats.update cannot visit the dashboard write actions', function () {
    $response = $this->actingAs($this->regularUser)->get(route('dashboard'));
    $response->assertOk();

    $clinic = Clinic::factory()->create();
    $response = $this->actingAs($this->regularUser)->post(route('dashboard.attendance.store'), [
        'stat_date' => Date::today()->toDateString(),
        'clinics' => [['clinic_id' => $clinic->id, 'outpatients' => 1]],
    ]);

    $response->assertStatus(403);
});

test('a user without record_stats.update cannot store metric values', function () {
    $metric = OtherMetric::factory()->create();
    $response = $this->actingAs($this->regularUser)->post(route('dashboard.metric-values.store'), [
        'stat_date' => Date::today()->toDateString(),
        'metrics' => [['other_metric_id' => $metric->id, 'value' => 1]],
    ]);

    $response->assertStatus(403);
});

test('the record stats index provides clinics and other metrics props', function () {
    $weekday = Date::today()->format('l');
    $otherDay = Date::today()->addDay()->format('l');

    $operating = Clinic::factory()->create([
        'name' => 'General Clinic',
        'operating_days' => [$weekday, $otherDay],
    ]);

    $freshDays = $operating->fresh()->operating_days;
    $this->assertSame(
        [$weekday, $otherDay],
        $freshDays,
        'operating_days should round-trip as an array, got: '.json_encode($freshDays)
    );

    ClinicAttendance::factory()->create([
        'clinic_id' => $operating->id,
        'stat_date' => Date::today(),
        'outpatients' => 12,
    ]);

    $response = $this->actingAs($this->admin)->get(route('record-stats.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('record-stats/index')
        ->where('date', Date::today()->format('d-M-Y'))
        ->where('weekday', Date::today()->format('l'))
        ->has('clinics', 1)
        ->where('clinics.0.name', 'General Clinic')
        ->where('clinics.0.outpatients', 12)
        ->where('totalPatients', 12));
});

test('admin can store clinic attendance', function () {
    $weekday = Date::today()->format('l');
    $clinic = Clinic::factory()->create(['operating_days' => [$weekday]]);

    $response = $this->actingAs($this->admin)->post(route('dashboard.attendance.store'), [
        'stat_date' => Date::today()->toDateString(),
        'clinics' => [
            ['clinic_id' => $clinic->id, 'outpatients' => 7],
        ],
    ]);

    $response->assertRedirect(route('record-stats.index'));
    $this->assertDatabaseHas('clinic_attendances', [
        'clinic_id' => $clinic->id,
        'outpatients' => 7,
    ]);
});

test('a user without record_stats.update cannot store clinic attendance', function () {
    $clinic = Clinic::factory()->create(['operating_days' => [Date::today()->format('l')]]);

    $response = $this->actingAs($this->regularUser)->post(route('dashboard.attendance.store'), [
        'stat_date' => Date::today()->toDateString(),
        'clinics' => [
            ['clinic_id' => $clinic->id, 'outpatients' => 7],
        ],
    ]);

    $response->assertForbidden();
});

test('admin can store other metric values', function () {
    $metric = OtherMetric::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('dashboard.metric-values.store'), [
        'stat_date' => Date::today()->toDateString(),
        'metrics' => [
            ['other_metric_id' => $metric->id, 'value' => 5],
        ],
    ]);

    $response->assertRedirect(route('record-stats.index'));
    $this->assertDatabaseHas('daily_metric_values', [
        'other_metric_id' => $metric->id,
        'value' => 5,
    ]);
});
