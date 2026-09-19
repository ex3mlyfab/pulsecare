<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRecordStatRequest;
use App\Http\Requests\Admin\UpdateRecordStatRequest;
use App\Models\Clinic;
use App\Models\ClinicAttendance;
use App\Models\DailyMetricValue;
use App\Models\OtherMetric;
use App\Models\RecordStat;
use App\Models\Ward;
use App\StatMetric;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RecordStatController extends Controller
{
    /**
     * Render today's ward-movement matrix and the clinic / other-metrics summary.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('record_stats.view', $request->user());

        $today = Date::today();

        $records = RecordStat::query()
            ->forDate($today)
            ->get();

        $byWardId = $records->keyBy('ward_id');

        $activeWards = Ward::query()
            ->where('status', 'Active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $wardIds = $activeWards->pluck('id');

        $weekday = $today->format('l');

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

        $totalPatients = $clinicAttendance->sum('outpatients');

        $otherMetrics = OtherMetric::query()
            ->orderBy('name')
            ->get();

        $metricValues = DailyMetricValue::query()
            ->forDate($today)
            ->get()
            ->keyBy('other_metric_id');

        $otherMetricsProp = $otherMetrics->map(fn (OtherMetric $otherMetric) => [
            'id' => $otherMetric->id,
            'name' => $otherMetric->name,
            'status' => $otherMetric->status->value,
            'value' => (int) ($metricValues->get($otherMetric->id)?->value ?? 0),
        ])->all();

        $recordsProp = $wardIds
            ->mapWithKeys(function (string $wardId) use ($byWardId): array {
                $record = $byWardId->get($wardId);
                $values = [];

                foreach (RecordStat::metricFields() as $field) {
                    $values[$field] = $record ? (int) $record->{$field} : 0;
                }

                return [$wardId => $values];
            })
            ->all();

        return Inertia::render('record-stats/index', [
            'date' => $today->format('d-M-Y'),
            'weekday' => $weekday,
            'activeWards' => $activeWards->map(fn (Ward $ward) => [
                'id' => $ward->id,
                'name' => $ward->name,
            ])->all(),
            'metrics' => StatMetric::definitions(),
            'clinics' => $clinicsProp,
            'otherMetrics' => $otherMetricsProp,
            'totalPatients' => (int) $totalPatients,
            'records' => $recordsProp,
        ]);
    }

    /**
     * Record today's numbers for a ward.
     */
    public function store(StoreRecordStatRequest $request): RedirectResponse
    {
        $data = $this->normalizedPayload($request);

        $statDate = Date::parse($data['stat_date'])->toDateString();

        $record = RecordStat::query()
            ->forDate(Date::parse($statDate))
            ->where('ward_id', $data['ward_id'])
            ->firstOrNew([]);

        $record->fill($data + ['stat_date' => $statDate]);
        $record->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Record updated.')]);

        return to_route('record-stats.index');
    }

    /**
     * Update an existing record.
     */
    public function update(UpdateRecordStatRequest $request, RecordStat $record_stat): RedirectResponse
    {
        $data = $this->normalizedPayload($request);

        $record_stat->fill($data);
        $record_stat->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Record updated.')]);

        return to_route('record-stats.index');
    }

    /**
     * Render the configurable stats report: ward movements, clinic
     * attendance, and other-metric counts aggregated over a date range,
     * filtered by name, ward, clinic, or metric.
     */
    public function report(Request $request): Response
    {
        Gate::authorize('record_stats.view', $request->user());

        $filters = $this->parsedFilters($request);

        $wardIds = $this->filterWardIds($filters['search'], $filters['ward_id']);

        $wardReport = $this->wardReport($filters, $wardIds);
        $clinicReport = $this->clinicReport($filters, $filters['clinic_id']);
        $otherMetricReport = $this->otherMetricReport($filters, $filters['metric_id']);

        $wardOptions = Ward::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Ward $ward) => ['id' => $ward->id, 'name' => $ward->name])
            ->all();

        $clinicOptions = Clinic::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Clinic $clinic) => ['id' => $clinic->id, 'name' => $clinic->name])
            ->all();

        $otherMetricOptions = OtherMetric::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (OtherMetric $metric) => ['id' => $metric->id, 'name' => $metric->name])
            ->all();

        return Inertia::render('stats-report/index', [
            'filters' => $filters,
            'wardOptions' => $wardOptions,
            'clinicOptions' => $clinicOptions,
            'otherMetricOptions' => $otherMetricOptions,
            'metrics' => StatMetric::definitions(),
            'wardReport' => $wardReport,
            'clinicReport' => $clinicReport,
            'otherMetricReport' => $otherMetricReport,
        ]);
    }

    /**
     * The ward-movement series, one row per ward with a per-metric total.
     *
     * @return array<int, array<string, int|string>>
     */
    private function wardReport(array $filters, ?array $wardIds): array
    {
        $query = RecordStat::query()
            ->with('ward')
            ->whereDate('stat_date', '>=', $filters['date_from'])
            ->whereDate('stat_date', '<=', $filters['date_to'])
            ->when(
                $wardIds !== null && $wardIds !== [],
                fn ($builder) => $builder->whereIn('ward_id', $wardIds),
            )
            ->orderBy('stat_date');

        $rows = $query->get();

        $byWard = [];

        foreach ($rows as $row) {
            $byWard[$row->ward_id]['ward'] = $row->ward;
            $byWard[$row->ward_id]['metrics'][$row->stat_date->format('Y-m-d')] = collect(RecordStat::metricFields())
                ->mapWithKeys(fn (string $field) => [$field => (int) $row->{$field}])
                ->all();
        }

        return collect($byWard)
            ->map(function (array $entry): array {
                $dates = collect($entry['metrics'])->keys()->values()->all();
                $totals = collect(RecordStat::metricFields())
                    ->mapWithKeys(fn (string $field) => [
                        $field => collect($entry['metrics'])
                            ->map(fn (array $values) => $values[$field])
                            ->sum(),
                    ])
                    ->all();
                $grandTotal = (int) collect($totals)->sum();

                return [
                    'ward_id' => $entry['ward']?->id ?? 'unknown',
                    'ward_name' => $entry['ward']?->name ?? 'Unassigned',
                    'active' => $entry['ward']?->status === 'Active',
                    'beds_count' => $entry['ward']?->beds_count,
                    'metrics' => $entry['metrics'],
                    'totals' => $totals,
                    'grand_total' => $grandTotal,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * The clinic out-patient series, one row per clinic with daily values.
     *
     * @return array<int, array<string, int|string>>
     */
    private function clinicReport(array $filters, string $clinicId): array
    {
        $query = ClinicAttendance::query()
            ->with('clinic')
            ->whereDate('stat_date', '>=', $filters['date_from'])
            ->whereDate('stat_date', '<=', $filters['date_to'])
            ->when($clinicId !== '', fn ($builder) => $builder->where('clinic_id', $clinicId))
            ->orderBy('stat_date');

        $rows = $query->get();

        $byClinic = [];

        foreach ($rows as $row) {
            $byClinic[$row->clinic_id]['clinic'] = $row->clinic;
            $byClinic[$row->clinic_id]['values'][$row->stat_date->format('Y-m-d')] = (int) $row->outpatients;
        }

        return collect($byClinic)
            ->map(function (array $entry): array {
                return [
                    'clinic_id' => $entry['clinic']?->id ?? 'unknown',
                    'clinic_name' => $entry['clinic']?->name ?? 'Unknown clinic',
                    'values' => $entry['values'],
                    'total' => (int) collect($entry['values'])->sum(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * The other-metric series, one row per metric with daily values.
     *
     * @return array<int, array<string, int|string>>
     */
    private function otherMetricReport(array $filters, string $metricId): array
    {
        $query = DailyMetricValue::query()
            ->with('otherMetric')
            ->whereDate('stat_date', '>=', $filters['date_from'])
            ->whereDate('stat_date', '<=', $filters['date_to'])
            ->when($metricId !== '', fn ($builder) => $builder->where('other_metric_id', $metricId))
            ->orderBy('stat_date');

        $rows = $query->get();

        $byMetric = [];

        foreach ($rows as $row) {
            $byMetric[$row->other_metric_id]['metric'] = $row->otherMetric;
            $byMetric[$row->other_metric_id]['values'][$row->stat_date->format('Y-m-d')] = (int) $row->value;
        }

        return collect($byMetric)
            ->map(function (array $entry): array {
                return [
                    'metric_id' => $entry['metric']?->id ?? 'unknown',
                    'metric_name' => $entry['metric']?->name ?? 'Unknown metric',
                    'values' => $entry['values'],
                    'total' => (int) collect($entry['values'])->sum(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Resolve the active filter set, coercing missing dates to today.
     *
     * @return array{date_from: string, date_to: string, search: string, ward_id: string, clinic_id: string, metric_id: string}
     */
    private function parsedFilters(Request $request): array
    {
        $today = Date::today();

        $dateFrom = $request->filled('date_from') ? Date::parse($request->string('date_from'))->toDateString() : $today->copy()->subDays(29)->toDateString();
        $dateTo = $request->filled('date_to') ? Date::parse($request->string('date_to'))->toDateString() : $today->toDateString();

        if ($dateFrom > $dateTo) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }

        return [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'search' => trim((string) $request->string('search')),
            'ward_id' => trim((string) $request->string('ward_id')),
            'clinic_id' => trim((string) $request->string('clinic_id')),
            'metric_id' => trim((string) $request->string('metric_id')),
        ];
    }

    /**
     * Restrict ward ids to those matching the search or the explicit ward filter.
     *
     * @return list<string>|null
     */
    private function filterWardIds(string $search, string $wardId): ?array
    {
        if ($wardId !== '') {
            return [$wardId];
        }

        if ($search === '') {
            return null;
        }

        $wardIds = Ward::query()
            ->where('name', 'like', "%{$search}%")
            ->pluck('id')
            ->all();

        $clinicIds = Clinic::query()
            ->where('name', 'like', "%{$search}%")
            ->pluck('id')
            ->all();

        $metricIds = OtherMetric::query()
            ->where('name', 'like', "%{$search}%")
            ->pluck('id')
            ->all();

        return array_values(array_unique([
            ...$wardIds,
            ...$clinicIds,
            ...$metricIds,
        ]));
    }

    /**
     * Merge the validated metrics onto the payload, defaulting missing fields to 0.
     *
     * @return array<string, mixed>
     */
    private function normalizedPayload(StoreRecordStatRequest|UpdateRecordStatRequest $request): array
    {
        $data = $request->validated();

        foreach (RecordStat::metricFields() as $field) {
            $data[$field] = isset($data[$field]) && $data[$field] !== '' ? (int) $data[$field] : 0;
        }

        return $data;
    }
}
