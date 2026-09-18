<?php

namespace App\Http\Requests\Admin;

use App\Models\RecordStat;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecordStatRequest extends FormRequest
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
        $metricRules = collect(RecordStat::metricFields())
            ->mapWithKeys(fn (string $field) => [$field => ['nullable', 'integer', 'min:0']])
            ->all();

        return [
            'ward_id' => [
                'required',
                Rule::exists('wards', 'id'),
            ],
            'stat_date' => [
                'required',
                'date',
            ],
        ] + $metricRules;
    }
}
