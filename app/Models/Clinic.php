<?php

namespace App\Models;

use Database\Factories\ClinicFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\Uid\Ulid;

#[Fillable(['name', 'location', 'operating_days'])]
class Clinic extends Model
{
    /** @use HasFactory<ClinicFactory> */
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (Clinic $clinic) {
            if (empty($clinic->id)) {
                $clinic->id = (string) Ulid::generate();
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
            'operating_days' => 'array',
        ];
    }
}
