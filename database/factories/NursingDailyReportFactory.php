<?php

namespace Database\Factories;

use App\Models\NursingDailyReport;
use App\Models\User;
use App\Models\Ward;
use App\NursingShift;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NursingDailyReport>
 */
class NursingDailyReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_name' => fake()->name(),
            'hospital_number' => strtoupper(fake()->bothify('HN-####??')),
            'report' => fake()->paragraphs(2, true),
            'ward_id' => Ward::factory(),
            'shift' => fake()->randomElement(NursingShift::cases()),
            'created_by' => fake()->name(),
            'creation_date' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'reported_by_id' => User::factory(),
        ];
    }
}
