<?php

namespace Database\Factories;

use App\Models\Clinic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Clinic>
 */
class ClinicFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return [
            'name' => fake()->unique()->words(2, true).' Clinic',
            'location' => fake()->optional()->streetName(),
            'operating_days' => fake()->randomElements($days, fake()->numberBetween(1, 7)),
        ];
    }

    /**
     * Indicate that the clinic has no operating days.
     */
    public function noDays(): static
    {
        return $this->state(['operating_days' => []]);
    }
}
