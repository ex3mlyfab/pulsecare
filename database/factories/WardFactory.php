<?php

namespace Database\Factories;

use App\Models\Ward;
use App\WardStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ward>
 */
class WardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word().' Ward',
            'beds_count' => fake()->optional(0.7)->numberBetween(1, 100),
            'location' => fake()->optional()->streetName(),
            'status' => fake()->randomElement(WardStatus::cases()),
            'matron_in_charge_id' => null,
        ];
    }
}
