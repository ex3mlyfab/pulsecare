<?php

namespace App\Http\Requests\Admin;

use App\NursingShift;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNursingDailyReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('nursing_daily_reports.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patient_name' => [
                'required',
                'string',
                'max:255',
            ],
            'hospital_number' => [
                'required',
                'string',
                'max:255',
            ],
            'report' => [
                'required',
                'string',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $stripped = trim(strip_tags((string) $value));
                    if ($stripped === '') {
                        $fail(__('The report content cannot be empty.'));
                    }
                },
            ],
            'ward_id' => [
                'required',
                Rule::exists('wards', 'id'),
            ],
            'shift' => [
                'required',
                Rule::in(array_column(NursingShift::cases(), 'value')),
            ],
            'created_by' => [
                'required',
                'string',
                'max:255',
            ],
            'creation_date' => [
                'required',
                'date',
            ],
            'reported_by_id' => [
                'required',
                Rule::exists('users', 'id'),
            ],
        ];
    }
}
