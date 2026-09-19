<?php

namespace App\Models;

use App\StatMetric;
use Database\Factories\RecordStatFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Symfony\Component\Uid\Ulid;

#[Fillable(['stat_date', 'ward_id', 'admission', 'discharges', 'trans_in', 'trans_out', 'referred_out', 'referred_in', 'emergencies', 'sama', 'abscond', 'outpatients', 'inpatients', 'death'])]
class RecordStat extends Model
{
    /** @use HasFactory<RecordStatFactory> */
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (RecordStat $recordStat) {
            if (empty($recordStat->id)) {
                $recordStat->id = (string) Ulid::generate();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'stat_date' => 'date:Y-m-d',
            'admission' => 'integer',
            'discharges' => 'integer',
            'trans_in' => 'integer',
            'trans_out' => 'integer',
            'referred_out' => 'integer',
            'referred_in' => 'integer',
            'emergencies' => 'integer',
            'sama' => 'integer',
            'abscond' => 'integer',
            'outpatients' => 'integer',
            'inpatients' => 'integer',
            'death' => 'integer',
        ];
    }

    /**
     * The 12 recordable metric column names, in display order.
     *
     * @return list<string>
     */
    public static function metricFields(): array
    {
        return collect(StatMetric::cases())
            ->map(fn (StatMetric $metric) => $metric->column())
            ->all();
    }

    /**
     * Restrict a query to a single day.
     *
     * @return Builder<static>
     */
    public function scopeForDate(Builder $query, \DateTimeInterface $date): Builder
    {
        return $query->whereDate('stat_date', $date->format('Y-m-d'));
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    /**
     * Sum of every metric for this record.
     */
    public function total(): int
    {
        return collect(static::metricFields())
            ->reduce(fn (int $carry, string $field) => $carry + (int) $this->{$field}, 0);
    }
}
