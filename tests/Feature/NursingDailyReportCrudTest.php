<?php

use App\Models\NursingDailyReport;
use App\Models\User;
use App\Models\Ward;
use App\NursingShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $this->userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

    $permissions = collect([
        'nursing_daily_reports.view',
        'nursing_daily_reports.create',
        'nursing_daily_reports.update',
        'nursing_daily_reports.delete',
    ])->map(fn ($name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));

    $this->adminRole->syncPermissions($permissions);

    $this->admin = User::factory()->create()->assignRole('admin');
    $this->regularUser = User::factory()->create()->assignRole('user');

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('admin can view nursing daily reports index', function () {
    NursingDailyReport::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get(route('nursing-daily-reports.index'));

    $response->assertStatus(200);
    $this->assertEquals(3, NursingDailyReport::count());
});

test('admin can filter nursing daily reports by search, shift, ward, and date', function () {
    $wardA = Ward::factory()->create(['name' => 'Pediatrics Ward']);
    $wardB = Ward::factory()->create(['name' => 'Maternity Ward']);

    $match = NursingDailyReport::factory()->create([
        'patient_name' => 'Alice Johnson',
        'hospital_number' => 'HN-9988A',
        'ward_id' => $wardA->id,
        'shift' => NursingShift::Morning,
        'creation_date' => '2026-10-15',
    ]);

    NursingDailyReport::factory()->create([
        'patient_name' => 'Bob Smith',
        'hospital_number' => 'HN-1122B',
        'ward_id' => $wardB->id,
        'shift' => NursingShift::Evening,
        'creation_date' => '2026-10-14',
    ]);

    $response = $this->actingAs($this->admin)->get(route('nursing-daily-reports.index', [
        'search' => 'Alice',
        'shift' => 'Morning',
        'ward_id' => $wardA->id,
        'date' => '2026-10-15',
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('nursing-daily-reports/index')
        ->has('reports', 1)
        ->where('reports.0.id', $match->id)
    );
});

test('admin can view nursing daily report create page', function () {
    $response = $this->actingAs($this->admin)->get(route('nursing-daily-reports.create'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('nursing-daily-reports/create')
        ->has('wards')
        ->has('users')
        ->has('shifts')
    );
});

test('admin can create a nursing daily report', function () {
    $ward = Ward::factory()->create();

    $data = [
        'patient_name' => 'John Doe',
        'hospital_number' => 'HN-12345',
        'report' => 'Patient resting well post-surgery.',
        'ward_id' => $ward->id,
        'shift' => 'Morning',
        'created_by' => 'Nurse Jane',
        'creation_date' => '2026-10-15',
        'reported_by_id' => $this->admin->id,
    ];

    $response = $this->actingAs($this->admin)->post(route('nursing-daily-reports.store'), $data);

    $response->assertRedirect(route('nursing-daily-reports.index'));
    $this->assertDatabaseHas('nursing_daily_reports', [
        'patient_name' => 'John Doe',
        'hospital_number' => 'HN-12345',
        'ward_id' => $ward->id,
        'shift' => 'Morning',
        'created_by' => 'Nurse Jane',
        'reported_by_id' => $this->admin->id,
    ]);

    $created = NursingDailyReport::where('hospital_number', 'HN-12345')->first();
    $this->assertNotNull($created);
    $this->assertEquals('2026-10-15', $created->creation_date->toDateString());
});

test('admin can view nursing daily report show page', function () {
    $report = NursingDailyReport::factory()->create();

    $response = $this->actingAs($this->admin)->get(route('nursing-daily-reports.show', $report));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('nursing-daily-reports/show')
        ->where('report.id', $report->id)
        ->where('report.patient_name', $report->patient_name)
    );
});

test('admin can view nursing daily report edit page', function () {
    $report = NursingDailyReport::factory()->create();

    $response = $this->actingAs($this->admin)->get(route('nursing-daily-reports.edit', $report));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('nursing-daily-reports/edit')
        ->where('report.id', $report->id)
    );
});

test('admin can update a nursing daily report', function () {
    $report = NursingDailyReport::factory()->create([
        'patient_name' => 'Original Name',
        'shift' => NursingShift::Morning,
    ]);

    $newWard = Ward::factory()->create();

    $data = [
        'patient_name' => 'Updated Patient',
        'hospital_number' => $report->hospital_number,
        'report' => 'Updated clinical observations.',
        'ward_id' => $newWard->id,
        'shift' => 'Evening',
        'created_by' => 'Nurse Alex',
        'creation_date' => '2026-10-16',
        'reported_by_id' => $this->admin->id,
    ];

    $response = $this->actingAs($this->admin)->patch(route('nursing-daily-reports.update', $report), $data);

    $response->assertRedirect(route('nursing-daily-reports.index'));
    $this->assertDatabaseHas('nursing_daily_reports', [
        'id' => $report->id,
        'patient_name' => 'Updated Patient',
        'ward_id' => $newWard->id,
        'shift' => 'Evening',
        'created_by' => 'Nurse Alex',
    ]);
});

test('admin can delete a nursing daily report', function () {
    $report = NursingDailyReport::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('nursing-daily-reports.destroy', $report));

    $response->assertRedirect(route('nursing-daily-reports.index'));
    $this->assertDatabaseMissing('nursing_daily_reports', ['id' => $report->id]);
});

test('regular user without permission cannot view nursing daily reports index', function () {
    $response = $this->actingAs($this->regularUser)->get(route('nursing-daily-reports.index'));

    $response->assertStatus(403);
});

test('regular user without permission cannot create a nursing daily report', function () {
    $ward = Ward::factory()->create();

    $data = [
        'patient_name' => 'Unauthorized Patient',
        'hospital_number' => 'HN-999',
        'report' => 'Some report text',
        'ward_id' => $ward->id,
        'shift' => 'Morning',
        'created_by' => 'User',
        'creation_date' => '2026-10-15',
        'reported_by_id' => $this->regularUser->id,
    ];

    $response = $this->actingAs($this->regularUser)->post(route('nursing-daily-reports.store'), $data);

    $response->assertStatus(403);
});

test('nursing daily report required fields validation', function () {
    $response = $this->actingAs($this->admin)->post(route('nursing-daily-reports.store'), []);

    $response->assertSessionHasErrors([
        'patient_name',
        'hospital_number',
        'report',
        'ward_id',
        'shift',
        'created_by',
        'creation_date',
        'reported_by_id',
    ]);
});

test('ward_id must exist in wards table', function () {
    $response = $this->actingAs($this->admin)->post(route('nursing-daily-reports.store'), [
        'patient_name' => 'Patient',
        'hospital_number' => 'HN-01',
        'report' => 'Test',
        'ward_id' => '01AN4Z07BY79KA480707ERQ5XX',
        'shift' => 'Morning',
        'created_by' => 'Nurse',
        'creation_date' => '2026-10-15',
        'reported_by_id' => $this->admin->id,
    ]);

    $response->assertSessionHasErrors('ward_id');
});

test('shift must be a valid NursingShift enum value', function () {
    $ward = Ward::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('nursing-daily-reports.store'), [
        'patient_name' => 'Patient',
        'hospital_number' => 'HN-01',
        'report' => 'Test',
        'ward_id' => $ward->id,
        'shift' => 'Night', // invalid
        'created_by' => 'Nurse',
        'creation_date' => '2026-10-15',
        'reported_by_id' => $this->admin->id,
    ]);

    $response->assertSessionHasErrors('shift');
});

test('reported_by_id must exist in users table', function () {
    $ward = Ward::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('nursing-daily-reports.store'), [
        'patient_name' => 'Patient',
        'hospital_number' => 'HN-01',
        'report' => 'Test',
        'ward_id' => $ward->id,
        'shift' => 'Morning',
        'created_by' => 'Nurse',
        'creation_date' => '2026-10-15',
        'reported_by_id' => 999999, // nonexistent
    ]);

    $response->assertSessionHasErrors('reported_by_id');
});

test('nursing daily report model uses ulid primary key', function () {
    $report = NursingDailyReport::factory()->create();

    $this->assertIsString($report->id);
    $this->assertEquals(26, strlen($report->id));
});

test('nursing daily report shift is cast to NursingShift enum', function () {
    $report = NursingDailyReport::factory()->create(['shift' => 'Morning']);

    $this->assertInstanceOf(NursingShift::class, $report->shift);
    $this->assertEquals('Morning', $report->shift->value);
});

test('report cannot be empty or only contain empty html tags', function () {
    $ward = Ward::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('nursing-daily-reports.store'), [
        'patient_name' => 'Patient',
        'hospital_number' => 'HN-01',
        'report' => '<p><br></p>',
        'ward_id' => $ward->id,
        'shift' => 'Morning',
        'created_by' => 'Nurse',
        'creation_date' => '2026-10-15',
        'reported_by_id' => $this->admin->id,
    ]);

    $response->assertSessionHasErrors('report');
});

