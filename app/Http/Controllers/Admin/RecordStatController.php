<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRecordStatRequest;
use App\Http\Requests\Admin\UpdateRecordStatRequest;
use App\Models\RecordStat;
use App\Models\Ward;
use App\StatMetric;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RecordStatController extends Controller
{
    /**
     * Render today's ward-movement matrix.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('record_stats.view', $request->user());

        $today = Carbon::today();

        $records = RecordStat::query()
            ->forDate($today)
            ->get();

        $byWardId = $records->keyBy('ward_id');

        $activeWards = Ward::query()
            ->where('status', 'Active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $wardIds = $activeWards->pluck('id');

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
            'activeWards' => $activeWards->map(fn (Ward $ward) => [
                'id' => $ward->id,
                'name' => $ward->name,
            ])->all(),
            'metrics' => StatMetric::definitions(),
            'records' => $recordsProp,
        ]);
    }

    /**
     * Record today's numbers for a ward.
     */
    public function store(StoreRecordStatRequest $request): RedirectResponse
    {
        $data = $this->normalizedPayload($request);

        $statDate = Carbon::parse($data['stat_date'])->toDateString();

        $record = RecordStat::query()
            ->forDate(Carbon::parse($statDate))
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
