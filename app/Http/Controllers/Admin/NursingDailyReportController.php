<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNursingDailyReportRequest;
use App\Http\Requests\Admin\UpdateNursingDailyReportRequest;
use App\Models\NursingDailyReport;
use App\Models\User;
use App\Models\Ward;
use App\NursingShift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class NursingDailyReportController extends Controller
{
    /**
     * Display the nursing daily report listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('nursing_daily_reports.view', $request->user());

        $search = trim((string) $request->string('search'));
        $shift = trim((string) $request->string('shift'));
        $wardId = trim((string) $request->string('ward_id'));
        $date = trim((string) $request->string('date'));
        $perPage = (int) $request->input('per_page', 10);

        $reports = NursingDailyReport::query()
            ->with(['ward', 'reportedBy'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('patient_name', 'like', "%{$search}%")
                        ->orWhere('hospital_number', 'like', "%{$search}%")
                        ->orWhere('created_by', 'like', "%{$search}%");
                });
            })
            ->when($shift !== '', function ($query) use ($shift): void {
                $query->where('shift', $shift);
            })
            ->when($wardId !== '', function ($query) use ($wardId): void {
                $query->where('ward_id', $wardId);
            })
            ->when($date !== '', function ($query) use ($date): void {
                $query->whereDate('creation_date', $date);
            })
            ->orderByDesc('creation_date')
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('nursing-daily-reports/index', [
            'reports' => collect($reports->items())
                ->map(fn (NursingDailyReport $report) => [
                    'id' => $report->id,
                    'patient_name' => $report->patient_name,
                    'hospital_number' => $report->hospital_number,
                    'shift' => $report->shift->value,
                    'creation_date' => $report->creation_date->toDateString(),
                    'created_by' => $report->created_by,
                    'ward' => [
                        'id' => $report->ward->id,
                        'name' => $report->ward->name,
                    ],
                    'reported_by' => $report->reportedBy ? [
                        'id' => $report->reportedBy->id,
                        'name' => $report->reportedBy->name,
                    ] : null,
                    'created_at' => $report->created_at->toIso8601String(),
                ])
                ->values()
                ->all(),
            'filters' => [
                'search' => $search,
                'shift' => $shift,
                'ward_id' => $wardId,
                'date' => $date,
                'per_page' => $perPage,
            ],
            'pagination' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
            'wards' => Ward::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new nursing daily report.
     */
    public function create(): Response
    {
        Gate::authorize('nursing_daily_reports.create', request()->user());

        return Inertia::render('nursing-daily-reports/create', [
            'wards' => Ward::orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name']),
            'shifts' => array_column(NursingShift::cases(), 'value'),
        ]);
    }

    /**
     * Store a newly created nursing daily report.
     */
    public function store(StoreNursingDailyReportRequest $request): RedirectResponse
    {
        NursingDailyReport::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Nursing daily report created.')]);

        return to_route('nursing-daily-reports.index');
    }

    /**
     * Display the specified nursing daily report.
     */
    public function show(NursingDailyReport $nursingDailyReport): Response
    {
        Gate::authorize('nursing_daily_reports.view', request()->user());

        $nursingDailyReport->load(['ward', 'reportedBy']);

        return Inertia::render('nursing-daily-reports/show', [
            'report' => [
                'id' => $nursingDailyReport->id,
                'patient_name' => $nursingDailyReport->patient_name,
                'hospital_number' => $nursingDailyReport->hospital_number,
                'report' => $nursingDailyReport->report,
                'shift' => $nursingDailyReport->shift->value,
                'creation_date' => $nursingDailyReport->creation_date->toDateString(),
                'created_by' => $nursingDailyReport->created_by,
                'ward' => [
                    'id' => $nursingDailyReport->ward->id,
                    'name' => $nursingDailyReport->ward->name,
                ],
                'reported_by' => $nursingDailyReport->reportedBy ? [
                    'id' => $nursingDailyReport->reportedBy->id,
                    'name' => $nursingDailyReport->reportedBy->name,
                ] : null,
                'created_at' => $nursingDailyReport->created_at->toIso8601String(),
                'updated_at' => $nursingDailyReport->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified nursing daily report.
     */
    public function edit(NursingDailyReport $nursingDailyReport): Response
    {
        Gate::authorize('nursing_daily_reports.update', request()->user());

        return Inertia::render('nursing-daily-reports/edit', [
            'report' => [
                'id' => $nursingDailyReport->id,
                'patient_name' => $nursingDailyReport->patient_name,
                'hospital_number' => $nursingDailyReport->hospital_number,
                'report' => $nursingDailyReport->report,
                'ward_id' => $nursingDailyReport->ward_id,
                'shift' => $nursingDailyReport->shift->value,
                'created_by' => $nursingDailyReport->created_by,
                'creation_date' => $nursingDailyReport->creation_date->toDateString(),
                'reported_by_id' => $nursingDailyReport->reported_by_id,
            ],
            'wards' => Ward::orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name']),
            'shifts' => array_column(NursingShift::cases(), 'value'),
        ]);
    }

    /**
     * Update the specified nursing daily report.
     */
    public function update(UpdateNursingDailyReportRequest $request, NursingDailyReport $nursingDailyReport): RedirectResponse
    {
        $nursingDailyReport->fill($request->validated());
        $nursingDailyReport->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Nursing daily report updated.')]);

        return to_route('nursing-daily-reports.index');
    }

    /**
     * Remove the specified nursing daily report.
     */
    public function destroy(Request $request, NursingDailyReport $nursingDailyReport): RedirectResponse
    {
        Gate::authorize('nursing_daily_reports.delete', $request->user());

        try {
            $nursingDailyReport->delete();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Nursing daily report deleted.')]);
        } catch (Throwable $exception) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Unable to delete report. It may be referenced by other records.'),
            ]);
        }

        return to_route('nursing-daily-reports.index');
    }
}
