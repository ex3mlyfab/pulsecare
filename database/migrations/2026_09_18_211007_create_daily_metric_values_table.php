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
        Schema::create('daily_metric_values', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->date('stat_date');
            $table->foreignUlid('other_metric_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('value')->default(0);

            $table->timestamps();

            $table->unique(['stat_date', 'other_metric_id']);
            $table->index('other_metric_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_metric_values');
    }
};
