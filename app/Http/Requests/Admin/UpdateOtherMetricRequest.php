<?php

namespace App\Http\Requests\Admin;

use App\Models\OtherMetric;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOtherMetricRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('other_metrics.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var OtherMetric $otherMetric */
        $otherMetric = $this->route('other_metric');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('other_metrics', 'name')->ignore($otherMetric->id),
            ],
            'status' => [
                'required',
                Rule::in(['Active', 'Inactive']),
            ],
        ];
    }
}
