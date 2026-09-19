import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BedDouble,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    HeartPulse,
    Pencil,
    ShieldAlert,
    ShieldCheck,
    Stethoscope,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import recordStats from '@/routes/record-stats';
import statsReport from '@/routes/stats-report';

export type CensusData = {
    total_beds: number;
    total_inpatients: number;
    available_beds: number;
    occupancy_rate: number;
    surge_status: 'optimal' | 'busy' | 'surge';
};

export type FlowData = {
    admissions: number;
    discharges: number;
    emergencies: number;
    trans_in: number;
    trans_out: number;
    referred_in: number;
    referred_out: number;
    death: number;
    sama: number;
    abscond: number;
    net_flow: number;
};

export type ClinicSummary = {
    total_outpatients: number;
    operating_count: number;
    list: {
        id: string;
        name: string;
        outpatients: number;
    }[];
};

export type OtherMetricItem = {
    id: string;
    name: string;
    value: number;
};

export type AttentionQueueItem = {
    id: string;
    type: 'surge' | 'mortality' | 'irregular_discharge' | 'transfers';
    title: string;
    description: string;
    tone: 'critical' | 'bottleneck' | 'stable';
};

export type TrendPoint = {
    date: string;
    label: string;
    formatted_date: string;
    is_today: boolean;
    admissions: number;
    discharges: number;
    emergencies: number;
    inpatients: number;
};

export type WardBreakdownItem = {
    id: string;
    name: string;
    beds: number;
    inpatients: number;
    available: number;
    occupancy_rate: number;
    admissions: number;
    discharges: number;
    emergencies: number;
    status: 'optimal' | 'busy' | 'surge';
};

type Props = {
    date: string;
    weekday: string;
    census: CensusData;
    flow: FlowData;
    clinics: ClinicSummary;
    other_metrics: OtherMetricItem[];
    attention_queue: AttentionQueueItem[];
    trend: TrendPoint[];
    ward_breakdown: WardBreakdownItem[];
    can_record_stats: boolean;
};

export default function Dashboard({
    date,
    weekday,
    census,
    flow,
    clinics,
    other_metrics,
    attention_queue,
    trend,
    ward_breakdown,
    can_record_stats,
}: Props) {
    const isSurge = census.surge_status === 'surge';
    const isBusy = census.surge_status === 'busy';

    // Maximum inpatient count across 7-day trend for proportional rendering
    const maxTrendInpatients = Math.max(
        ...trend.map((t) => t.inpatients),
        census.total_inpatients,
        census.total_beds > 0 ? census.total_beds : 1,
    );

    return (
        <>
            <Head title="Clinical Dashboard" />
            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary label-sm rounded-md px-2.5 py-1 uppercase tracking-wider font-semibold">
                                {weekday} · {date}
                            </span>
                            <span className="text-muted-foreground body-sm flex items-center gap-1.5">
                                <span className="bg-stable size-2 rounded-full animate-pulse" />
                                Live Telemetry
                            </span>
                        </div>
                        <h1 className="headline-lg text-foreground mt-2">
                            Clinical Operations Dashboard
                        </h1>
                        <p className="text-muted-foreground body-sm mt-1">
                            Real-time inpatient census, ward flow, and outpatient telemetry aligned with daily record stats.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {can_record_stats && (
                            <Button asChild size="sm" className="gap-1.5 shadow-sm">
                                <Link href={recordStats.index.url()}>
                                    <Pencil className="size-3.5" />
                                    Record Today&rsquo;s Stats
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={statsReport.index.url()}>
                                <FileText className="size-3.5" />
                                Historical Report
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Hero Shift Pulse Banner & Attention Queue */}
                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                    {/* Shift Pulse */}
                    <div className="bg-primary text-primary-foreground shadow-layer-1 rounded-lg p-5 sm:p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="label-sm text-primary-foreground/75 uppercase tracking-wider">
                                        Shift Status & Capacity
                                    </p>
                                    <h2 className="headline-md text-primary-foreground mt-1 font-semibold">
                                        {isSurge
                                            ? 'Surge Alert — Capacity Exceeded'
                                            : isBusy
                                            ? 'High Operational Load — Bed Availability Tight'
                                            : 'Census Holding Steady & Operational'}
                                    </h2>
                                    <p className="text-primary-foreground/80 body-sm mt-1 max-w-xl">
                                        {census.total_inpatients} active patients residing across{' '}
                                        {ward_breakdown.length} active hospital wards. Currently{' '}
                                        {census.available_beds} beds are vacant and ready for admission.
                                    </p>
                                </div>
                                <div className="bg-primary-foreground/10 rounded-md p-2.5 shrink-0">
                                    <Activity className="size-6 text-primary-foreground" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-end">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="tabular-kpi text-primary-foreground text-3xl sm:text-4xl font-bold">
                                        {census.total_inpatients}
                                    </span>
                                    <span className="text-primary-foreground/75 body-md">
                                        / {census.total_beds} beds
                                    </span>
                                </div>
                                <p className="text-primary-foreground/80 label-sm mt-1 uppercase tracking-wider">
                                    {census.occupancy_rate}% Hospital Occupancy
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="body-sm flex justify-between">
                                    <span className="text-primary-foreground/80 font-medium">
                                        Capacity Meter
                                    </span>
                                    <span className="text-primary-foreground font-bold tabular-nums">
                                        {census.occupancy_rate}%
                                    </span>
                                </div>
                                <div className="bg-primary-foreground/20 h-3 overflow-hidden rounded-full p-0.5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            isSurge
                                                ? 'bg-critical-border'
                                                : isBusy
                                                ? 'bg-amber-300'
                                                : 'bg-primary-foreground'
                                        }`}
                                        style={{
                                            width: `${Math.min(100, Math.max(0, census.occupancy_rate))}%`,
                                        }}
                                    />
                                </div>
                                <div className="text-primary-foreground/70 flex justify-between text-[11px] font-medium">
                                    <span>Optimal (&lt;75%)</span>
                                    <span>Busy (75–89%)</span>
                                    <span>Surge (≥90%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attention Queue */}
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="label-sm text-muted-foreground uppercase tracking-wider">
                                        Operational Queue
                                    </p>
                                    <h2 className="headline-sm text-foreground mt-0.5">
                                        {attention_queue.length === 0
                                            ? 'All Units Normal'
                                            : `${attention_queue.length} items need attention`}
                                    </h2>
                                </div>
                                {attention_queue.length > 0 ? (
                                    <ShieldAlert className="text-critical size-5" />
                                ) : (
                                    <ShieldCheck className="text-stable size-5" />
                                )}
                            </div>

                            <div className="mt-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                {attention_queue.length === 0 ? (
                                    <div className="bg-stable-surface border-stable-border rounded-md border p-3 flex items-start gap-3">
                                        <CheckCircle2 className="text-stable size-4 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="body-sm font-semibold text-stable">
                                                Zero active bottlenecks
                                            </p>
                                            <p className="text-muted-foreground body-sm mt-0.5 text-xs">
                                                All wards are within licensed capacity with zero mortality flags today.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    attention_queue.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`rounded-md border px-3 py-2.5 text-left ${
                                                item.tone === 'critical'
                                                    ? 'bg-critical-surface border-critical-border'
                                                    : 'bg-bottleneck-surface border-bottleneck-border'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`body-sm font-semibold ${
                                                        item.tone === 'critical'
                                                            ? 'text-critical'
                                                            : 'text-bottleneck'
                                                    }`}
                                                >
                                                    {item.title}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground body-sm mt-0.5 text-xs">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/70 flex justify-between items-center">
                            <span className="text-muted-foreground body-sm text-xs">
                                Linked directly to daily record stats
                            </span>
                            <Button asChild variant="ghost" size="sm" className="text-primary h-auto py-1 px-2 text-xs">
                                <Link href={recordStats.index.url()}>
                                    Open record stats
                                    <ArrowUpRight className="size-3 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* 4 Primary Operational Metric Cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={Users}
                        label="Inpatient Census"
                        value={String(census.total_inpatients)}
                        unit="patients"
                        detail={`${flow.net_flow >= 0 ? '+' : ''}${flow.net_flow} net today (+${flow.admissions} / -${flow.discharges})`}
                        tone="primary"
                    />
                    <MetricCard
                        icon={BedDouble}
                        label="Available Beds"
                        value={String(census.available_beds)}
                        unit="vacant"
                        detail={`${census.occupancy_rate}% occupied of ${census.total_beds} total`}
                        tone={census.available_beds > 0 ? 'stable' : 'critical'}
                    />
                    <MetricCard
                        icon={Activity}
                        label="Today's Admissions"
                        value={String(flow.admissions)}
                        unit="admitted"
                        detail={`${flow.emergencies} emergencies · ${flow.trans_in} transfer-in`}
                        tone={flow.emergencies > 0 ? 'bottleneck' : 'secondary'}
                    />
                    <MetricCard
                        icon={HeartPulse}
                        label="Clinic Outpatients"
                        value={String(clinics.total_outpatients)}
                        unit="patients"
                        detail={`Across ${clinics.operating_count} operating clinic${clinics.operating_count === 1 ? '' : 's'}`}
                        tone="secondary"
                    />
                </section>

                {/* Main Middle Split: Ward Capacity Matrix & 7-Day Trend */}
                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                    {/* Ward Capacity & Movement Breakdown */}
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border flex flex-col">
                        <div className="border-border/70 flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <p className="label-sm text-muted-foreground uppercase tracking-wider">
                                    Ward Telemetry
                                </p>
                                <h2 className="headline-sm text-foreground mt-0.5">
                                    Active Ward Capacity & Movements
                                </h2>
                            </div>
                            <span className="text-muted-foreground body-sm text-xs tabular-nums">
                                {ward_breakdown.length} active wards
                            </span>
                        </div>

                        <div className="divide-border/70 divide-y overflow-x-auto">
                            {ward_breakdown.length === 0 ? (
                                <div className="text-muted-foreground body-sm p-8 text-center">
                                    No active wards registered in the hospital system.
                                </div>
                            ) : (
                                ward_breakdown.map((ward) => (
                                    <div
                                        key={ward.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="min-w-44">
                                            <div className="flex items-center gap-2">
                                                <p className="body-md font-semibold text-foreground">
                                                    {ward.name}
                                                </p>
                                                <StatusBadge status={ward.status} />
                                            </div>
                                            <p className="text-muted-foreground body-sm text-xs mt-0.5">
                                                {ward.inpatients} occupied · {ward.available} vacant of {ward.beds} beds
                                            </p>
                                        </div>

                                        {/* Capacity Progress Bar */}
                                        <div className="w-full sm:w-48 space-y-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-muted-foreground">Occupancy</span>
                                                <span className="text-foreground tabular-nums font-semibold">
                                                    {ward.occupancy_rate}%
                                                </span>
                                            </div>
                                            <div className="bg-muted h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        ward.status === 'surge'
                                                            ? 'bg-critical'
                                                            : ward.status === 'busy'
                                                            ? 'bg-bottleneck'
                                                            : 'bg-primary'
                                                    }`}
                                                    style={{
                                                        width: `${Math.min(100, Math.max(0, ward.occupancy_rate))}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Movements count */}
                                        <div className="flex items-center gap-3 text-xs tabular-nums">
                                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                                                +{ward.admissions} Adm
                                            </span>
                                            <span className="text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded font-medium">
                                                -{ward.discharges} Dis
                                            </span>
                                            {ward.emergencies > 0 && (
                                                <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                                                    {ward.emergencies} Emerg
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 7-Day Clinical Flow Trend ("Magic") */}
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4 sm:p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="label-sm text-muted-foreground uppercase tracking-wider">
                                        7-Day Unit Movement
                                    </p>
                                    <h2 className="headline-sm text-foreground mt-0.5">
                                        Weekly Patient Flow
                                    </h2>
                                </div>
                                <Calendar className="text-muted-foreground size-5" />
                            </div>
                            <p className="text-muted-foreground body-sm text-xs mt-1">
                                Daily admissions vs discharges collected over the past week
                            </p>

                            {/* Weekly Trend Bars */}
                            <div className="mt-8 flex h-48 items-end gap-2.5 sm:gap-3.5 pb-2">
                                {trend.map((point) => {
                                    const heightPercent =
                                        maxTrendInpatients > 0
                                            ? Math.min(100, Math.max(12, Math.round((point.inpatients / maxTrendInpatients) * 100)))
                                            : 12;

                                    return (
                                        <div
                                            key={point.date}
                                            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                                        >
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[11px] rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
                                                <p className="font-semibold">{point.formatted_date}</p>
                                                <p>Inpatients: {point.inpatients}</p>
                                                <p>+ {point.admissions} Adm / - {point.discharges} Dis</p>
                                            </div>

                                            <span className="text-[11px] tabular-nums font-semibold text-foreground">
                                                {point.inpatients}
                                            </span>

                                            <div
                                                className={`w-full rounded-t-md transition-all duration-300 ${
                                                    point.is_today
                                                        ? 'bg-primary'
                                                        : 'bg-primary/35 group-hover:bg-primary/60'
                                                }`}
                                                style={{ height: `${heightPercent}%` }}
                                            />

                                            <div className="flex flex-col items-center">
                                                <span
                                                    className={`text-xs font-semibold ${
                                                        point.is_today
                                                            ? 'text-primary underline decoration-2 underline-offset-2'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {point.label}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                                                    {point.formatted_date.split(' ')[0]}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/70 flex justify-between items-center text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2.5 rounded-sm bg-primary/40" />
                                    Prior Days
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2.5 rounded-sm bg-primary" />
                                    Today
                                </span>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-primary h-auto py-1 px-2 text-xs">
                                <Link href={statsReport.index.url()}>
                                    View Full Trend Report
                                    <ArrowUpRight className="size-3 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Bottom Section: Operating Clinics & Tracked Hospital Indicators */}
                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
                    {/* Operating Clinics Today */}
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border">
                        <div className="border-border/70 flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <p className="label-sm text-muted-foreground uppercase tracking-wider">
                                    Ambulatory Care
                                </p>
                                <h3 className="headline-sm text-foreground mt-0.5">
                                    Clinics Operating Today ({weekday})
                                </h3>
                            </div>
                            <span className="bg-secondary/10 text-secondary label-sm rounded px-2 py-1 font-semibold">
                                {clinics.total_outpatients} total outpatients
                            </span>
                        </div>

                        {clinics.list.length === 0 ? (
                            <div className="text-muted-foreground body-sm px-4 py-8 text-center">
                                No outpatient clinics scheduled to operate on {weekday}.
                            </div>
                        ) : (
                            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                {clinics.list.map((clinic) => (
                                    <div
                                        key={clinic.id}
                                        className="border-border/80 bg-background/50 hover:bg-muted/20 transition-colors shadow-sm rounded-lg border p-3.5 flex flex-col justify-between"
                                    >
                                        <p className="body-sm font-semibold text-foreground line-clamp-1">
                                            {clinic.name}
                                        </p>
                                        <div className="mt-3 flex items-baseline gap-1.5">
                                            <span className="tabular-kpi text-2xl font-bold text-foreground">
                                                {clinic.outpatients}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                patients seen
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hospital Key Operational Metrics (Other Metrics) */}
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border flex flex-col justify-between">
                        <div>
                            <div className="border-border/70 flex items-center justify-between border-b px-4 py-3">
                                <div>
                                    <p className="label-sm text-muted-foreground uppercase tracking-wider">
                                        Hospital Indicators
                                    </p>
                                    <h3 className="headline-sm text-foreground mt-0.5">
                                        Other Daily Metrics
                                    </h3>
                                </div>
                                <Stethoscope className="text-muted-foreground size-5" />
                            </div>

                            <div className="p-4">
                                {other_metrics.length === 0 ? (
                                    <div className="text-muted-foreground body-sm py-6 text-center">
                                        No other metrics configured in admin settings.
                                    </div>
                                ) : (
                                    <div className="border-border rounded-lg border divide-border/70 divide-y overflow-hidden">
                                        {other_metrics.map((metric) => (
                                            <div
                                                key={metric.id}
                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors"
                                            >
                                                <span className="body-sm font-medium text-foreground">
                                                    {metric.name}
                                                </span>
                                                <span className="tabular-dense text-foreground font-bold text-sm bg-muted/50 px-2.5 py-0.5 rounded">
                                                    {metric.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {can_record_stats && (
                            <div className="px-4 pb-4 pt-1 border-t border-border/70 flex justify-end">
                                <Button asChild variant="ghost" size="sm" className="text-primary text-xs h-auto py-1">
                                    <Link href={recordStats.index.url()}>
                                        Update Metric Values
                                        <ArrowUpRight className="size-3 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    unit,
    detail,
    tone,
}: {
    icon: typeof BedDouble;
    label: string;
    value: string;
    unit?: string;
    detail: string;
    tone: 'primary' | 'secondary' | 'critical' | 'stable' | 'bottleneck';
}) {
    const iconClass = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        critical: 'bg-critical-surface text-critical',
        stable: 'bg-stable-surface text-stable',
        bottleneck: 'bg-bottleneck-surface text-bottleneck',
    }[tone];

    return (
        <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <p className="label-sm uppercase tracking-wider text-muted-foreground font-semibold">
                    {label}
                </p>
                <span className={`rounded-md p-2 ${iconClass}`}>
                    <Icon className="size-4" />
                </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
                <span className="tabular-kpi text-3xl font-bold text-foreground">{value}</span>
                {unit && (
                    <span className="text-muted-foreground body-sm font-medium">
                        {unit}
                    </span>
                )}
            </div>
            <p className="text-muted-foreground body-sm text-xs mt-1.5 font-medium">{detail}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: 'optimal' | 'busy' | 'surge' }) {
    if (status === 'surge') {
        return (
            <span className="bg-critical-surface text-critical border border-critical-border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-critical" />
                Surge
            </span>
        );
    }

    if (status === 'busy') {
        return (
            <span className="bg-bottleneck-surface text-bottleneck border border-bottleneck-border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-bottleneck" />
                Busy
            </span>
        );
    }

    return (
        <span className="bg-stable-surface text-stable border border-stable-border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-stable" />
            Optimal
        </span>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
