import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    BarChart3,
    CalendarDays,
    LayoutPanelTop,
    LineChart,
    PieChart,
    RotateCcw,
    Search,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type MetricDefinition = { key: string; label: string };

type EntityOption = {
    id: string;
    name: string;
};

type WardReportRow = {
    ward_id: string;
    ward_name: string;
    active: boolean;
    beds_count: number | null;
    metrics: Record<string, Record<string, number>>;
    totals: Record<string, number>;
    grand_total: number;
};

type ClinicReportRow = {
    clinic_id: string;
    clinic_name: string;
    values: Record<string, number>;
    total: number;
};

type OtherMetricReportRow = {
    metric_id: string;
    metric_name: string;
    values: Record<string, number>;
    total: number;
};

type Filters = {
    date_from: string;
    date_to: string;
    search: string;
    ward_id: string;
    clinic_id: string;
    metric_id: string;
};

type Props = {
    filters: Filters;
    wardOptions: EntityOption[];
    clinicOptions: EntityOption[];
    otherMetricOptions: EntityOption[];
    metrics: MetricDefinition[];
    wardReport: WardReportRow[];
    clinicReport: ClinicReportRow[];
    otherMetricReport: OtherMetricReportRow[];
};

type ChartKind = 'bar' | 'line' | 'donut' | 'area' | 'horizontal';

const CHARTS: { kind: ChartKind; label: string; icon: typeof BarChart3 }[] = [
    { kind: 'bar', label: 'Bar', icon: BarChart3 },
    { kind: 'horizontal', label: 'Horizontal', icon: LayoutPanelTop },
    { kind: 'line', label: 'Line', icon: LineChart },
    { kind: 'area', label: 'Area', icon: LineChart },
    { kind: 'donut', label: 'Donut', icon: PieChart },
];

type SeriesPoint = { label: string; value: number };

type Series = {
    key: string;
    label: string;
    color: string;
    points: SeriesPoint[];
};

const SEMANTIC_PALETTE = [
    'var(--primary)',
    'var(--secondary)',
    'var(--critical)',
    'var(--stable)',
    'var(--bottleneck)',
    'var(--urgent)',
    'var(--chart-4)',
    'var(--chart-5)',
];

const todayIso = () => new Date().toISOString().split('T')[0];

export default function StatsReportIndex({
    filters,
    wardOptions,
    clinicOptions,
    otherMetricOptions,
    metrics,
    wardReport,
    clinicReport,
    otherMetricReport,
}: Props) {
    const { data, setData, get, reset, processing } = useForm<Filters>(filters);
    const [chart, setChart] = useState<ChartKind>('bar');

    const wardFiltered =
        filters.ward_id !== ''
            ? wardReport.filter((row) => row.ward_id === filters.ward_id)
            : wardReport;
    const clinicFiltered =
        filters.clinic_id !== ''
            ? clinicReport.filter((row) => row.clinic_id === filters.clinic_id)
            : clinicReport;
    const metricFiltered =
        filters.metric_id !== ''
            ? otherMetricReport.filter(
                  (row) => row.metric_id === filters.metric_id,
              )
            : otherMetricReport;

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get('/stats-report', {
            preserveState: true,
            replace: true,
            only: [
                'filters',
                'wardOptions',
                'clinicOptions',
                'otherMetricOptions',
                'metrics',
                'wardReport',
                'clinicReport',
                'otherMetricReport',
            ],
        });
    };

    const applyQuickRange = (days: number) => {
        const to = todayIso();
        const from = new Date();
        from.setDate(from.getDate() - (days - 1));
        setData('date_from', from.toISOString().split('T')[0]);
        setData('date_to', to);
        get('/stats-report', {
            preserveState: true,
            replace: true,
            only: [
                'filters',
                'wardReport',
                'clinicReport',
                'otherMetricReport',
            ],
        });
    };

    const resetFilters = () => {
        reset();
        get('/stats-report', {
            preserveState: true,
            replace: true,
        });
    };

    const wardSeries: Series[] = useMemo(() => {
        const metricKeys = metrics.map((m) => m.key);
        return wardFiltered.map((row, index) => {
            const points = Object.keys(row.metrics)
                .sort()
                .map((date) => ({
                    label: date,
                    value: metricKeys.reduce(
                        (sum, key) => sum + (row.metrics[date]?.[key] ?? 0),
                        0,
                    ),
                }));
            return {
                key: row.ward_id,
                label: row.ward_name,
                color: SEMANTIC_PALETTE[index % SEMANTIC_PALETTE.length],
                points,
            };
        });
    }, [wardFiltered, metrics]);

    const clinicSeries: Series[] = useMemo(
        () =>
            buildGroupedSeries(
                clinicFiltered.map((row) => ({
                    key: row.clinic_id,
                    label: row.clinic_name,
                    values: row.values,
                })),
                SEMANTIC_PALETTE,
            ),
        [clinicFiltered],
    );

    const metricSeries: Series[] = useMemo(
        () =>
            buildGroupedSeries(
                metricFiltered.map((row) => ({
                    key: row.metric_id,
                    label: row.metric_name,
                    values: row.values,
                })),
                SEMANTIC_PALETTE,
            ),
        [metricFiltered],
    );

    const allDates = collectDateKeys(wardSeries, clinicSeries, metricSeries);

    const totals = {
        wards: wardReport.reduce((sum, row) => sum + row.grand_total, 0),
        clinics: clinicReport.reduce((sum, row) => sum + row.total, 0),
        metrics: otherMetricReport.reduce((sum, row) => sum + row.total, 0),
    };

    const rangeLabel =
        filters.date_from === filters.date_to
            ? filters.date_from
            : `${filters.date_from} – ${filters.date_to}`;

    const primarySeries: Series[] =
        wardSeries.length > 0
            ? wardSeries
            : clinicSeries.length > 0
              ? clinicSeries
              : metricSeries;

    return (
        <>
            <Head title="Stats Report" />

            <Heading
                title="Stats Report"
                description="Aggregate ward movements, clinic attendance, and other metrics across a date range"
            />

            <form
                onSubmit={submitFilters}
                className="border-border bg-card shadow-layer-1 mb-6 rounded-lg border p-4"
            >
                <div className="flex flex-wrap items-end gap-3">
                    <Field label="From">
                        <Input
                            type="date"
                            value={data.date_from}
                            min={
                                filters.date_to !== ''
                                    ? filters.date_to
                                    : undefined
                            }
                            onChange={(e) =>
                                setData('date_from', e.target.value)
                            }
                            disabled={processing}
                        />
                    </Field>
                    <Field label="To">
                        <Input
                            type="date"
                            value={data.date_to}
                            onChange={(e) => setData('date_to', e.target.value)}
                            disabled={processing}
                        />
                    </Field>
                    <Field label="Name">
                        <div className="relative">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                            <Input
                                value={data.search}
                                onChange={(e) =>
                                    setData('search', e.target.value)
                                }
                                placeholder="Ward, clinic, or metric"
                                className="w-52 pl-8"
                                aria-label="Filter by name"
                            />
                        </div>
                    </Field>
                    <Field label="Ward">
                        <Select
                            value={data.ward_id || 'all'}
                            onValueChange={(value) =>
                                setData('ward_id', value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger
                                className="w-40"
                                aria-label="Filter by ward"
                            >
                                <SelectValue placeholder="All wards" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All wards</SelectItem>
                                {wardOptions.map((ward) => (
                                    <SelectItem key={ward.id} value={ward.id}>
                                        {ward.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Clinic">
                        <Select
                            value={data.clinic_id || 'all'}
                            onValueChange={(value) =>
                                setData(
                                    'clinic_id',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger
                                className="w-40"
                                aria-label="Filter by clinic"
                            >
                                <SelectValue placeholder="All clinics" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All clinics</SelectItem>
                                {clinicOptions.map((clinic) => (
                                    <SelectItem
                                        key={clinic.id}
                                        value={clinic.id}
                                    >
                                        {clinic.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Metric">
                        <Select
                            value={data.metric_id || 'all'}
                            onValueChange={(value) =>
                                setData(
                                    'metric_id',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger
                                className="w-40"
                                aria-label="Filter by metric"
                            >
                                <SelectValue placeholder="All metrics" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All metrics</SelectItem>
                                {otherMetricOptions.map((metric) => (
                                    <SelectItem
                                        key={metric.id}
                                        value={metric.id}
                                    >
                                        {metric.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            disabled={processing}
                        >
                            Apply
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            disabled={processing}
                        >
                            <RotateCcw className="size-3.5" />
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="text-muted-foreground body-sm mt-3 flex flex-wrap items-center gap-2">
                    <CalendarDays className="size-3.5" />
                    <span>
                        {rangeLabel} · {allDates.length} day
                        {allDates.length === 1 ? '' : 's'} ·{' '}
                        {wardReport.length +
                            clinicReport.length +
                            otherMetricReport.length}{' '}
                        series
                    </span>
                    <span className="ml-auto flex gap-1">
                        <QuickRange
                            label="7d"
                            onPick={() => applyQuickRange(7)}
                            disabled={processing}
                        />
                        <QuickRange
                            label="30d"
                            onPick={() => applyQuickRange(30)}
                            disabled={processing}
                        />
                        <QuickRange
                            label="90d"
                            onPick={() => applyQuickRange(90)}
                            disabled={processing}
                        />
                    </span>
                </div>
            </form>

            <section className="grid grid-cols-3 gap-4">
                <Kpi
                    label="Ward movements"
                    value={totals.wards}
                    tone="primary"
                />
                <Kpi
                    label="Outpatients"
                    value={totals.clinics}
                    tone="secondary"
                />
                <Kpi
                    label="Other metrics"
                    value={totals.metrics}
                    tone="critical"
                />
            </section>

            <section className="mt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="label-sm text-muted-foreground">
                            Visualisation
                        </p>
                        <h2 className="headline-sm text-foreground mt-1">
                            Daily throughput by series
                        </h2>
                    </div>
                    <div className="border-border inline-flex rounded-lg border p-1">
                        {CHARTS.map((option) => (
                            <Button
                                key={option.kind}
                                type="button"
                                variant={
                                    chart === option.kind ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => setChart(option.kind)}
                                className="gap-1.5 px-3"
                            >
                                <option.icon className="size-3.5" />
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4">
                    {primarySeries.length === 0 ? (
                        <div className="text-muted-foreground body-md flex h-40 items-center justify-center">
                            No data for the selected range.
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
                            <Chart kind={chart} series={primarySeries} />
                            <Legend
                                series={primarySeries}
                                allDates={allDates}
                            />
                        </div>
                    )}
                </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <SeriesPanel
                    title="Ward movements"
                    series={wardSeries}
                    showTotals
                />
                <div className="grid gap-6">
                    <SeriesPanel
                        title="Clinic attendance"
                        series={clinicSeries}
                        showTotals
                    />
                    <SeriesPanel
                        title="Other metrics"
                        series={metricSeries}
                        showTotals
                    />
                </div>
            </div>

            <section className="mt-6">
                <p className="label-sm text-muted-foreground mb-3">
                    Detail tables
                </p>
                <div className="grid gap-4">
                    <WardTable rows={wardFiltered} metrics={metrics} />
                    <ClinicTable rows={clinicFiltered} />
                    <OtherMetricTable rows={metricFiltered} />
                </div>
            </section>
        </>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="label-sm text-muted-foreground">{label}</span>
            {children}
        </label>
    );
}

function QuickRange({
    label,
    onPick,
    disabled,
}: {
    label: string;
    onPick: () => void;
    disabled?: boolean;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onPick}
            disabled={disabled}
        >
            {label}
        </Button>
    );
}

function Kpi({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'primary' | 'secondary' | 'critical';
}) {
    const toneClass = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        critical: 'text-critical',
    }[tone];

    return (
        <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4">
            <p className="label-md text-muted-foreground">{label}</p>
            <div className={`tabular-kpi mt-2 ${toneClass}`}>{value}</div>
        </div>
    );
}

function Chart({ kind, series }: { kind: ChartKind; series: Series[] }) {
    const empty = series.every((s) => s.points.every((p) => p.value === 0));
    if (empty) {
        return (
            <div className="text-muted-foreground body-md flex h-64 items-center justify-center">
                No values to plot in this range.
            </div>
        );
    }

    switch (kind) {
        case 'donut':
            return <DonutChart series={series} />;
        case 'horizontal':
            return <HorizontalBarChart series={series} />;
        case 'line':
            return <LineChartSvg series={series} fill={false} />;
        case 'area':
            return <LineChartSvg series={series} fill={true} />;
        default:
            return <BarChartSvg series={series} />;
    }
}

function DonutChart({ series }: { series: Series[] }) {
    const items = series.map((s) => ({
        label: s.label,
        value: s.points.reduce((sum, p) => sum + p.value, 0),
        color: s.color,
    }));
    const total = items.reduce((sum, i) => sum + i.value, 0) || 1;
    const radius = 70;
    const stroke = 26;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <svg viewBox="0 0 180 180" className="size-44 -rotate-90">
                <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    className="stroke-muted"
                />
                {items.map((item) => {
                    const dash = (item.value / total) * circumference;
                    const segment = (
                        <circle
                            key={item.label}
                            cx="90"
                            cy="90"
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={-offset}
                        />
                    );
                    offset += dash;
                    return segment;
                })}
            </svg>
            <ul className="body-sm space-y-1.5">
                {items.map((item) => (
                    <li key={item.label} className="flex items-center gap-2">
                        <span
                            className="size-2.5 rounded-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground min-w-24">
                            {item.label}
                        </span>
                        <span className="ml-auto tabular-nums">
                            {Math.round((item.value / total) * 100)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function HorizontalBarChart({ series }: { series: Series[] }) {
    const items = series.map((s) => ({
        label: s.label,
        value: s.points.reduce((sum, p) => sum + p.value, 0),
        color: s.color,
    }));
    const max = Math.max(1, ...items.map((i) => i.value));
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.label}>
                    <div className="body-sm mb-1 flex justify-between">
                        <span>{item.label}</span>
                        <span className="text-muted-foreground tabular-nums">
                            {item.value}
                        </span>
                    </div>
                    <div className="bg-muted h-2.5 overflow-hidden rounded-full">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${(item.value / max) * 100}%`,
                                backgroundColor: item.color,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function BarChartSvg({ series }: { series: Series[] }) {
    const width = 720;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const labels = series[0]?.points.map((p) => p.label) ?? [];
    const maxGroup = Math.max(
        1,
        ...series.flatMap((s) => s.points.map((p) => p.value)),
    );
    const yTicks = buildTicks(maxGroup);
    const groupW = labels.length ? innerW / labels.length : innerW;
    const barGap = 2;
    const barW = labels.length
        ? (groupW - barGap * (series.length + 1)) / series.length
        : 0;

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full min-w-[560px]"
            >
                {yTicks.map((tick) => {
                    const y =
                        padding.top +
                        innerH -
                        (tick / (maxGroup || 1)) * innerH;
                    return (
                        <g key={tick}>
                            <line
                                x1={padding.left}
                                x2={width - padding.right}
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                strokeWidth={0.5}
                                className="text-muted-foreground/20"
                            />
                            <text
                                x={padding.left - 8}
                                y={y + 3}
                                textAnchor="end"
                                fontSize={10}
                                className="fill-muted-foreground"
                            >
                                {tick}
                            </text>
                        </g>
                    );
                })}
                {labels.map((label, i) => (
                    <g key={label}>
                        {series.map((s, si) => {
                            const value = s.points[i]?.value ?? 0;
                            const h = (value / (maxGroup || 1)) * innerH;
                            const x =
                                padding.left +
                                i * groupW +
                                barGap +
                                si * (barW + barGap);
                            return (
                                <rect
                                    key={s.key}
                                    x={x}
                                    y={padding.top + innerH - h}
                                    width={barW}
                                    height={h}
                                    rx={2}
                                    fill={s.color}
                                >
                                    <title>
                                        {`${s.label} · ${label}: ${value}`}
                                    </title>
                                </rect>
                            );
                        })}
                        <text
                            x={padding.left + i * groupW + groupW / 2}
                            y={height - padding.bottom + 18}
                            textAnchor="middle"
                            fontSize={10}
                            className="fill-muted-foreground"
                        >
                            {shortDate(label)}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

function LineChartSvg({ series, fill }: { series: Series[]; fill: boolean }) {
    const width = 720;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const labels = series[0]?.points.map((p) => p.label) ?? [];
    const max = Math.max(
        1,
        ...series.flatMap((s) => s.points.map((p) => p.value)),
    );
    const x = (i: number) =>
        labels.length <= 1
            ? padding.left + innerW / 2
            : padding.left + (i / (labels.length - 1)) * innerW;
    const y = (value: number) => padding.top + innerH - (value / max) * innerH;

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full min-w-[560px]"
            >
                <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={padding.top + innerH}
                    y2={padding.top + innerH}
                    stroke="currentColor"
                    strokeWidth={1}
                    className="text-muted-foreground/30"
                />
                {labels.map((label, i) =>
                    i % Math.max(1, Math.ceil(labels.length / 8)) === 0 ? (
                        <text
                            key={label}
                            x={x(i)}
                            y={height - padding.bottom + 18}
                            textAnchor="middle"
                            fontSize={10}
                            className="fill-muted-foreground"
                        >
                            {shortDate(label)}
                        </text>
                    ) : null,
                )}
                {series.map((s) => {
                    const linePath = s.points
                        .map(
                            (p, i) =>
                                `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`,
                        )
                        .join(' ');
                    const areaPath = `${linePath} L ${x(
                        s.points.length - 1,
                    )} ${padding.top + innerH} L ${x(0)} ${padding.top + innerH} Z`;
                    return (
                        <g key={s.key}>
                            {fill && (
                                <path
                                    d={areaPath}
                                    fill={s.color}
                                    opacity={0.15}
                                />
                            )}
                            <path
                                d={linePath}
                                fill="none"
                                stroke={s.color}
                                strokeWidth={2}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            {s.points.map((p, i) => (
                                <circle
                                    key={i}
                                    cx={x(i)}
                                    cy={y(p.value)}
                                    r={2.5}
                                    fill={s.color}
                                />
                            ))}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function Legend({
    series,
    allDates,
}: {
    series: Series[];
    allDates: string[];
}) {
    return (
        <div className="border-border rounded-lg border p-4">
            <p className="label-sm text-muted-foreground mb-3">Series</p>
            <ul className="body-sm space-y-2">
                {series.map((s) => (
                    <li key={s.key} className="flex items-center gap-2">
                        <span
                            className="size-3 rounded-sm"
                            style={{ backgroundColor: s.color }}
                        />
                        <span className="min-w-0 flex-1 truncate">
                            {s.label}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                            {s.points.reduce((sum, p) => sum + p.value, 0)}
                        </span>
                    </li>
                ))}
                {series.length === 0 && (
                    <li className="text-muted-foreground body-sm">No series</li>
                )}
            </ul>
            <p className="text-muted-foreground body-sm mt-4">
                {allDates.length} days in range
            </p>
        </div>
    );
}

function SeriesPanel({
    title,
    series,
    showTotals,
}: {
    title: string;
    series: Series[];
    showTotals: boolean;
}) {
    return (
        <div className="border-border bg-card shadow-layer-1 rounded-lg border">
            <div className="border-border/70 border-b px-4 py-3">
                <p className="label-sm text-muted-foreground">{title}</p>
            </div>
            {series.length === 0 ? (
                <div className="text-muted-foreground body-sm px-4 py-8 text-center">
                    No records in this range.
                </div>
            ) : (
                <div className="divide-border/70 divide-y">
                    {series.map((s) => (
                        <div key={s.key} className="px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="body-md font-medium">
                                    {s.label}
                                </span>
                                {showTotals && (
                                    <span className="tabular-dense text-foreground font-semibold">
                                        {s.points.reduce(
                                            (sum, p) => sum + p.value,
                                            0,
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function WardTable({
    rows,
    metrics,
}: {
    rows: WardReportRow[];
    metrics: MetricDefinition[];
}) {
    return (
        <div className="border-border bg-card shadow-layer-1 rounded-lg border">
            <div className="border-border/70 border-b px-4 py-3">
                <p className="label-sm text-muted-foreground">Ward movements</p>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="label-sm">Ward</TableHead>
                            {metrics.map((metric) => (
                                <TableHead
                                    key={metric.key}
                                    className="label-sm text-right"
                                >
                                    {metric.label}
                                </TableHead>
                            ))}
                            <TableHead className="label-sm text-right">
                                Total
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.ward_id}>
                                <TableCell className="body-md font-medium">
                                    {row.ward_name}
                                    {!row.active && (
                                        <span className="text-muted-foreground body-sm ml-2">
                                            inactive
                                        </span>
                                    )}
                                </TableCell>
                                {metrics.map((metric) => (
                                    <TableCell
                                        key={metric.key}
                                        className="tabular-dense text-right"
                                    >
                                        {row.totals[metric.key] ?? 0}
                                    </TableCell>
                                ))}
                                <TableCell className="tabular-dense text-right font-semibold">
                                    {row.grand_total}
                                </TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={metrics.length + 2}
                                    className="text-muted-foreground body-sm py-8 text-center"
                                >
                                    No ward movements in this range.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function ClinicTable({ rows }: { rows: ClinicReportRow[] }) {
    return (
        <div className="border-border bg-card shadow-layer-1 rounded-lg border">
            <div className="border-border/70 border-b px-4 py-3">
                <p className="label-sm text-muted-foreground">
                    Clinic attendance
                </p>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="label-sm">Clinic</TableHead>
                        <TableHead className="label-sm text-right">
                            Outpatients
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.clinic_id}>
                            <TableCell className="body-md font-medium">
                                {row.clinic_name}
                            </TableCell>
                            <TableCell className="tabular-dense text-right">
                                {row.total}
                            </TableCell>
                        </TableRow>
                    ))}
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={2}
                                className="text-muted-foreground body-sm py-8 text-center"
                            >
                                No clinic attendance in this range.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function OtherMetricTable({ rows }: { rows: OtherMetricReportRow[] }) {
    return (
        <div className="border-border bg-card shadow-layer-1 rounded-lg border">
            <div className="border-border/70 border-b px-4 py-3">
                <p className="label-sm text-muted-foreground">Other metrics</p>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="label-sm">Metric</TableHead>
                        <TableHead className="label-sm text-right">
                            Total
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.metric_id}>
                            <TableCell className="body-md font-medium">
                                {row.metric_name}
                            </TableCell>
                            <TableCell className="tabular-dense text-right">
                                {row.total}
                            </TableCell>
                        </TableRow>
                    ))}
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={2}
                                className="text-muted-foreground body-sm py-8 text-center"
                            >
                                No other-metric values in this range.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function dateKeys(values: Record<string, number>): string[] {
    return Object.keys(values).sort();
}

function buildGroupedSeries(
    rows: { key: string; label: string; values: Record<string, number> }[],
    palette: string[],
): Series[] {
    return rows.map((row, index) => ({
        key: row.key,
        label: row.label,
        color: palette[index % palette.length],
        points: dateKeys(row.values).map((iso) => ({
            label: iso,
            value: row.values[iso] ?? 0,
        })),
    }));
}

function collectDateKeys(...groups: Series[][]): string[] {
    const dates = new Set<string>();
    groups
        .flat()
        .forEach((series) => series.points.forEach((p) => dates.add(p.label)));
    return Array.from(dates).sort();
}

function shortDate(iso: string): string {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
}

function buildTicks(max: number): number[] {
    const steps = 4;
    const niceMax = niceCeil(max || 1);
    const step = niceMax / steps;
    return Array.from({ length: steps + 1 }, (_, i) => Math.round(i * step));
}

function niceCeil(value: number): number {
    if (value <= 1) return 1;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;
    const nice =
        normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return nice * magnitude;
}

StatsReportIndex.layout = {
    breadcrumbs: [
        {
            title: 'Stats Report',
            href: '/stats-report',
        },
    ],
};
