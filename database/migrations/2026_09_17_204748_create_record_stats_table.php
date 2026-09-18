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
        Schema::create('record_stats', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->date('stat_date');
            $table->foreignUlid('ward_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('admission')->default(0);
            $table->unsignedInteger('discharges')->default(0);
            $table->unsignedInteger('trans_in')->default(0);
            $table->unsignedInteger('trans_out')->default(0);
            $table->unsignedInteger('referred_out')->default(0);
            $table->unsignedInteger('referred_in')->default(0);
            $table->unsignedInteger('emergencies')->default(0);
            $table->unsignedInteger('sama')->default(0);
            $table->unsignedInteger('abscond')->default(0);
            $table->unsignedInteger('outpatients')->default(0);
            $table->unsignedInteger('death')->default(0);

            $table->timestamps();

            $table->unique(['stat_date', 'ward_id']);
            $table->index('ward_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('record_stats');
    }
};
