import { Link, usePage } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid min-h-svh flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6 lg:max-w-none lg:grid-cols-2 lg:p-0">
            {/* Left Hero Panel (Desktop) */}
            <div className="relative hidden h-full flex-col justify-between p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f766e] to-[#0f172a]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(94,234,212,0.18),transparent_55%)]" />

                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-95"
                >
                    <span className="flex size-10 items-center justify-center rounded-md bg-white/20 ring-1 ring-white/30 backdrop-blur-xs">
                        <Activity className="size-5.5 text-emerald-200" />
                    </span>
                    <span>{name}</span>
                </Link>

                <div className="relative z-20 max-w-md space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-200 uppercase">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                        Clinical Operations Engine
                    </div>
                    <h2 className="text-2xl font-bold leading-tight text-white">
                        Calm situational awareness for your nursing unit.
                    </h2>
                    <p className="text-sm leading-relaxed text-white/95">
                        Collect, filter, and visualize your unit's data in real
                        time — built for 12-hour shifts under hospital lighting.
                    </p>
                </div>

                <div className="relative z-20 flex items-center gap-3.5 rounded-lg border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-white/20 font-mono text-base font-bold text-white tabular-nums ring-1 ring-white/30">
                        06:00
                    </div>
                    <div>
                        <p className="text-xs font-bold tracking-wider text-emerald-200 uppercase">
                            Live census
                        </p>
                        <p className="text-sm font-semibold text-white">
                            42 / 48 beds · 85% surge
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Form Panel with Contrasting Card Header */}
            <div className="flex w-full items-center justify-center p-2 sm:p-6 lg:p-12">
                <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-layer-2">
                    {/* Contrasting Header Band */}
                    <div className="border-b border-border border-t-4 border-t-primary bg-muted/60 px-6 py-6 sm:px-8 dark:bg-slate-800/60">
                        {/* Mobile Brand Link */}
                        <Link
                            href={home()}
                            className="mb-4 flex items-center justify-center gap-2 text-base font-bold tracking-tight text-foreground lg:hidden"
                        >
                            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-layer-1">
                                <Activity className="size-5" />
                            </span>
                            <span>{name}</span>
                        </Link>

                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-muted-foreground mt-2 text-sm text-balance">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
