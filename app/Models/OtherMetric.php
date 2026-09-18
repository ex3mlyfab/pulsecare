<?php

namespace App\Models;

use App\OtherMetricsStatus;
use Database\Factories\OtherMetricFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\Uid\Ulid;

#[Fillable(['name', 'status'])]
class OtherMetric extends Model
{
    /** @use HasFactory<OtherMetricFactory> */
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $table = 'other_metrics';

    protected static function booted(): void
    {
        static::creating(function (OtherMetric $otherMetric) {
            if (empty($otherMetric->id)) {
                $otherMetric->id = (string) Ulid::generate();
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
            'status' => OtherMetricsStatus::class,
        ];
    }
}
