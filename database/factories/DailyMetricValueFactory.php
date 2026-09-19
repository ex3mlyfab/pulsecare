<?php

namespace Database\Factories;

use App\Models\DailyMetricValue;
use App\Models\OtherMetric;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<DailyMetricValue>
 */
class DailyMetricValueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stat_date' => Carbon::today(),
            'other_metric_id' => OtherMetric::factory(),
            'value' => fake()->numberBetween(0, 50),
        ];
    }
}
