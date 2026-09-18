<?php

namespace App\Models;

use App\WardStatus;
use Database\Factories\WardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Symfony\Component\Uid\Ulid;

#[Fillable(['name', 'beds_count', 'location', 'status', 'matron_in_charge_id'])]
class Ward extends Model
{
    /** @use HasFactory<WardFactory> */
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (Ward $ward) {
            if (empty($ward->id)) {
                $ward->id = (string) Ulid::generate();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'status' => WardStatus::class,
            'beds_count' => 'integer',
            'matron_in_charge_id' => 'string',
        ];
    }

    public function matronInCharge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'matron_in_charge_id');
    }
}
