import { Head } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    BedDouble,
    Clock3,
    Gauge,
    HeartPulse,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-muted-foreground label-sm">
                            Tuesday · 06:00 handoff
                        </p>
                        <h1 className="headline-lg text-foreground mt-1">
                            Good morning, clinical team
                        </h1>
                        <p className="text-muted-foreground body-sm mt-1">
                            A calm read on the unit before the next decision.
                        </p>
                    </div>
                    <div className="text-muted-foreground body-sm flex items-center gap-2">
                        <span className="bg-stable size-2 rounded-full" />
                        Live updates · 2 min ago
                    </div>
                </header>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
                    <div className="bg-primary text-primary-foreground shadow-layer-1 rounded-lg p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="label-sm text-primary-foreground/70">
                                    Shift pulse
                                </p>
                                <h2 className="headline-sm text-primary-foreground mt-2">
                                    Census is holding steady
                                </h2>
                                <p className="text-primary-foreground/75 body-sm mt-1 max-w-md">
                                    Capacity is comfortable, with two transfer
                                    decisions worth watching this morning.
                                </p>
                            </div>
                            <div className="bg-primary-foreground/10 rounded-md p-2">
                                <Activity className="size-5" />
                            </div>
                        </div>
                        <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-end">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="tabular-kpi text-primary-foreground">
                                        42
                                    </span>
                                    <span className="text-primary-foreground/70 body-sm">
                                        / 48 beds
                                    </span>
                                </div>
                                <p className="text-primary-foreground/70 label-sm mt-2">
                                    87.5% occupied
                                </p>
                            </div>
                            <div>
                                <div className="body-sm mb-2 flex justify-between">
                                    <span className="text-primary-foreground/70">
                                        Current occupancy
                                    </span>
                                    <span className="text-primary-foreground font-semibold tabular-nums">
                                        87.5%
                                    </span>
                                </div>
                                <div className="bg-primary-foreground/20 h-3 overflow-hidden rounded-full">
                                    <div className="bg-primary-foreground h-full w-[87.5%] rounded-full" />
                                </div>
                                <div className="text-primary-foreground/65 mt-2 flex justify-between text-[11px]">
                                    <span>Comfortable</span>
                                    <span>Surge threshold · 90%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="label-sm text-muted-foreground">
                                    Attention queue
                                </p>
                                <p className="headline-sm text-foreground mt-1">
                                    2 items need a look
                                </p>
                            </div>
                            <ShieldAlert className="text-bottleneck size-5" />
                        </div>
                        <div className="mt-4 space-y-2">
                            <QueueItem
                                label="Transfer pending"
                                value="2"
                                tone="bottleneck"
                            />
                            <QueueItem
                                label="Urgent alerts"
                                value="0"
                                tone="stable"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary mt-4"
                        >
                            Open attention queue
                            <ArrowUpRight className="size-3.5" />
                        </Button>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={BedDouble}
                        label="Available beds"
                        value="6"
                        detail="2 ready now"
                        tone="secondary"
                    />
                    <MetricCard
                        icon={Users}
                        label="Active patients"
                        value="42"
                        detail="+3 since 00:00"
                        tone="primary"
                    />
                    <MetricCard
                        icon={Clock3}
                        label="Median LOS"
                        value="3.8"
                        unit="days"
                        detail="0.4 below target"
                        tone="critical"
                    />
                    <MetricCard
                        icon={Gauge}
                        label="Throughput"
                        value="91"
                        unit="%"
                        detail="+6% vs last shift"
                        tone="stable"
                    />
                </section>

                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border">
                        <div className="border-border/70 flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <p className="label-sm text-muted-foreground">
                                    Unit readout
                                </p>
                                <h2 className="headline-sm text-foreground mt-1">
                                    Operational signals
                                </h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary"
                            >
                                View all
                            </Button>
                        </div>
                        <div className="divide-border/70 divide-y">
                            <SignalRow
                                label="Discharges today"
                                value="8"
                                note="On plan"
                                tone="stable"
                            />
                            <SignalRow
                                label="Average acuity"
                                value="3.1"
                                note="Watch closely"
                                tone="critical"
                            />
                            <SignalRow
                                label="Pending transfers"
                                value="2"
                                note="Needs coordination"
                                tone="bottleneck"
                            />
                            <SignalRow
                                label="Rapid responses"
                                value="0"
                                note="No active alerts"
                                tone="stable"
                            />
                        </div>
                    </div>

                    <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="label-sm text-muted-foreground">
                                    Six-hour flow
                                </p>
                                <h2 className="headline-sm text-foreground mt-1">
                                    Census movement
                                </h2>
                            </div>
                            <HeartPulse className="text-secondary size-5" />
                        </div>
                        <div className="mt-6 flex h-32 items-end gap-2">
                            {[
                                38, 52, 45, 68, 60, 82, 74, 88, 76, 92, 86, 90,
                            ].map((height, index) => (
                                <div
                                    key={index}
                                    className="bg-secondary/10 flex-1 rounded-t-sm"
                                    style={{ height: `${height}%` }}
                                >
                                    <div
                                        className="bg-secondary h-full rounded-t-sm"
                                        style={{ opacity: 0.4 + index / 25 }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="text-muted-foreground body-sm mt-3 flex justify-between">
                            <span>00:00</span>
                            <span>03:00</span>
                            <span>06:00</span>
                        </div>
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
    tone: 'primary' | 'secondary' | 'critical' | 'stable';
}) {
    const iconClass = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        critical: 'bg-critical-surface text-critical',
        stable: 'bg-stable-surface text-stable',
    }[tone];
    return (
        <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4">
            <div className="flex items-start justify-between">
                <p className="label-md text-muted-foreground">{label}</p>
                <span className={`rounded-md p-2 ${iconClass}`}>
                    <Icon className="size-4" />
                </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
                <span className="tabular-kpi text-foreground">{value}</span>
                {unit && (
                    <span className="text-muted-foreground body-sm">
                        {unit}
                    </span>
                )}
            </div>
            <p className="text-muted-foreground body-sm mt-1">{detail}</p>
        </div>
    );
}

function QueueItem({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: 'bottleneck' | 'stable';
}) {
    const bgClass =
        tone === 'bottleneck' ? 'bg-bottleneck-surface' : 'bg-stable-surface';
    const textClass = tone === 'bottleneck' ? 'text-bottleneck' : 'text-stable';
    const borderClass =
        tone === 'bottleneck'
            ? 'border-bottleneck-border'
            : 'border-stable-border';
    return (
        <div
            className={`${bgClass} ${borderClass} flex items-center justify-between rounded-md border px-3 py-2`}
        >
            <span className="body-sm">{label}</span>
            <span className={`text-lg font-semibold tabular-nums ${textClass}`}>
                {value}
            </span>
        </div>
    );
}

function SignalRow({
    label,
    value,
    note,
    tone,
}: {
    label: string;
    value: string;
    note: string;
    tone: 'stable' | 'critical' | 'bottleneck';
}) {
    const dotClass = {
        stable: 'bg-stable',
        critical: 'bg-critical',
        bottleneck: 'bg-bottleneck',
    }[tone];
    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
                <span className={`size-2 shrink-0 rounded-full ${dotClass}`} />
                <div>
                    <p className="body-md font-medium">{label}</p>
                    <p className="text-muted-foreground body-sm">{note}</p>
                </div>
            </div>
            <span className="tabular-dense text-foreground font-semibold">
                {value}
            </span>
        </div>
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
