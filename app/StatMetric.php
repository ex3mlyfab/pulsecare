<?php

namespace App;

enum StatMetric: string
{
    case Admission = 'admission';
    case Discharges = 'discharges';
    case TransIn = 'trans_in';
    case TransOut = 'trans_out';
    case ReferredOut = 'referred_out';
    case ReferredIn = 'referred_in';
    case Emergencies = 'emergencies';
    case Sama = 'sama';
    case Abscond = 'abscond';
    case Outpatients = 'outpatients';
    case Inpatients = 'inpatients';
    case Death = 'death';

    /**
     * Human-readable label used in the UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::Admission => 'Admission',
            self::Discharges => 'Discharges',
            self::TransIn => 'Trans In',
            self::TransOut => 'Trans Out',
            self::ReferredOut => 'Referred Out',
            self::ReferredIn => 'Referred In',
            self::Emergencies => 'Emergencies',
            self::Sama => 'SAMA',
            self::Abscond => 'Abscond',
            self::Outpatients => 'Outpatients',
            self::Inpatients => 'Inpatients',
            self::Death => 'Death',
        };
    }

    /**
     * The database column backing this metric.
     */
    public function column(): string
    {
        return $this->value;
    }

    /**
     * All metric definitions as `['key' => column, 'label' => label]`.
     *
     * @return array<int, array{key: string, label: string}>
     */
    public static function definitions(): array
    {
        return collect(self::cases())
            ->map(fn (self $metric) => ['key' => $metric->column(), 'label' => $metric->label()])
            ->all();
    }
}
