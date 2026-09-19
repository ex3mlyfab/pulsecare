<?php

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
    $this->userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

    $permissions = collect([
        'record_stats.view',
        'record_stats.update',
    ])->map(fn ($name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']));

    $this->adminRole->syncPermissions($permissions);

    $this->admin = User::factory()->create()->assignRole('admin');
    $this->regularUser = User::factory()->create()->assignRole('user');

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('admin can view the record stats index', function () {
    Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);
    Ward::factory()->create(['name' => 'General Ward', 'status' => 'Active']);

    $response = $this->actingAs($this->admin)->get(route('record-stats.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('record-stats/index')
        ->where('date', Carbon::today()->format('d-M-Y'))
        ->has('activeWards', 2)
        ->has('metrics', 12));
});

test('inactive wards are excluded from the index', function () {
    Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);
    Ward::factory()->create(['name' => 'Old Ward', 'status' => 'Inactive']);

    $response = $this->actingAs($this->admin)->get(route('record-stats.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('activeWards', 1)
        ->where('activeWards.0.name', 'ICU Ward'));
});

test('the index surfaces a ward record for today', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);
    RecordStat::factory()->create([
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today(),
        'admission' => 7,
        'discharges' => 3,
        'death' => 0,
    ]);

    $response = $this->actingAs($this->admin)->get(route('record-stats.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('records.'.$ward->id.'.admission', 7)
        ->where('records.'.$ward->id.'.discharges', 3)
        ->where('records.'.$ward->id.'.death', 0));

    // A record on a different day must not leak into today's matrix.
    RecordStat::factory()->create([
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->subDay(),
        'admission' => 99,
    ]);

    $response = $this->actingAs($this->admin)->get(route('record-stats.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('records.'.$ward->id.'.admission', 7));
});

test('admin can store a record for a ward', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);

    $response = $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->toDateString(),
        'admission' => 5,
        'discharges' => 2,
    ]);

    $response->assertRedirect(route('record-stats.index'));
    $this->assertDatabaseHas('record_stats', [
        'ward_id' => $ward->id,
        'admission' => 5,
        'discharges' => 2,
    ]);
});

test('storing an existing ward and date upserts rather than duplicating', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);

    $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->toDateString(),
        'admission' => 5,
    ]);

    $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->toDateString(),
        'admission' => 9,
    ]);

    $this->assertSame(1, RecordStat::where('ward_id', $ward->id)->count());
    $this->assertSame(9, RecordStat::where('ward_id', $ward->id)->first()->admission);
});

test('metrics default to zero when omitted', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);

    $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->toDateString(),
    ]);

    $this->assertDatabaseHas('record_stats', [
        'ward_id' => $ward->id,
        'admission' => 0,
        'discharges' => 0,
        'death' => 0,
    ]);
});

test('admin can update a specific record', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);
    $record = RecordStat::factory()->create([
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today(),
        'admission' => 4,
    ]);

    $response = $this->actingAs($this->admin)->patch(
        route('record-stats.update', $record),
        [
            'ward_id' => $ward->id,
            'stat_date' => Carbon::today()->toDateString(),
            'admission' => 8,
        ]
    );

    $response->assertRedirect(route('record-stats.index'));
    $this->assertDatabaseHas('record_stats', [
        'id' => $record->id,
        'admission' => 8,
    ]);
});

test('ward_id is required', function () {
    $response = $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'stat_date' => Carbon::today()->toDateString(),
        'admission' => 1,
    ]);

    $response->assertSessionHasErrors('ward_id');
});

test('ward_id must reference an existing ward', function () {
    $response = $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'ward_id' => '01M2QGHXDCV3BHM0J2SRPPPS4N',
        'stat_date' => Carbon::today()->toDateString(),
        'admission' => 1,
    ]);

    $response->assertSessionHasErrors('ward_id');
});

test('a metric must be a non-negative integer', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);

    $response = $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->toDateString(),
        'admission' => -3,
    ]);

    $response->assertSessionHasErrors('admission');

    $response = $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->toDateString(),
        'admission' => 'abc',
    ]);

    $response->assertSessionHasErrors('admission');
});

test('stat_date is required', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);

    $response = $this->actingAs($this->admin)->post(route('record-stats.store'), [
        'ward_id' => $ward->id,
        'admission' => 1,
    ]);

    $response->assertSessionHasErrors('stat_date');
});

test('regular user cannot view the index', function () {
    $response = $this->actingAs($this->regularUser)->get(route('record-stats.index'));

    $response->assertStatus(403);
});

test('regular user cannot store a record', function () {
    $ward = Ward::factory()->create(['name' => 'ICU Ward', 'status' => 'Active']);

    $response = $this->actingAs($this->regularUser)->post(route('record-stats.store'), [
        'ward_id' => $ward->id,
        'stat_date' => Carbon::today()->toDateString(),
        'admission' => 1,
    ]);

    $response->assertStatus(403);
});

test('the record stat model uses a ulid primary key', function () {
    $record = RecordStat::factory()->create();

    $this->assertIsString($record->id);
    $this->assertEquals(26, strlen($record->id));
});

test('the record stat total sums all metrics', function () {
    $record = RecordStat::factory()->create([
        'admission' => 10,
        'discharges' => 5,
        'trans_in' => 2,
        'trans_out' => 1,
        'referred_out' => 3,
        'referred_in' => 4,
        'emergencies' => 6,
        'sama' => 7,
        'abscond' => 0,
        'outpatients' => 8,
        'inpatients' => 9,
        'death' => 2,
    ]);

    $this->assertSame(57, $record->total());
});
