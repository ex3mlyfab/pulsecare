import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Pencil, Printer } from 'lucide-react';
import NursingDailyReportController from '@/actions/App/Http/Controllers/Admin/NursingDailyReportController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RichTextViewer } from '@/components/ui/rich-text-viewer';
import { usePermissions } from '@/hooks/use-permissions';

type ReportDetail = {
    id: string;
    patient_name: string;
    hospital_number: string;
    report: string;
    shift: 'Morning' | 'Afternoon' | 'Evening';
    creation_date: string;
    created_by: string;
    ward: { id: string; name: string };
    reported_by: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
};

const shiftColor: Record<string, string> = {
    Morning: 'text-amber-700 bg-amber-50 border-amber-200',
    Afternoon: 'text-sky-700 bg-sky-50 border-sky-200',
    Evening: 'text-indigo-700 bg-indigo-50 border-indigo-200',
};

const shiftBadgeVariant: Record<
    string,
    'default' | 'secondary' | 'outline'
> = {
    Morning: 'default',
    Afternoon: 'secondary',
    Evening: 'outline',
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(isoStr: string) {
    return new Date(isoStr).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function NursingDailyReportShow({
    report,
}: {
    report: ReportDetail;
}) {
    const { can } = usePermissions();

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Nursing Daily Reports',
                href: NursingDailyReportController.index.url(),
            },
            {
                title: report.patient_name,
                href: NursingDailyReportController.show.url({
                    nursing_daily_report: report.id,
                }),
            },
        ],
    });

    return (
        <>
            <Head title={`Report — ${report.patient_name}`} />

            {/* Screen-only heading and actions */}
            <div className="print:hidden">
                <Heading
                    title="Nursing Daily Report"
                    description={`Detailed report for ${report.patient_name}`}
                />

                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <Button
                        variant="default"
                        className="gap-2 font-semibold shadow-xs"
                        onClick={() => window.print()}
                    >
                        <Printer className="size-4" />
                        Print / Export PDF
                    </Button>
                    {can('nursing_daily_reports.update') && (
                        <Link
                            href={NursingDailyReportController.edit.url({
                                nursing_daily_report: report.id,
                            })}
                        >
                            <Button variant="outline" className="gap-2">
                                <Pencil className="size-4" />
                                Edit Report
                            </Button>
                        </Link>
                    )}
                    <Link href={NursingDailyReportController.index.url()}>
                        <Button variant="ghost">← Back to Reports</Button>
                    </Link>
                </div>
            </div>

            {/* === PRINTABLE REPORT CARD === */}
            <div
                id="printable-report"
                className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-white shadow-layer-1 print:mx-0 print:max-w-none print:rounded-none print:border-0 print:shadow-none"
            >
                {/* Report Header — Hospital Branding */}
                <div className="border-b-4 border-primary bg-primary px-8 py-6 text-primary-foreground print:border-b-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {" "}
                            </h1>
                            <p className="mt-0.5 text-sm opacity-80">
                                Nursing Daily Report
                            </p>
                        </div>
                        <div className="text-right text-sm opacity-80">
                            <p>Document ID</p>
                            <p className="font-mono text-xs">{report.id}</p>
                        </div>
                    </div>
                </div>

                {/* Shift Banner */}
                <div
                    className={`flex items-center justify-between border-b px-8 py-3 text-sm font-semibold ${shiftColor[report.shift] ?? 'bg-muted text-muted-foreground border-border'}`}
                >
                    <span>
                        {report.shift} Shift &mdash;{' '}
                        {formatDate(report.creation_date)}
                    </span>
                    <Badge variant={shiftBadgeVariant[report.shift] ?? 'outline'}>
                        {report.shift}
                    </Badge>
                </div>

                {/* Patient Information */}
                <div className="border-b border-border bg-muted/30 px-8 py-5">
                    <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Patient Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <InfoBlock label="Patient Name" value={report.patient_name} />
                        <InfoBlock
                            label="Hospital Number"
                            value={report.hospital_number}
                            mono
                        />
                        <InfoBlock label="Ward" value={report.ward.name} />
                    </div>
                </div>

                {/* Report Body */}
                <div className="px-8 py-6">
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Nursing Report
                    </h2>
                    <div className="min-h-[120px] rounded-lg border border-border bg-muted/10 p-5">
                        <RichTextViewer
                            value={report.report}
                            empty="No clinical report recorded."
                        />
                    </div>
                </div>

                {/* Administrative Information */}
                <div className="border-t border-border bg-muted/30 px-8 py-5">
                    <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Administrative Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <InfoBlock
                            label="Created By"
                            value={report.created_by}
                        />
                        <InfoBlock
                            label="Reported By"
                            value={report.reported_by?.name ?? '—'}
                        />
                        <InfoBlock
                            label="Creation Date"
                            value={formatDate(report.creation_date)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-8 py-4 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                        <span>
                            Record created:{' '}
                            {formatDateTime(report.created_at)}
                        </span>
                        <span>
                            Last updated:{' '}
                            {formatDateTime(report.updated_at)}
                        </span>
                    </div>
                    <p className="mt-2 text-center opacity-60 print:block hidden">
                        This document is confidential and intended solely for
                        authorised clinical personnel. Printed from PulseCare
                        on {new Date().toLocaleDateString('en-GB')}.
                    </p>
                </div>
            </div>

            {/* Global print styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 12mm 15mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Hide sidebar, header, breadcrumbs, toaster */
                    aside, header, nav, [data-sidebar], [data-breadcrumb], [data-sonner-toaster] {
                        display: none !important;
                    }
                    /* Full-width main content */
                    main, [data-slot="app-content"] {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </>
    );
}

function InfoBlock({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </span>
            <span
                className={`text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}
            >
                {value}
            </span>
        </div>
    );
}
