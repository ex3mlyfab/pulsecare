<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOtherMetricRequest;
use App\Http\Requests\Admin\UpdateOtherMetricRequest;
use App\Models\OtherMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class OtherMetricController extends Controller
{
    /**
     * Display the other metrics listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('other_metrics.view', $request->user());

        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));
        $perPage = (int) $request->input('per_page', 10);

        $otherMetrics = OtherMetric::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($status !== '', function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/other-metrics/index', [
            'otherMetrics' => collect($otherMetrics->items())
                ->map(function (OtherMetric $otherMetric) {
                    return [
                        'id' => $otherMetric->id,
                        'name' => $otherMetric->name,
                        'status' => $otherMetric->status->value,
                        'created_at' => $otherMetric->created_at->toIso8601String(),
                    ];
                })
                ->values()
                ->all(),
            'filters' => [
                'search' => $search,
                'status' => $status !== '' ? $status : '',
                'per_page' => $perPage,
            ],
            'pagination' => [
                'current_page' => $otherMetrics->currentPage(),
                'last_page' => $otherMetrics->lastPage(),
                'per_page' => $otherMetrics->perPage(),
                'total' => $otherMetrics->total(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new other metric.
     */
    public function create(): Response
    {
        Gate::authorize('other_metrics.create', request()->user());

        return Inertia::render('admin/other-metrics/create');
    }

    /**
     * Store a newly created other metric.
     */
    public function store(StoreOtherMetricRequest $request): RedirectResponse
    {
        OtherMetric::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Other metric created.')]);

        return to_route('admin.other-metrics.index');
    }

    /**
     * Show the form for editing the specified other metric.
     */
    public function edit(OtherMetric $other_metric): Response
    {
        Gate::authorize('other_metrics.update', request()->user());

        return Inertia::render('admin/other-metrics/edit', [
            'otherMetric' => [
                'id' => $other_metric->id,
                'name' => $other_metric->name,
                'status' => $other_metric->status->value,
            ],
        ]);
    }

    /**
     * Update the specified other metric.
     */
    public function update(UpdateOtherMetricRequest $request, OtherMetric $other_metric): RedirectResponse
    {
        $other_metric->fill($request->validated());
        $other_metric->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Other metric updated.')]);

        return to_route('admin.other-metrics.index');
    }

    /**
     * Remove the specified other metric.
     */
    public function destroy(Request $request, OtherMetric $other_metric): RedirectResponse
    {
        Gate::authorize('other_metrics.delete', $request->user());

        try {
            $other_metric->delete();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Other metric deleted.')]);
        } catch (Throwable $exception) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Unable to delete other metric. It may be referenced by other records.'),
            ]);
        }

        return to_route('admin.other-metrics.index');
    }

    /**
     * Check whether an other metric name already exists.
     *
     * Used by the create form's onBlur handler to surface duplicate
     * names before the user submits. When an existing id is supplied
     * (from the edit form) it is excluded from the lookup so a metric
     * may keep its own current name.
     */
    public function checkName(Request $request): JsonResponse
    {
        Gate::authorize('other_metrics.view', $request->user());

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'ignore' => ['nullable', 'string', Rule::exists('other_metrics', 'id')],
        ]);

        $name = trim((string) $request->string('name'));
        $ignore = trim((string) $request->string('ignore'));

        $query = OtherMetric::where('name', $name);

        if ($ignore !== '') {
            $query = $query->where('id', '!=', $ignore);
        }

        return response()->json([
            'exists' => $query->exists(),
        ]);
    }
}
