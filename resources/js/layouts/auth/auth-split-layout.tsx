import { Link, usePage } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col justify-between p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#0f172a]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.25),transparent_55%)]" />

                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-2 text-lg font-semibold text-white"
                >
                    <span className="flex size-9 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/25">
                        <Activity className="size-5" />
                    </span>
                    <span className="tracking-tight">{name}</span>
                </Link>

                <div className="relative z-20 max-w-md">
                    <h2 className="text-xl font-medium leading-snug">
                        Calm situational awareness for your nursing unit.
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">
                        Collect, filter, and visualize your unit's data in real
                        time — built for 12-hour shifts under hospital
                        lighting.
                    </p>
                </div>

                <div className="relative z-20 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-md bg-white/15 font-bold text-white ring-1 ring-white/25 tabular-nums">
                        6:00
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                            Live census
                        </p>
                        <p className="text-sm text-white">
                            42 / 48 beds · 85% surge
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <AppLogoIcon className="size-5 fill-current" />
                        </span>
                        <span className="font-medium">{name}</span>
                    </Link>

                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
