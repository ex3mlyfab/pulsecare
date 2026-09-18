<?php

namespace App\Http\Requests\Admin;

use App\Models\Clinic;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClinicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('clinics.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Clinic $clinic */
        $clinic = $this->route('clinic');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('clinics', 'name')->ignore($clinic->id),
            ],
            'location' => [
                'nullable',
                'string',
                'max:255',
            ],
            'operating_days' => [
                'present',
                'array',
            ],
            'operating_days.*' => [
                'string',
                Rule::in(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
            ],
        ];
    }
}
