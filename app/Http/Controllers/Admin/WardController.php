<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWardRequest;
use App\Http\Requests\Admin\UpdateWardRequest;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WardController extends Controller
{
    /**
     * Display the ward listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('wards.view', $request->user());

        $search = trim((string) $request->string('search'));
        $status = $request->string('status');
        $perPage = (int) $request->input('per_page', 10);

        $wards = Ward::query()
            ->with('matronInCharge')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/wards/index', [
            'wards' => collect($wards->items())
                ->map(fn (Ward $ward) => [
                    'id' => $ward->id,
                    'name' => $ward->name,
                    'location' => $ward->location,
                    'status' => $ward->status->value,
                    'matron_in_charge' => $ward->matronInCharge ? [
                        'id' => $ward->matronInCharge->id,
                        'name' => $ward->matronInCharge->name,
                    ] : null,
                    'created_at' => $ward->created_at->toIso8601String(),
                ])
                ->values()
                ->all(),
            'filters' => [
                'search' => $search,
                'status' => $status !== '' ? $status : '',
                'per_page' => $perPage,
            ],
            'pagination' => [
                'current_page' => $wards->currentPage(),
                'last_page' => $wards->lastPage(),
                'per_page' => $wards->perPage(),
                'total' => $wards->total(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new ward.
     */
    public function create(): Response
    {
        Gate::authorize('wards.create', request()->user());

        return Inertia::render('admin/wards/create', [
            'availableMatrons' => User::whereHas('roles', fn ($q) => $q->where('name', 'matron'))
                ->orWhereHas('roles', fn ($q) => $q->where('name', 'admin'))
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created ward.
     */
    public function store(StoreWardRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Ward::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ward created.')]);

        return to_route('admin.wards.index');
    }

    /**
     * Show the form for editing the specified ward.
     */
    public function edit(Ward $ward): Response
    {
        Gate::authorize('wards.update', request()->user());

        return Inertia::render('admin/wards/edit', [
            'ward' => [
                'id' => $ward->id,
                'name' => $ward->name,
                'location' => $ward->location,
                'status' => $ward->status->value,
                'matron_in_charge_id' => $ward->matron_in_charge_id,
            ],
            'availableMatrons' => User::whereHas('roles', fn ($q) => $q->where('name', 'matron'))
                ->orWhereHas('roles', fn ($q) => $q->where('name', 'admin'))
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified ward.
     */
    public function update(UpdateWardRequest $request, Ward $ward): RedirectResponse
    {
        $data = $request->validated();

        $ward->fill($data);
        $ward->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ward updated.')]);

        return to_route('admin.wards.index');
    }

    /**
     * Remove the specified ward.
     */
    public function destroy(Request $request, Ward $ward): RedirectResponse
    {
        Gate::authorize('wards.delete', $request->user());

        $ward->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ward deleted.')]);

        return to_route('admin.wards.index');
    }
}
