<?php

namespace App\Models;

use App\NursingShift;
use Carbon\CarbonImmutable;
use Database\Factories\NursingDailyReportFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Symfony\Component\Uid\Ulid;

/**
 * @property string $id
 * @property string $patient_name
 * @property string $hospital_number
 * @property string $report
 * @property string $ward_id
 * @property NursingShift $shift
 * @property string $created_by
 * @property CarbonImmutable|Carbon $creation_date
 * @property int $reported_by_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Ward $ward
 * @property-read User|null $reportedBy
 */
#[Fillable([
    'patient_name',
    'hospital_number',
    'report',
    'ward_id',
    'shift',
    'created_by',
    'creation_date',
    'reported_by_id',
])]
class NursingDailyReport extends Model
{
    /** @use HasFactory<NursingDailyReportFactory> */
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (NursingDailyReport $report) {
            if (empty($report->id)) {
                $report->id = (string) Ulid::generate();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'shift' => NursingShift::class,
            'creation_date' => 'date',
            'reported_by_id' => 'integer',
            'ward_id' => 'string',
        ];
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by_id');
    }
}
