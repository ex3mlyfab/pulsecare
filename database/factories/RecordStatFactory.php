<?php

namespace Database\Factories;

use App\Models\RecordStat;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<RecordStat>
 */
class RecordStatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $state = [
            'stat_date' => Carbon::today(),
            'ward_id' => Ward::factory(),
        ];

        foreach (RecordStat::metricFields() as $field) {
            $state[$field] = fake()->numberBetween(0, 20);
        }

        return $state;
    }
}
