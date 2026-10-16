<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nursing_daily_reports', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('patient_name');
            $table->string('hospital_number');
            $table->text('report');
            $table->foreignUlid('ward_id')->constrained('wards')->cascadeOnDelete();
            $table->enum('shift', ['Morning', 'Afternoon', 'Evening']);
            $table->string('created_by');
            $table->date('creation_date');
            $table->foreignId('reported_by_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_daily_reports');
    }
};
