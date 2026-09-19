<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDashboardAttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('record_stats.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'stat_date' => ['required', 'date'],
            'clinics' => [
                'required',
                'array',
                'min:1',
            ],
            'clinics.*.clinic_id' => ['required', 'string', Rule::exists('clinics', 'id')],
            'clinics.*.outpatients' => ['required', 'integer', 'min:0'],
        ];
    }
}
