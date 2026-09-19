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
        Schema::create('clinic_attendances', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->date('stat_date');
            $table->foreignUlid('clinic_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('outpatients')->default(0);

            $table->timestamps();

            $table->unique(['stat_date', 'clinic_id']);
            $table->index('clinic_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinic_attendances');
    }
};
