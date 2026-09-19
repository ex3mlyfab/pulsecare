<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\StoreDashboardAttendanceRequest;
use App\Http\Requests\Admin\StoreDashboardMetricValueRequest;
use App\Models\ClinicAttendance;
use App\Models\DailyMetricValue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;

class DashboardController extends Controller
{
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
