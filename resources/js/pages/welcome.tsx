import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    BellRing,
    Filter,
    ShieldCheck,
    Users,
    Waves,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, login } from '@/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

type Feature = {
    icon: typeof Users;
    title: string;
    body: string;
};

type Kpi = {
    category: string;
    metric: string;
    unit: string;
    delta: string;
    deltaTone: 'stable' | 'bottleneck' | 'urgent';
    spark: number[];
};

const FEATURES: Feature[] = [
    {
        icon: Users,
        title: 'Real-time census',
        body: 'Live bed and occupancy counts per unit, refreshed on a rolling poll so your board always matches the floor.',
    },
    {
        icon: BarChart3,
        title: 'Throughput & trends',
        body: 'Six-hour rolling KPIs and sparklines that surface adverse backlog before it becomes a code.',
    },
    {
        icon: Filter,
        title: 'Filterable unit data',
        body: 'Slice by acuity tier, shift, or service line with instant, scannable results.',
    },
    {
        icon: BellRing,
        title: 'Operational alerts',
        body: 'Surge thresholds and divert signals escalate through semantic status levels, not noise.',
    },
];

const KPIS: Kpi[] = [
    {
        category: 'Current census',
        metric: '42',
        unit: '/ 48 beds',
        delta: '+4 vs last shift',
        deltaTone: 'bottleneck',
        spark: [38, 39, 41, 40, 42],
    },
    {
        category: 'Avg length of stay',
        metric: '2.4',
        unit: 'hrs',
        delta: '-0.6 hrs',
        deltaTone: 'stable',
        spark: [3.1, 2.9, 2.7, 2.6, 2.4],
    },
    {
        category: 'High-acuity hold',
        metric: '7',
        unit: 'patients',
        delta: '+2 this hour',
        deltaTone: 'urgent',
        spark: [4, 4, 5, 6, 7],
    },
    {
        category: 'On-time discharge',
        metric: '92',
        unit: '%',
        delta: '+5 pts',
        deltaTone: 'stable',
        spark: [85, 87, 89, 90, 92],
    },
];

function Sparkline({
    points,
    tone,
}: {
    points: number[];
    tone: Kpi['deltaTone'];
}) {
    const width = 96;
    const height = 28;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const step = width / (points.length - 1);

    const coords = points.map((value, index) => {
        const x = index * step;
        const y = height - ((value - min) / range) * height;
        return [x, y] as const;
    });

    const path = coords.map(([x, y]) => `${x},${y}`).join(' ');
    const [lastX, lastY] = coords[coords.length - 1];

    const stroke =
        tone === 'stable'
            ? 'var(--stable)'
            : tone === 'urgent'
              ? 'var(--urgent)'
              : 'var(--bottleneck)';

    return (
        <svg
            className="overflow-visible"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
        >
            <polyline
                points={path}
                fill="none"
                stroke={stroke}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx={lastX} cy={lastY} r="2.5" fill={stroke} />
        </svg>
    );
}

export default function Welcome() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="PulseCare — Clinical Operations Engine" />

            <div className="bg-background text-foreground min-h-svh">
                {/* Nav */}
                <header className="border-border bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                                <Activity className="size-4" />
                            </span>
                            <span className="text-base font-semibold tracking-tight">
                                PulseCare
                            </span>
                            <Badge
                                variant="secondary"
                                className="hidden sm:inline-flex"
                            >
                                Clinical Operations Engine
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-8 rounded-md"
                                >
                                    <Link href={dashboard()}>
                                        Open dashboard
                                        <ArrowUpRight className="size-3.5" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-md"
                                >
                                    <Link href={login()}>Sign in</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 sm:px-6">
                    {/* Hero */}
                    <section className="py-16 sm:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <Badge variant="secondary" className="mb-5">
                                <Waves className="size-3" />
                                Built for nursing units
                            </Badge>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Calm situational awareness for your nursing
                                unit.
                            </h1>
                            <p className="muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
                                PulseCare collects your unit's data and turns it
                                into interactive, filterable views and charts —
                                so leaders can see the whole picture at a
                                glance, even mid-shift.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    className="h-10 w-full rounded-md px-6 sm:w-auto"
                                >
                                    <Link href={login()}>
                                        {auth.user
                                            ? 'Go to dashboard'
                                            : 'Sign in'}
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="h-10 w-full rounded-md px-6 sm:w-auto"
                                >
                                    <a href="#capabilities">
                                        Explore capabilities
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* KPI preview */}
                    <section className="pb-16 sm:pb-20">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {KPIS.map((kpi) => (
                                <Card key={kpi.category}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <p className="label-md muted-foreground text-xs font-semibold tracking-wider uppercase">
                                                {kpi.category}
                                            </p>
                                            <Sparkline
                                                points={kpi.spark}
                                                tone={kpi.deltaTone}
                                            />
                                        </div>
                                        <div className="mt-3 flex items-baseline gap-1.5">
                                            <span className="text-2xl leading-none font-bold tabular-nums">
                                                {kpi.metric}
                                            </span>
                                            <span className="muted-foreground text-xs">
                                                {kpi.unit}
                                            </span>
                                        </div>
                                        <p
                                            className={
                                                'mt-2 text-xs font-medium tabular-nums ' +
                                                (kpi.deltaTone === 'stable'
                                                    ? 'text-stable'
                                                    : kpi.deltaTone === 'urgent'
                                                      ? 'text-urgent'
                                                      : 'text-bottleneck')
                                            }
                                        >
                                            {kpi.delta}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Capabilities */}
                    <section
                        id="capabilities"
                        className="border-border border-t pt-8 pb-20"
                    >
                        <div className="mb-8 flex flex-col gap-2 sm:mb-10">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                What PulseCare does for your unit
                            </h2>
                            <p className="muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
                                No clutter, no guesswork. Every element earns
                                its place on the board.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {FEATURES.map(({ icon: Icon, title, body }) => (
                                <Card key={title} className="h-full">
                                    <CardContent className="p-5">
                                        <div className="bg-primary flex size-10 items-center justify-center rounded-md">
                                            <Icon className="text-primary-foreground size-5" />
                                        </div>
                                        <h3 className="mt-4 text-base font-semibold">
                                            {title}
                                        </h3>
                                        <p className="muted-foreground mt-1.5 text-sm leading-relaxed">
                                            {body}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Card>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="bg-critical flex size-10 shrink-0 items-center justify-center rounded-md">
                                        <ShieldCheck className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold">
                                            Surge &amp; divert signals
                                        </h3>
                                        <p className="muted-foreground text-sm">
                                            85% warning, 95% critical thresholds
                                            — clear, color-coded, and immediate.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-md">
                                        <Users className="text-secondary-foreground size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold">
                                            Role-aware views
                                        </h3>
                                        <p className="muted-foreground text-sm">
                                            What a charge nurse needs is
                                            different from a unit director's.
                                            Views adapt to the role.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="pb-20">
                        <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center sm:p-12">
                            <h2 className="text-xl font-semibold sm:text-2xl">
                                Ready to see your unit clearly?
                            </h2>
                            <p className="text-primary-foreground/80 mx-auto mt-2 max-w-xl text-sm sm:text-base">
                                Sign in to open your dashboard, or get access
                                from your hospital's PulseCare admin.
                            </p>
                            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="text-primary h-10 w-full rounded-md bg-white px-6 sm:w-auto"
                                >
                                    <Link href={login()}>Sign in</Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-border border-t">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
                        <div className="flex items-center gap-2 text-sm">
                            <Activity className="size-4" />
                            <span>PulseCare — Clinical Operations Engine</span>
                        </div>
                        <p className="muted-foreground text-xs">
                            For internal clinical operations use.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
