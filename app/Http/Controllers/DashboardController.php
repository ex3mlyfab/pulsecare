<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\StoreDashboardAttendanceRequest;
use App\Http\Requests\Admin\StoreDashboardMetricValueRequest;
use App\Models\Clinic;
use App\Models\ClinicAttendance;
use App\Models\DailyMetricValue;
use App\Models\OtherMetric;
use App\Models\RecordStat;
use App\Models\Ward;
use App\OtherMetricsStatus;
use App\WardStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render the clinical operations dashboard.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('dashboard.view', $request->user());

        $today = Date::today();
        $weekday = $today->format('l');

        // Active wards with capacity
        $activeWards = Ward::query()
            ->where('status', WardStatus::Active)
            ->orderBy('name')
            ->get();

        $todayRecords = RecordStat::query()
            ->forDate($today)
            ->get()
            ->keyBy('ward_id');

        $totalBeds = (int) $activeWards->sum('beds_count');

        $totalInpatients = 0;
        $totalAdmissions = 0;
        $totalDischarges = 0;
        $totalEmergencies = 0;
        $totalTransIn = 0;
        $totalTransOut = 0;
        $totalReferredIn = 0;
        $totalReferredOut = 0;
        $totalDeath = 0;
        $totalSama = 0;
        $totalAbscond = 0;

        $wardBreakdown = [];
        $overCapacityWards = [];

        foreach ($activeWards as $ward) {
            $record = $todayRecords->get($ward->id);
            $inpatients = $record ? (int) $record->inpatients : 0;
            $admissions = $record ? (int) $record->admission : 0;
            $discharges = $record ? (int) $record->discharges : 0;
            $emergencies = $record ? (int) $record->emergencies : 0;
            $transIn = $record ? (int) $record->trans_in : 0;
            $transOut = $record ? (int) $record->trans_out : 0;
            $death = $record ? (int) $record->death : 0;
            $sama = $record ? (int) $record->sama : 0;
            $abscond = $record ? (int) $record->abscond : 0;

            $totalInpatients += $inpatients;
            $totalAdmissions += $admissions;
            $totalDischarges += $discharges;
            $totalEmergencies += $emergencies;
            $totalTransIn += $transIn;
            $totalTransOut += $transOut;
            $totalReferredIn += $record ? (int) $record->referred_in : 0;
            $totalReferredOut += $record ? (int) $record->referred_out : 0;
            $totalDeath += $death;
            $totalSama += $sama;
            $totalAbscond += $abscond;

            $beds = (int) ($ward->beds_count ?? 0);
            $available = max(0, $beds - $inpatients);
            $occupancyRate = $beds > 0 ? round(($inpatients / $beds) * 100, 1) : 0.0;

            $wardStatus = match (true) {
                $beds > 0 && $occupancyRate >= 90 => 'surge',
                $beds > 0 && $occupancyRate >= 75 => 'busy',
                default => 'optimal',
            };

            if ($beds > 0 && $occupancyRate >= 90) {
                $overCapacityWards[] = [
                    'name' => $ward->name,
                    'occupancy' => $occupancyRate,
                    'inpatients' => $inpatients,
                    'beds' => $beds,
                ];
            }

            $wardBreakdown[] = [
                'id' => $ward->id,
                'name' => $ward->name,
                'beds' => $beds,
                'inpatients' => $inpatients,
                'available' => $available,
                'occupancy_rate' => $occupancyRate,
                'admissions' => $admissions,
                'discharges' => $discharges,
                'emergencies' => $emergencies,
                'status' => $wardStatus,
            ];
        }

        $availableBeds = max(0, $totalBeds - $totalInpatients);
        $hospitalOccupancyRate = $totalBeds > 0 ? round(($totalInpatients / $totalBeds) * 100, 1) : 0.0;

        $surgeStatus = match (true) {
            $totalBeds > 0 && $hospitalOccupancyRate >= 90 => 'surge',
            $totalBeds > 0 && $hospitalOccupancyRate >= 75 => 'busy',
            default => 'optimal',
        };

        // Outpatient attendance for today
        $clinics = Clinic::query()
            ->orderBy('name')
            ->get()
            ->filter(fn (Clinic $clinic) => in_array($weekday, $clinic->operating_days ?? [], true))
            ->values();

        $clinicAttendance = ClinicAttendance::query()
            ->forDate($today)
            ->get()
            ->keyBy('clinic_id');

        $clinicsProp = $clinics->map(fn (Clinic $clinic) => [
            'id' => $clinic->id,
            'name' => $clinic->name,
            'outpatients' => (int) ($clinicAttendance->get($clinic->id)?->outpatients ?? 0),
        ])->all();

        $totalOutpatients = (int) $clinicAttendance->sum('outpatients');

        // Other tracked operational metrics
        $otherMetrics = OtherMetric::query()
            ->where('status', OtherMetricsStatus::Active)
            ->orderBy('name')
            ->get();

        $dailyMetricValues = DailyMetricValue::query()
            ->forDate($today)
            ->get()
            ->keyBy('other_metric_id');

        $otherMetricsProp = $otherMetrics->map(fn (OtherMetric $metric) => [
            'id' => $metric->id,
            'name' => $metric->name,
            'value' => (int) ($dailyMetricValues->get($metric->id)?->value ?? 0),
        ])->all();

        // Clinical Attention Queue items
        $attentionQueue = [];

        foreach ($overCapacityWards as $oc) {
            $attentionQueue[] = [
                'id' => 'surge-'.$oc['name'],
                'type' => 'surge',
                'title' => $oc['name'].' at Surge ('.$oc['occupancy'].'%)',
                'description' => $oc['inpatients'].' of '.$oc['beds'].' beds occupied.',
                'tone' => 'critical',
            ];
        }

        if ($totalDeath > 0) {
            $attentionQueue[] = [
                'id' => 'mortality-today',
                'type' => 'mortality',
                'title' => $totalDeath.' '.($totalDeath === 1 ? 'Mortality' : 'Mortalities').' Recorded',
                'description' => 'Clinical governance / mortality audit review required.',
                'tone' => 'critical',
            ];
        }

        $irregularDischarges = $totalSama + $totalAbscond;
        if ($irregularDischarges > 0) {
            $attentionQueue[] = [
                'id' => 'irregular-discharges',
                'type' => 'irregular_discharge',
                'title' => $irregularDischarges.' Non-Standard '.($irregularDischarges === 1 ? 'Exit' : 'Exits'),
                'description' => $totalSama.' SAMA, '.$totalAbscond.' absconded across wards today.',
                'tone' => 'bottleneck',
            ];
        }

        $transfersCount = $totalTransIn + $totalTransOut;
        if ($transfersCount > 0) {
            $attentionQueue[] = [
                'id' => 'transfers-active',
                'type' => 'transfers',
                'title' => $transfersCount.' Ward '.($transfersCount === 1 ? 'Transfer' : 'Transfers'),
                'description' => $totalTransIn.' transfer-in, '.$totalTransOut.' transfer-out under coordination.',
                'tone' => 'bottleneck',
            ];
        }

        // 7-day trend flow
        $sevenDaysAgo = $today->subDays(6);
        $trendRecords = RecordStat::query()
            ->whereDate('stat_date', '>=', $sevenDaysAgo)
            ->whereDate('stat_date', '<=', $today)
            ->get()
            ->groupBy(fn (RecordStat $r) => $r->stat_date->toDateString());

        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $datePoint = $today->subDays($i);
            $dateString = $datePoint->toDateString();
            $dayGroup = $trendRecords->get($dateString, collect());

            $trend[] = [
                'date' => $dateString,
                'label' => $datePoint->format('D'),
                'formatted_date' => $datePoint->format('d M'),
                'is_today' => $i === 0,
                'admissions' => (int) $dayGroup->sum('admission'),
                'discharges' => (int) $dayGroup->sum('discharges'),
                'emergencies' => (int) $dayGroup->sum('emergencies'),
                'inpatients' => (int) $dayGroup->sum('inpatients'),
            ];
        }

        return Inertia::render('dashboard', [
            'date' => $today->format('d-M-Y'),
            'weekday' => $weekday,
            'census' => [
                'total_beds' => $totalBeds,
                'total_inpatients' => $totalInpatients,
                'available_beds' => $availableBeds,
                'occupancy_rate' => $hospitalOccupancyRate,
                'surge_status' => $surgeStatus,
            ],
            'flow' => [
                'admissions' => $totalAdmissions,
                'discharges' => $totalDischarges,
                'emergencies' => $totalEmergencies,
                'trans_in' => $totalTransIn,
                'trans_out' => $totalTransOut,
                'referred_in' => $totalReferredIn,
                'referred_out' => $totalReferredOut,
                'death' => $totalDeath,
                'sama' => $totalSama,
                'abscond' => $totalAbscond,
                'net_flow' => $totalAdmissions - $totalDischarges,
            ],
            'clinics' => [
                'total_outpatients' => $totalOutpatients,
                'operating_count' => $clinics->count(),
                'list' => $clinicsProp,
            ],
            'other_metrics' => $otherMetricsProp,
            'attention_queue' => $attentionQueue,
            'trend' => $trend,
            'ward_breakdown' => $wardBreakdown,
            'can_record_stats' => $request->user()->can('record_stats.update'),
        ]);
    }

    /**
     * Record today's outpatients attendance for each clinic.
     */
    public function storeAttendance(StoreDashboardAttendanceRequest $request): RedirectResponse
    {
        $statDate = Date::parse($request->validated('stat_date'))->toDateString();

        foreach ($request->validated('clinics') as $clinic) {
            $record = ClinicAttendance::query()
                ->forDate(Date::parse($statDate))
                ->where('clinic_id', $clinic['clinic_id'])
                ->firstOrNew([]);

            $record->fill([
                'stat_date' => $statDate,
                'clinic_id' => $clinic['clinic_id'],
                'outpatients' => (int) $clinic['outpatients'],
            ]);
            $record->save();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Attendance updated.')]);

        return to_route('record-stats.index');
    }

    /**
     * Record today's value for each other metric.
     */
    public function storeMetricValue(StoreDashboardMetricValueRequest $request): RedirectResponse
    {
        $statDate = Date::parse($request->validated('stat_date'))->toDateString();

        foreach ($request->validated('metrics') as $metric) {
            $record = DailyMetricValue::query()
                ->forDate(Date::parse($statDate))
                ->where('other_metric_id', $metric['other_metric_id'])
                ->firstOrNew([]);

            $record->fill([
                'stat_date' => $statDate,
                'other_metric_id' => $metric['other_metric_id'],
                'value' => (int) $metric['value'],
            ]);
            $record->save();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Metrics updated.')]);

        return to_route('record-stats.index');
    }
}
