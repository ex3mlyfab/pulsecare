<?php

namespace App\Models;

use Database\Factories\DailyMetricValueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Symfony\Component\Uid\Ulid;

#[Fillable(['stat_date', 'other_metric_id', 'value'])]
class DailyMetricValue extends Model
{
    /** @use HasFactory<DailyMetricValueFactory> */
    use HasFactory;

    protected $table = 'daily_metric_values';

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (DailyMetricValue $dailyMetricValue) {
            if (empty($dailyMetricValue->id)) {
                $dailyMetricValue->id = (string) Ulid::generate();
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stat_date' => 'date:Y-m-d',
            'value' => 'integer',
        ];
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

    public function otherMetric(): BelongsTo
    {
        return $this->belongsTo(OtherMetric::class, 'other_metric_id');
    }
}
