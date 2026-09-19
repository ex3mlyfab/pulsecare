<?php

use App\Http\Controllers\Admin\ClinicController;
use App\Http\Controllers\Admin\OtherMetricController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RecordStatController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WardController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('dashboard/attendance', [DashboardController::class, 'storeAttendance'])->name('dashboard.attendance.store');
    Route::post('dashboard/metric-values', [DashboardController::class, 'storeMetricValue'])->name('dashboard.metric-values.store');
    Route::get('record-stats', [RecordStatController::class, 'index'])->name('record-stats.index');
    Route::get('stats-report', [RecordStatController::class, 'report'])->name('stats-report.index');
    Route::post('record-stats', [RecordStatController::class, 'store'])->name('record-stats.store');
    Route::patch('record-stats/{record_stat}', [RecordStatController::class, 'update'])->name('record-stats.update');
});

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::patch('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    Route::get('permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::get('permissions/create', [PermissionController::class, 'create'])->name('permissions.create');
    Route::post('permissions', [PermissionController::class, 'store'])->name('permissions.store');
    Route::get('permissions/{permission}/edit', [PermissionController::class, 'edit'])->name('permissions.edit');
    Route::patch('permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
    Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('wards', [WardController::class, 'index'])->name('wards.index');
    Route::get('wards/create', [WardController::class, 'create'])->name('wards.create');
    Route::post('wards', [WardController::class, 'store'])->name('wards.store');
    Route::get('wards/{ward}/edit', [WardController::class, 'edit'])->name('wards.edit');
    Route::patch('wards/{ward}', [WardController::class, 'update'])->name('wards.update');
    Route::delete('wards/{ward}', [WardController::class, 'destroy'])->name('wards.destroy');

    Route::get('clinics', [ClinicController::class, 'index'])->name('clinics.index');
    Route::get('clinics/create', [ClinicController::class, 'create'])->name('clinics.create');
    Route::post('clinics', [ClinicController::class, 'store'])->name('clinics.store');
    Route::get('clinics/{clinic}/edit', [ClinicController::class, 'edit'])->name('clinics.edit');
    Route::patch('clinics/{clinic}', [ClinicController::class, 'update'])->name('clinics.update');
    Route::delete('clinics/{clinic}', [ClinicController::class, 'destroy'])->name('clinics.destroy');

    Route::get('other-metrics', [OtherMetricController::class, 'index'])->name('other-metrics.index');
    Route::get('other-metrics/create', [OtherMetricController::class, 'create'])->name('other-metrics.create');
    Route::post('other-metrics', [OtherMetricController::class, 'store'])->name('other-metrics.store');
    Route::get('other-metrics/check-name', [OtherMetricController::class, 'checkName'])->name('other-metrics.check-name');
    Route::get('other-metrics/{other_metric}/edit', [OtherMetricController::class, 'edit'])->name('other-metrics.edit');
    Route::patch('other-metrics/{other_metric}', [OtherMetricController::class, 'update'])->name('other-metrics.update');
    Route::delete('other-metrics/{other_metric}', [OtherMetricController::class, 'destroy'])->name('other-metrics.destroy');
});

require __DIR__.'/settings.php';
