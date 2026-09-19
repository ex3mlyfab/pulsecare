import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    BedDouble,
    BellRing,
    CheckCircle2,
    Clock,
    Filter,
    HeartPulse,
    ShieldAlert,
    ShieldCheck,
    Stethoscope,
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
    deltaTone: 'stable' | 'bottleneck' | 'critical';
    spark: number[];
};

const FEATURES: Feature[] = [
    {
        icon: Users,
        title: 'Real-time Ward Census',
        body: 'Live bed and occupancy counts per unit, synchronised with daily ward shift stats so your telemetry always matches the floor.',
    },
    {
        icon: BarChart3,
        title: '7-Day Flow Telemetry',
        body: 'Rolling weekly admissions, step-downs, and discharge trends that surface operational bottlenecks before capacity breaches.',
    },
    {
        icon: Stethoscope,
        title: 'Ambulatory & Clinic Tracking',
        body: 'Schedule-aware clinic attendances tracking outpatient volume across departments every single day.',
    },
    {
        icon: BellRing,
        title: 'Clinical Attention Queue',
        body: 'Rule-based operational alerts: wards exceeding 90% surge capacity, mortality governance flags, and irregular patient exits.',
    },
];

const KPIS: Kpi[] = [
    {
        category: 'Hospital Census',
        metric: '42',
        unit: '/ 48 beds',
        delta: '87.5% occupancy · surge threshold 90%',
        deltaTone: 'stable',
        spark: [36, 38, 40, 39, 41, 40, 42],
    },
    {
        category: 'Available Beds',
        metric: '6',
        unit: 'beds',
        delta: '2 acute beds ready now',
        deltaTone: 'stable',
        spark: [12, 10, 8, 9, 7, 8, 6],
    },
    {
        category: 'Today’s Admissions',
        metric: '9',
        unit: 'patients',
        delta: '+5 emergencies · 1 ward transfer',
        deltaTone: 'bottleneck',
        spark: [4, 6, 5, 8, 7, 8, 9],
    },
    {
        category: 'Clinic Outpatients',
        metric: '48',
        unit: 'patients',
        delta: 'Across 4 operating clinics today',
        deltaTone: 'stable',
        spark: [32, 40, 38, 45, 42, 46, 48],
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
            ? '#10B981'
            : tone === 'critical'
              ? '#EF4444'
              : '#F59E0B';

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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx={lastX} cy={lastY} r="3" fill={stroke} />
        </svg>
    );
}

export default function Welcome() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="PulseCare — Clinical Operations Engine" />

            <div className="bg-background text-foreground min-h-svh flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
                {/* Navigation */}
                <header className="border-border bg-background/90 sticky top-0 z-30 border-b backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md shadow-sm">
                                <Activity className="size-5 text-emerald-200" />
                            </span>
                            <span className="text-lg font-bold tracking-tight text-foreground">
                                PulseCare
                            </span>
                            <span className="hidden sm:inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                                Clinical Operations Engine
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-9 rounded-md gap-1.5 font-semibold"
                                >
                                    <Link href={dashboard()}>
                                        Open Dashboard
                                        <ArrowUpRight className="size-3.5" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    size="sm"
                                    className="h-9 rounded-md font-semibold px-4"
                                >
                                    <Link href={login()}>Sign in</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 sm:px-6 flex-1 w-full">
                    {/* Hero Section with Clinical Grounding */}
                    <section className="py-14 sm:py-20 lg:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary shadow-layer-1">
                                <span className="size-2 animate-pulse rounded-full bg-primary" />
                                Engineered for Hospital Nursing &amp; Clinical Leadership
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
                                Calm situational awareness for your nursing unit.
                            </h1>
                            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg text-balance">
                                PulseCare turns fragmented shift logs into crisp, real-time census telemetry, ward capacity alerts, and outpatient analytics — built for high-stakes decisions during 12-hour hospital shifts.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
                                <Button
                                    asChild
                                    className="h-11 w-full rounded-md px-8 sm:w-auto font-semibold shadow-layer-1"
                                >
                                    <Link href={auth.user ? dashboard() : login()}>
                                        {auth.user ? 'Enter Clinical Dashboard' : 'Sign in to PulseCare'}
                                        <ArrowUpRight className="size-4 ml-1.5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11 w-full rounded-md px-6 sm:w-auto font-medium"
                                >
                                    <a href="#telemetry">
                                        Explore Telemetry
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Real-time Telemetry Showcase (KPI Cards) */}
                    <section id="telemetry" className="pb-16 sm:pb-20 scroll-mt-20">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="label-sm text-muted-foreground uppercase tracking-wider font-semibold">
                                    Live Telemetry Preview
                                </p>
                                <h2 className="headline-sm text-foreground mt-0.5">
                                    Shift Operational Pulse
                                </h2>
                            </div>
                            <span className="text-muted-foreground body-sm text-xs hidden sm:inline-flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-stable" />
                                Active unit monitoring
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {KPIS.map((kpi) => (
                                <Card key={kpi.category} className="border-border bg-card shadow-layer-1 rounded-xl border transition-colors hover:border-primary/30">
                                    <CardContent className="flex h-full flex-col justify-between p-4 sm:p-5">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="label-sm text-muted-foreground font-semibold tracking-wider uppercase">
                                                    {kpi.category}
                                                </p>
                                                <Sparkline
                                                    points={kpi.spark}
                                                    tone={kpi.deltaTone}
                                                />
                                            </div>
                                            <div className="mt-4 flex items-baseline gap-1.5">
                                                <span className="tabular-kpi text-3xl font-bold text-foreground">
                                                    {kpi.metric}
                                                </span>
                                                <span className="text-muted-foreground body-sm font-medium">
                                                    {kpi.unit}
                                                </span>
                                            </div>
                                        </div>
                                        <p
                                            className={
                                                'mt-3 text-xs font-semibold tabular-nums pt-2 border-t border-border/60 ' +
                                                (kpi.deltaTone === 'stable'
                                                    ? 'text-emerald-700 dark:text-emerald-400'
                                                    : kpi.deltaTone === 'critical'
                                                      ? 'text-rose-700 dark:text-rose-400'
                                                      : 'text-amber-700 dark:text-amber-400')
                                            }
                                        >
                                            {kpi.delta}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Core Capabilities */}
                    <section
                        className="border-border border-t pt-12 pb-20"
                    >
                        <div className="mb-8 sm:mb-12 flex flex-col gap-1.5">
                            <span className="label-sm text-primary uppercase tracking-wider font-semibold">
                                Operational Workflows
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                What PulseCare Delivers for Nursing Leadership
                            </h2>
                            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
                                Purpose-built to eliminate cognitive fatigue, streamline shift handoffs, and give operations coordinators instantaneous clarity.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {FEATURES.map(({ icon: Icon, title, body }) => (
                                <Card key={title} className="border-border bg-card shadow-layer-1 rounded-lg border hover:border-primary/40 transition-colors">
                                    <CardContent className="p-5 sm:p-6">
                                        <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-md">
                                            <Icon className="size-5.5" />
                                        </div>
                                        <h3 className="mt-4 text-base font-bold text-foreground">
                                            {title}
                                        </h3>
                                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                                            {body}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Operational Banners */}
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Card className="border-critical-border bg-critical-surface rounded-lg border shadow-xs">
                                <CardContent className="flex items-start gap-4 p-5">
                                    <div className="bg-critical text-white flex size-10 shrink-0 items-center justify-center rounded-md mt-0.5">
                                        <ShieldAlert className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-critical">
                                            Surge &amp; Capacity Warnings
                                        </h3>
                                        <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">
                                            Automated surge thresholding at 90% bed occupancy with instant notifications across nursing supervisors.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-stable-border bg-stable-surface rounded-lg border shadow-xs">
                                <CardContent className="flex items-start gap-4 p-5">
                                    <div className="bg-stable text-white flex size-10 shrink-0 items-center justify-center rounded-md mt-0.5">
                                        <ShieldCheck className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-stable">
                                            Governance &amp; Audit Trail
                                        </h3>
                                        <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">
                                            Role-based permission controls, clinical audit flags for mortality and non-standard exits, and immutable records.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Final CTA Banner */}
                    <section className="pb-16 sm:pb-20">
                        <div className="bg-primary text-primary-foreground rounded-lg p-8 sm:p-12 text-center shadow-layer-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-radial-[circle_at_top_right] from-emerald-400/20 to-transparent pointer-events-none" />
                            <div className="relative z-10 max-w-xl mx-auto space-y-3">
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                    Command Your Nursing Units with Clarity
                                </h2>
                                <p className="text-primary-foreground/85 text-sm sm:text-base leading-relaxed">
                                    Sign in to open the live clinical dashboard, record daily stats, and review analytical flow reports.
                                </p>
                                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <Button
                                        asChild
                                        className="h-11 w-full sm:w-auto font-bold bg-white text-primary hover:bg-white/95 px-8 shadow-sm"
                                    >
                                        <Link href={auth.user ? dashboard() : login()}>
                                            {auth.user ? 'Access Dashboard' : 'Sign in to PulseCare'}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-border border-t bg-muted/30">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span className="bg-primary text-primary-foreground size-6 rounded flex items-center justify-center">
                                <Activity className="size-3.5 text-emerald-200" />
                            </span>
                            <span>PulseCare · Clinical Operations Engine</span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Designed for Hospital Nursing Operations · High-Contrast Clinical Workspace
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
