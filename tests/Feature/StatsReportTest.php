<?php

use App\Models\Clinic;
use App\Models\ClinicAttendance;
use App\Models\DailyMetricValue;
use App\Models\OtherMetric;
use App\Models\RecordStat;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $permissions = collect([
        'record_stats.view',
        'record_stats.update',
    ])->map(fn ($name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));

    $this->adminRole->syncPermissions($permissions);

    $this->admin = User::factory()->create()->assignRole('admin');

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('admin can view the stats report with a date range', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);
    $clinic = Clinic::factory()->create(['name' => 'Main Clinic']);
    $metric = OtherMetric::factory()->create(['name' => 'Blood Draws']);

    $start = Carbon::today()->subDays(10);
    $end = Carbon::today();

    RecordStat::factory()->create([
        'ward_id' => $ward->id,
        'stat_date' => $start->copy()->addDays(5),
        'admission' => 4,
        'discharges' => 2,
        'trans_in' => 0,
        'trans_out' => 0,
        'referred_out' => 0,
        'referred_in' => 0,
        'emergencies' => 0,
        'sama' => 0,
        'abscond' => 0,
        'outpatients' => 0,
        'inpatients' => 0,
        'death' => 0,
    ]);

    ClinicAttendance::factory()->create([
        'clinic_id' => $clinic->id,
        'stat_date' => $start->copy()->addDays(5),
        'outpatients' => 12,
    ]);

    DailyMetricValue::factory()->create([
        'other_metric_id' => $metric->id,
        'stat_date' => $start->copy()->addDays(5),
        'value' => 6,
    ]);

    $response = $this->actingAs($this->admin)->get(
        route('stats-report.index', [
            'date_from' => $start->toDateString(),
            'date_to' => $end->toDateString(),
        ])
    );

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('stats-report/index')
        ->where('filters.date_from', $start->copy()->toDateString())
        ->where('filters.date_to', $end->copy()->toDateString())
        ->where('wardReport.0.grand_total', 6)
        ->where('wardReport.0.metrics.'.$start->copy()->addDays(5)->toDateString().'.admission', 4)
        ->where('clinicReport.0.total', 12)
        ->where('otherMetricReport.0.total', 6));
});

test('the report ignores records outside the date range', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);

    RecordStat::factory()->create([
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->copy()->subDays(60),
        'admission' => 99,
    ]);

    $response = $this->actingAs($this->admin)->get(
        route('stats-report.index', [
            'date_from' => Carbon::today()->copy()->subDays(30)->toDateString(),
            'date_to' => Carbon::today()->toDateString(),
        ])
    );

    $response->assertInertia(fn (Assert $page) => $page
        ->where('wardReport', []));
});

test('the report respects the ward filter', function () {
    $activeWard = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);
    $otherWard = Ward::factory()->create(['name' => 'General Ward', 'status' => 'Active']);

    RecordStat::factory()->create([
        'ward_id' => $activeWard->id,
        'stat_date' => Carbon::today(),
        'admission' => 10,
    ]);
    RecordStat::factory()->create([
        'ward_id' => $otherWard->id,
        'stat_date' => Carbon::today(),
        'admission' => 30,
    ]);

    $response = $this->actingAs($this->admin)->get(
        route('stats-report.index', [
            'date_from' => Carbon::today()->toDateString(),
            'date_to' => Carbon::today()->toDateString(),
            'ward_id' => $activeWard->id,
        ])
    );

    $response->assertInertia(fn (Assert $page) => $page
        ->has('wardReport', 1)
        ->where('wardReport.0.ward_id', $activeWard->id));
});

test('the name search narrows the ward series', function () {
    $ward = Ward::factory()->create(['name' => 'Neonatal Unit', 'status' => 'Active']);
    RecordStat::factory()->create([
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today(),
        'admission' => 5,
    ]);

    $response = $this->actingAs($this->admin)->get(
        route('stats-report.index', [
            'date_from' => Carbon::today()->toDateString(),
            'date_to' => Carbon::today()->toDateString(),
            'search' => 'Neonatal',
        ])
    );

    $response->assertInertia(fn (Assert $page) => $page
        ->where('filters.search', 'Neonatal'));
});

test('a regular user without the view permission is denied', function () {
    $this->viewer = User::factory()->create();

    $response = $this->actingAs($this->viewer)->get(route('stats-report.index'));

    $response->assertStatus(403);
});
