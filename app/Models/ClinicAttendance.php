<?php

namespace App\Models;

use Database\Factories\ClinicAttendanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Symfony\Component\Uid\Ulid;

#[Fillable(['stat_date', 'clinic_id', 'outpatients'])]
class ClinicAttendance extends Model
{
    /** @use HasFactory<ClinicAttendanceFactory> */
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (ClinicAttendance $clinicAttendance) {
            if (empty($clinicAttendance->id)) {
                $clinicAttendance->id = (string) Ulid::generate();
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
            'outpatients' => 'integer',
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

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
