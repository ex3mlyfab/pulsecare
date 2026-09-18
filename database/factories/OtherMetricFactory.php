<?php

namespace Database\Factories;

use App\Models\OtherMetric;
use App\OtherMetricsStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OtherMetric>
 */
class OtherMetricFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'status' => fake()->randomElement(OtherMetricsStatus::cases()),
        ];
    }
}
