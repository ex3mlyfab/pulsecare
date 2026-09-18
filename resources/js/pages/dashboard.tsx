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
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-primary mb-2 text-xs font-semibold tracking-[0.16em] uppercase">
                            Tuesday · 06:00 handoff
                        </p>
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                            Good morning, clinical team
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            A calm read on the unit before the next decision.
                        </p>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <span className="bg-stable size-2 rounded-full" />
                        Live updates · 2 min ago
                    </div>
                </header>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
                    <div className="bg-primary text-primary-foreground overflow-hidden rounded-lg p-5 shadow-layer-1 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-primary-foreground/70 text-xs font-semibold tracking-[0.14em] uppercase">
                                    Shift pulse
                                </p>
                                <h2 className="mt-2 text-xl font-semibold">
                                    Census is holding steady
                                </h2>
                                <p className="text-primary-foreground/75 mt-1 max-w-md text-sm">
                                    Capacity is comfortable, with two transfer
                                    decisions worth watching this morning.
                                </p>
                            </div>
                            <div className="bg-primary-foreground/15 rounded-md p-2">
                                <Activity className="size-5" />
                            </div>
                        </div>
                        <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-end">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl leading-none font-bold tabular-nums">
                                        42
                                    </span>
                                    <span className="text-primary-foreground/70 text-sm">
                                        / 48 beds
                                    </span>
                                </div>
                                <p className="text-primary-foreground/70 mt-2 text-xs font-semibold tracking-[0.12em] uppercase">
                                    87.5% occupied
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span>Current occupancy</span>
                                    <span className="font-semibold tabular-nums">87.5%</span>
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

                    <div className="border-border bg-card rounded-lg border p-5 shadow-layer-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                                    Attention queue
                                </p>
                                <p className="mt-1 text-lg font-semibold">2 items need a look</p>
                            </div>
                            <ShieldAlert className="text-bottleneck size-5" />
                        </div>
                        <div className="mt-5 space-y-3">
                            <QueueItem label="Transfer pending" value="2" tone="bottleneck" />
                            <QueueItem label="Urgent alerts" value="0" tone="stable" />
                        </div>
                        <button className="text-primary mt-5 flex items-center gap-1 text-xs font-semibold hover:underline">
                            Open attention queue <ArrowUpRight className="size-3.5" />
                        </button>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard icon={BedDouble} label="Available beds" value="6" detail="2 ready now" tone="secondary" />
                    <MetricCard icon={Users} label="Active patients" value="42" detail="+3 since 00:00" tone="primary" />
                    <MetricCard icon={Clock3} label="Median LOS" value="3.8" unit="days" detail="0.4 below target" tone="tertiary" />
                    <MetricCard icon={Gauge} label="Throughput" value="91" unit="%" detail="+6% vs last shift" tone="stable" />
                </section>

                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
                    <div className="border-border bg-card rounded-lg border shadow-layer-1">
                        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                                    Unit readout
                                </p>
                                <h2 className="mt-1 text-base font-semibold">Operational signals</h2>
                            </div>
                            <button className="text-primary text-xs font-semibold hover:underline">View all</button>
                        </div>
                        <div className="divide-border/70 divide-y">
                            <SignalRow label="Discharges today" value="8" note="On plan" tone="stable" />
                            <SignalRow label="Average acuity" value="3.1" note="Watch closely" tone="critical" />
                            <SignalRow label="Pending transfers" value="2" note="Needs coordination" tone="bottleneck" />
                            <SignalRow label="Rapid responses" value="0" note="No active alerts" tone="stable" />
                        </div>
                    </div>

                    <div className="border-border bg-card rounded-lg border p-5 shadow-layer-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                                    Six-hour flow
                                </p>
                                <h2 className="mt-1 text-base font-semibold">Census movement</h2>
                            </div>
                            <HeartPulse className="text-secondary size-5" />
                        </div>
                        <div className="mt-7 flex h-32 items-end gap-2">
                            {[38, 52, 45, 68, 60, 82, 74, 88, 76, 92, 86, 90].map((height, index) => (
                                <div key={index} className="bg-secondary/15 flex-1 rounded-t-sm" style={{ height: `${height}%` }}>
                                    <div className="bg-secondary h-full rounded-t-sm" style={{ opacity: 0.45 + index / 30 }} />
                                </div>
                            ))}
                        </div>
                        <div className="text-muted-foreground mt-3 flex justify-between text-[11px]">
                            <span>00:00</span><span>03:00</span><span>06:00</span>
                        </div>
                </div>
                </section>
            </div>
        </>
    );
}

function MetricCard({ icon: Icon, label, value, unit, detail, tone }: { icon: typeof BedDouble; label: string; value: string; unit?: string; detail: string; tone: 'primary' | 'secondary' | 'tertiary' | 'stable' }) {
    const iconClass = { primary: 'bg-primary/10 text-primary', secondary: 'bg-secondary/10 text-secondary', tertiary: 'bg-critical-surface text-critical', stable: 'bg-stable-surface text-stable' }[tone];
    return (
        <div className="border-border bg-card rounded-lg border p-4 shadow-layer-1">
            <div className="flex items-start justify-between">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">{label}</p>
                <span className={`rounded-md p-2 ${iconClass}`}><Icon className="size-4" /></span>
            </div>
            <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums">{value}</span>
                {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
        </div>
    );
}

function QueueItem({ label, value, tone }: { label: string; value: string; tone: 'bottleneck' | 'stable' }) {
    return <div className="bg-muted flex items-center justify-between rounded-md px-3 py-2.5"><span className="text-sm">{label}</span><span className={`text-lg font-bold tabular-nums ${tone === 'bottleneck' ? 'text-bottleneck' : 'text-stable'}`}>{value}</span></div>;
}

function SignalRow({ label, value, note, tone }: { label: string; value: string; note: string; tone: 'stable' | 'critical' | 'bottleneck' }) {
    const toneClass = { stable: 'bg-stable', critical: 'bg-critical', bottleneck: 'bg-bottleneck' }[tone];
    return <div className="flex items-center justify-between gap-4 px-5 py-3.5"><div className="flex min-w-0 items-center gap-3"><span className={`size-2 shrink-0 rounded-full ${toneClass}`} /><div><p className="text-sm font-medium">{label}</p><p className="text-muted-foreground text-xs">{note}</p></div></div><span className="text-xl font-semibold tabular-nums">{value}</span></div>;
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
