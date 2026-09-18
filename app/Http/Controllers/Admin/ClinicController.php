<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClinicRequest;
use App\Http\Requests\Admin\UpdateClinicRequest;
use App\Models\Clinic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ClinicController extends Controller
{
    /**
     * Display the clinic listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('clinics.view', $request->user());

        $search = trim((string) $request->string('search'));
        $day = trim((string) $request->string('day'));
        $perPage = (int) $request->input('per_page', 10);

        $clinics = Clinic::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->when($day !== '', function ($query) use ($day): void {
                $query->where('operating_days', 'like', "%\"{$day}\"%");
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/clinics/index', [
            'clinics' => collect($clinics->items())
                ->map(fn (Clinic $clinic) => [
                    'id' => $clinic->id,
                    'name' => $clinic->name,
                    'location' => $clinic->location,
                    'operating_days' => $clinic->operating_days ?? [],
                    'created_at' => $clinic->created_at->toIso8601String(),
                ])
                ->values()
                ->all(),
            'filters' => [
                'search' => $search,
                'day' => $day !== '' ? $day : '',
                'per_page' => $perPage,
            ],
            'pagination' => [
                'current_page' => $clinics->currentPage(),
                'last_page' => $clinics->lastPage(),
                'per_page' => $clinics->perPage(),
                'total' => $clinics->total(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new clinic.
     */
    public function create(): Response
    {
        Gate::authorize('clinics.create', request()->user());

        return Inertia::render('admin/clinics/create');
    }

    /**
     * Store a newly created clinic.
     */
    public function store(StoreClinicRequest $request): RedirectResponse
    {
        Clinic::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Clinic created.')]);

        return to_route('admin.clinics.index');
    }

    /**
     * Show the form for editing the specified clinic.
     */
    public function edit(Clinic $clinic): Response
    {
        Gate::authorize('clinics.update', request()->user());

        return Inertia::render('admin/clinics/edit', [
            'clinic' => [
                'id' => $clinic->id,
                'name' => $clinic->name,
                'location' => $clinic->location,
                'operating_days' => $clinic->operating_days ?? [],
            ],
        ]);
    }

    /**
     * Update the specified clinic.
     */
    public function update(UpdateClinicRequest $request, Clinic $clinic): RedirectResponse
    {
        $clinic->fill($request->validated());
        $clinic->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Clinic updated.')]);

        return to_route('admin.clinics.index');
    }

    /**
     * Remove the specified clinic.
     */
    public function destroy(Request $request, Clinic $clinic): RedirectResponse
    {
        Gate::authorize('clinics.delete', $request->user());

        try {
            $clinic->delete();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Clinic deleted.')]);
        } catch (Throwable $exception) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Unable to delete clinic. It may be referenced by other records.'),
            ]);
        }

        return to_route('admin.clinics.index');
    }
}
