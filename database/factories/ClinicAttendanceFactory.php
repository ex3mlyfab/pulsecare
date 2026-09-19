<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\ClinicAttendance;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<ClinicAttendance>
 */
class ClinicAttendanceFactory extends Factory
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
            'clinic_id' => Clinic::factory(),
            'outpatients' => fake()->numberBetween(0, 50),
        ];
    }
}
