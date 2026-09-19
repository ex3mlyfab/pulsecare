<?php

use App\Models\Clinic;
use App\Models\ClinicAttendance;
use App\Models\OtherMetric;
use App\Models\RecordStat;
use App\Models\User;
use App\Models\Ward;
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

test('dashboard renders with live record stats, flow, and census metrics', function () {
    $wardA = Ward::factory()->create([
        'name' => 'Trauma Ward',
        'status' => 'Active',
        'beds_count' => 20,
    ]);

    $wardB = Ward::factory()->create([
        'name' => 'Maternity Ward',
        'status' => 'Active',
        'beds_count' => 30,
    ]);

    RecordStat::factory()->create([
        'ward_id' => $wardA->id,
        'stat_date' => Date::today(),
        'inpatients' => 15,
        'admission' => 6,
        'discharges' => 2,
        'emergencies' => 4,
        'trans_in' => 1,
        'trans_out' => 0,
        'death' => 0,
        'sama' => 0,
        'abscond' => 0,
    ]);

    RecordStat::factory()->create([
        'ward_id' => $wardB->id,
        'stat_date' => Date::today(),
        'inpatients' => 10,
        'admission' => 3,
        'discharges' => 4,
        'emergencies' => 1,
        'trans_in' => 0,
        'trans_out' => 1,
        'death' => 0,
        'sama' => 0,
        'abscond' => 0,
    ]);

    $clinic = Clinic::factory()->create([
        'name' => 'Eye Clinic',
        'operating_days' => [Date::today()->format('l')],
    ]);

    ClinicAttendance::factory()->create([
        'clinic_id' => $clinic->id,
        'stat_date' => Date::today(),
        'outpatients' => 18,
    ]);

    $response = $this->actingAs($this->admin)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('census.total_beds', 50)
        ->where('census.total_inpatients', 25)
        ->where('census.available_beds', 25)
        ->where('census.occupancy_rate', 50)
        ->where('census.surge_status', 'optimal')
        ->where('flow.admissions', 9)
        ->where('flow.discharges', 6)
        ->where('flow.emergencies', 5)
        ->where('flow.net_flow', 3)
        ->where('clinics.total_outpatients', 18)
        ->has('trend', 7)
        ->has('ward_breakdown', 2)
    );
});

test('dashboard attention queue flags surge wards, mortalities, and irregular exits', function () {
    $ward = Ward::factory()->create([
        'name' => 'Intensive Care Unit',
        'status' => 'Active',
        'beds_count' => 10,
    ]);

    RecordStat::factory()->create([
        'ward_id' => $ward->id,
        'stat_date' => Date::today(),
        'inpatients' => 10, // 100% capacity
        'admission' => 2,
        'discharges' => 0,
        'death' => 1,
        'sama' => 1,
        'abscond' => 0,
        'trans_in' => 2,
        'trans_out' => 1,
    ]);

    $response = $this->actingAs($this->admin)->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('census.occupancy_rate', 100)
        ->where('census.surge_status', 'surge')
        ->has('attention_queue', 4) // surge, mortality, irregular exit (SAMA), transfers
    );
});

test('inactive wards are excluded from dashboard bed census and breakdown', function () {
    Ward::factory()->create([
        'name' => 'Active Ward',
        'status' => 'Active',
        'beds_count' => 20,
    ]);

    Ward::factory()->create([
        'name' => 'Closed Ward',
        'status' => 'Inactive',
        'beds_count' => 15,
    ]);

    $response = $this->actingAs($this->admin)->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('census.total_beds', 20)
        ->has('ward_breakdown', 1)
        ->where('ward_breakdown.0.name', 'Active Ward')
    );
});
