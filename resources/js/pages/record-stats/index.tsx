import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FileText, Pencil, Stethoscope, Users } from 'lucide-react';
import InputError from '@/components/input-error';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    storeAttendance,
    storeMetricValue,
} from '@/actions/App/Http/Controllers/DashboardController';
import recordStats from '@/routes/record-stats';
import statsReport from '@/routes/stats-report';

type MetricDefinition = { key: string; label: string };

type WardOption = {
    id: string;
    name: string;
};

type ClinicOption = {
    id: string;
    name: string;
    outpatients: number;
};

type OtherMetricOption = {
    id: string;
    name: string;
    status: string;
    value: number;
};

type Props = {
    date: string;
    weekday: string;
    activeWards: WardOption[];
    metrics: MetricDefinition[];
    clinics: ClinicOption[];
    otherMetrics: OtherMetricOption[];
    totalPatients: number;
    records: Record<string, Record<string, number>>;
};

type WardStatsForm = Record<string, string> & {
    ward_id: string;
    stat_date: string;
};

type AttendanceForm = {
    stat_date: string;
    clinics: { clinic_id: string; outpatients: string }[];
};

type MetricValueForm = {
    stat_date: string;
    metrics: { other_metric_id: string; value: string }[];
};

export default function RecordStatsIndex({
    date,
    weekday,
    activeWards,
    metrics,
    clinics,
    otherMetrics,
    totalPatients,
    records,
}: Props) {
    const { can } = usePermissions();
    const [openWardId, setOpenWardId] = useState<string | null>(null);
    const [attendanceOpen, setAttendanceOpen] = useState(false);
    const [metricsOpen, setMetricsOpen] = useState(false);

    const canEdit = can('record_stats.update');

    const outpatients = clinics.reduce(
        (sum, clinic) => sum + clinic.outpatients,
        0,
    );

    const sumAcrossWards = (metricKey: string): number =>
        activeWards.reduce(
            (sum, ward) => sum + (records[ward.id]?.[metricKey] ?? 0),
            0,
        );

    const activeWardForModal = openWardId
        ? (activeWards.find((ward) => ward.id === openWardId) ?? null)
        : null;

    return (
        <>
            <Head title="Record Stats" />

            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary label-sm rounded-md px-2.5 py-1 uppercase tracking-wider font-semibold">
                                {weekday} · {date}
                            </span>
                            <span className="text-muted-foreground body-sm flex items-center gap-1.5">
                                <span className="bg-stable size-2 rounded-full" />
                                Shift Data Entry
                            </span>
                        </div>
                        <h1 className="headline-lg text-foreground mt-2 font-bold">
                            Record Stats
                        </h1>
                        <p className="text-muted-foreground body-sm mt-0.5">
                            Daily ward movement matrix, outpatient clinic attendance, and other tracked metrics.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold">
                            <Link href={statsReport.index.url()}>
                                <FileText className="size-3.5" />
                                Analytics Report
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Ward Movement Matrix Table */}
            <div className="border-border bg-card shadow-layer-1 mt-6 overflow-hidden rounded-xl border">
                <div className="border-border/70 flex items-center justify-between border-b bg-muted/50 px-4 py-3">
                    <div>
                        <p className="label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Movement Matrix
                        </p>
                        <h2 className="headline-sm mt-0.5 font-semibold text-foreground">
                            Ward Patient Movements
                        </h2>
                    </div>
                    <span className="body-sm text-xs text-muted-foreground">
                        {canEdit ? 'Select any value to edit ward figures' : 'View-only mode'}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/70 hover:bg-muted/70 border-b border-border">
                                <TableHead className="label-sm w-48 font-bold text-foreground uppercase tracking-wider pl-4">
                                    Metric
                                </TableHead>
                                {activeWards.map((ward) => (
                                    <TableHead key={ward.id} className="label-sm font-bold text-foreground text-right uppercase tracking-wider px-3">
                                        {ward.name}
                                    </TableHead>
                                ))}
                                <TableHead className="label-sm text-right font-bold text-foreground uppercase tracking-wider bg-muted/90 pr-4">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.map((metric) => (
                                <TableRow key={metric.key} className="hover:bg-muted/30 transition-colors border-b border-border/70">
                                    <TableCell className="body-md font-semibold text-foreground pl-4 py-2.5">
                                        {metric.label}
                                    </TableCell>
                                    {activeWards.map((ward) => {
                                        const value =
                                            records[ward.id]?.[metric.key] ?? 0;

                                        return (
                                            <TableCell
                                                key={ward.id}
                                                className="text-right px-3 py-1.5"
                                            >
                                                {canEdit ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="tabular-dense h-7 px-2.5 py-0.5 hover:bg-primary/10 hover:text-primary font-medium transition-colors border border-transparent hover:border-primary/20 rounded font-semibold text-foreground"
                                                        onClick={() =>
                                                            setOpenWardId(ward.id)
                                                        }
                                                    >
                                                        {value}
                                                    </Button>
                                                ) : (
                                                    <span className="tabular-dense text-foreground font-medium px-2.5 py-0.5">
                                                        {value}
                                                    </span>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="tabular-dense text-right font-bold text-foreground bg-muted/40 pr-4 py-2.5">
                                        {sumAcrossWards(metric.key)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Daily Summary & Outpatient Modules */}
            <section className="mt-8">
                <div className="mb-4">
                    <p className="label-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        Daily Rollup
                    </p>
                    <h2 className="headline-sm text-foreground mt-0.5 font-bold">
                        Daily Summary &amp; Outpatient Attendance
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border p-5 flex flex-col justify-between">
                        <div>
                            <p className="label-sm text-muted-foreground uppercase tracking-wider font-semibold">
                                Shift Day
                            </p>
                            <div className="text-foreground tabular-kpi text-3xl font-bold mt-2">
                                {weekday}
                            </div>
                        </div>
                        <p className="text-muted-foreground body-sm text-xs mt-2 pt-2 border-t border-border/70 tabular-nums font-medium">
                            {date}
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={!canEdit}
                        onClick={() => setAttendanceOpen(true)}
                        className="border-border bg-card shadow-layer-1 hover:border-primary/40 hover:bg-muted/30 rounded-lg border p-5 h-auto w-full text-left transition-all disabled:cursor-not-allowed flex flex-col justify-between items-stretch"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="label-sm text-muted-foreground uppercase tracking-wider font-semibold">
                                    Outpatient Attendance
                                </p>
                                {canEdit && (
                                    <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                        <Pencil className="size-3.5" />
                                    </span>
                                )}
                            </div>
                            <div className="text-foreground tabular-kpi text-3xl font-bold mt-2">
                                {outpatients}
                            </div>
                        </div>
                        <p className="text-muted-foreground body-sm text-xs mt-2 pt-2 border-t border-border/70 font-medium">
                            Across {clinics.length} operating clinic
                            {clinics.length === 1 ? '' : 's'} today
                        </p>
                    </Button>

                    <div className="border-border bg-card shadow-layer-1 rounded-lg border p-5 flex flex-col justify-between">
                        <div>
                            <p className="label-sm text-muted-foreground uppercase tracking-wider font-semibold">
                                Total Clinic Volume
                            </p>
                            <div className="text-primary tabular-kpi text-3xl font-bold mt-2">
                                {totalPatients}
                            </div>
                        </div>
                        <p className="text-muted-foreground body-sm text-xs mt-2 pt-2 border-t border-border/70 font-medium">
                            Sum of all clinic patient attendances
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_1.5fr]">
                    {/* Operating Clinics Grid */}
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border">
                        <div className="border-border/70 flex items-center justify-between border-b px-4 py-3.5">
                            <div>
                                <p className="label-sm text-muted-foreground uppercase tracking-wider font-semibold">
                                    Outpatient Clinics
                                </p>
                                <h3 className="headline-sm text-foreground mt-0.5 font-bold">
                                    Operating {weekday}
                                </h3>
                            </div>
                            <Users className="text-muted-foreground size-5" />
                        </div>

                        {clinics.length === 0 ? (
                            <div className="text-muted-foreground body-sm px-4 py-10 text-center">
                                No clinics operate on {weekday}.
                            </div>
                        ) : (
                            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                {clinics.map((clinic) => (
                                    <div
                                        key={clinic.id}
                                        className="border-border/80 bg-background/60 hover:bg-muted/20 shadow-xs rounded-lg border p-4 flex flex-col justify-between transition-colors"
                                    >
                                        <p className="body-sm font-semibold text-foreground line-clamp-1">
                                            {clinic.name}
                                        </p>
                                        <div className="text-foreground mt-3 flex items-baseline gap-1.5">
                                            <span className="tabular-kpi text-2xl font-bold text-foreground">
                                                {clinic.outpatients}
                                            </span>
                                            <span className="text-muted-foreground text-xs font-medium">
                                                patients
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Other Metrics Panel */}
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border flex flex-col justify-between">
                        <div>
                            <div className="border-border/70 flex items-center justify-between border-b px-4 py-3.5">
                                <div>
                                    <p className="label-sm text-muted-foreground uppercase tracking-wider font-semibold">
                                        Custom Metrics
                                    </p>
                                    <h3 className="headline-sm text-foreground mt-0.5 font-bold">
                                        Daily Hospital Metrics
                                    </h3>
                                </div>
                                <Stethoscope className="text-muted-foreground size-5" />
                            </div>

                            <div className="p-4">
                                {otherMetrics.length === 0 ? (
                                    <div className="text-muted-foreground body-sm py-8 text-center">
                                        No other metrics configured.
                                    </div>
                                ) : (
                                    <div className="border-border rounded-lg border divide-border/70 divide-y overflow-hidden">
                                        {otherMetrics.map((metric) => (
                                            <div
                                                key={metric.id}
                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors"
                                            >
                                                <span className="body-sm font-medium text-foreground">
                                                    {metric.name}
                                                </span>
                                                <span className="tabular-dense text-foreground font-bold text-sm bg-muted/60 px-2.5 py-0.5 rounded">
                                                    {metric.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {canEdit && (
                            <div className="p-4 pt-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMetricsOpen(true)}
                                    className="w-full gap-1.5 font-semibold text-primary hover:text-primary"
                                >
                                    <Pencil className="size-3.5" />
                                    Edit Metric Values
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modals with Clinical Card Styling & Teal Header Accents */}
            <WardStatsModal
                ward={activeWardForModal}
                metrics={metrics}
                initialValues={
                    activeWardForModal
                        ? (records[activeWardForModal.id] ?? {})
                        : {}
                }
                open={activeWardForModal !== null}
                onClose={() => setOpenWardId(null)}
            />

            <AttendanceModal
                open={attendanceOpen}
                date={date}
                clinics={clinics}
                canEdit={canEdit}
                onClose={() => setAttendanceOpen(false)}
            />

            <MetricValueModal
                open={metricsOpen}
                date={date}
                otherMetrics={otherMetrics}
                canEdit={canEdit}
                onClose={() => setMetricsOpen(false)}
            />
        </>
    );
}

function WardStatsModal({
    ward,
    metrics,
    initialValues,
    open,
    onClose,
}: {
    ward: WardOption | null;
    metrics: MetricDefinition[];
    initialValues: Record<string, number>;
    open: boolean;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors, reset } =
        useForm<WardStatsForm>({
            ward_id: '',
            stat_date: '',
        });

    useEffect(() => {
        if (open && ward) {
            setData({
                ward_id: ward.id,
                stat_date: new Date().toISOString().split('T')[0],
                ...metrics.reduce<Record<string, string>>(
                    (acc, metric) => {
                        acc[metric.key] = String(
                            initialValues[metric.key] ?? 0,
                        );
                        return acc;
                    },
                    {} as Record<string, string>,
                ),
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, ward?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(recordStats.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!ward) return null;

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-border bg-card shadow-layer-3">
                <div className="border-b border-border border-t-4 border-t-primary bg-muted/60 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="headline-md font-bold text-foreground">
                            {ward.name}
                        </DialogTitle>
                        <DialogDescription className="body-sm text-muted-foreground mt-1">
                            Record today&rsquo;s shift movement figures for this ward.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 max-h-96 overflow-y-auto pr-1">
                        {metrics.map((metric) => (
                            <div key={metric.key} className="grid gap-1.5">
                                <Label
                                    htmlFor={`metric-${metric.key}`}
                                    className="label-sm font-semibold text-muted-foreground uppercase tracking-wider"
                                >
                                    {metric.label}
                                </Label>
                                <Input
                                    id={`metric-${metric.key}`}
                                    name={metric.key}
                                    type="number"
                                    min={0}
                                    value={data[metric.key] ?? '0'}
                                    onChange={(e) =>
                                        setData(metric.key, e.target.value)
                                    }
                                    aria-invalid={Boolean(errors[metric.key])}
                                    className="font-medium h-9"
                                />
                                <InputError message={errors[metric.key]} />
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="pt-2 border-t border-border">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing} className="font-semibold shadow-xs">
                            Save Movements
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

RecordStatsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Record Stats',
            href: recordStats.index.url(),
        },
    ],
};

function AttendanceModal({
    open,
    date,
    clinics,
    canEdit,
    onClose,
}: {
    open: boolean;
    date: string;
    clinics: ClinicOption[];
    canEdit: boolean;
    onClose: () => void;
}) {
    const { data, setData, post, processing, reset } = useForm<AttendanceForm>({
        stat_date: '',
        clinics: [],
    });

    useEffect(() => {
        if (open) {
            setData({
                stat_date: new Date().toISOString().split('T')[0],
                clinics: clinics.map((clinic) => ({
                    clinic_id: clinic.id,
                    outpatients: String(clinic.outpatients ?? 0),
                })),
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const setClinicValue = (index: number, value: string) => {
        const next = [...data.clinics];
        next[index] = { ...next[index], outpatients: value };
        setData('clinics', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeAttendance.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-border bg-card shadow-layer-3">
                <div className="border-b border-border border-t-4 border-t-primary bg-muted/60 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="headline-md font-bold text-foreground">
                            Outpatient Attendance
                        </DialogTitle>
                        <DialogDescription className="body-sm text-muted-foreground mt-1">
                            Record outpatient attendance for clinics operating on {date}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    {clinics.length === 0 ? (
                        <p className="text-muted-foreground body-sm py-4 text-center">
                            No clinics operate today, so there is nothing to record.
                        </p>
                    ) : (
                        <div className="grid gap-4 max-h-96 overflow-y-auto pr-1">
                            {data.clinics.map((clinic, index) => (
                                <div key={index} className="grid gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor={`attendance-${index}`}
                                            className="label-sm font-semibold text-muted-foreground uppercase tracking-wider"
                                        >
                                            {clinics[index]?.name ??
                                                `Clinic ${index + 1}`}
                                        </Label>
                                        <span className="text-muted-foreground body-sm text-xs tabular-nums font-semibold">
                                            {clinic.outpatients} patients
                                        </span>
                                    </div>
                                    <Input
                                        id={`attendance-${index}`}
                                        name={`clinics.${index}.outpatients`}
                                        type="number"
                                        min={0}
                                        value={clinic.outpatients}
                                        onChange={(e) =>
                                            setClinicValue(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                        className="font-medium h-9"
                                    />
                                    <InputError />
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter className="pt-2 border-t border-border">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={
                                !canEdit || processing || clinics.length === 0
                            }
                            className="font-semibold shadow-xs"
                        >
                            Save Attendance
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function MetricValueModal({
    open,
    date,
    otherMetrics,
    canEdit,
    onClose,
}: {
    open: boolean;
    date: string;
    otherMetrics: OtherMetricOption[];
    canEdit: boolean;
    onClose: () => void;
}) {
    const { data, setData, post, processing, reset } = useForm<MetricValueForm>(
        {
            stat_date: '',
            metrics: [],
        },
    );

    useEffect(() => {
        if (open) {
            setData({
                stat_date: new Date().toISOString().split('T')[0],
                metrics: otherMetrics.map((metric) => ({
                    other_metric_id: metric.id,
                    value: String(metric.value ?? 0),
                })),
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const setMetricValue = (index: number, value: string) => {
        const next = [...data.metrics];
        next[index] = { ...next[index], value };
        setData('metrics', next);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeMetricValue.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-border bg-card shadow-layer-3">
                <div className="border-b border-border border-t-4 border-t-primary bg-muted/60 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="headline-md font-bold text-foreground">
                            Other Metric Values
                        </DialogTitle>
                        <DialogDescription className="body-sm text-muted-foreground mt-1">
                            Record today&rsquo;s hospital-wide metric values on {date}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    {otherMetrics.length === 0 ? (
                        <p className="text-muted-foreground body-sm py-4 text-center">
                            No other metrics are configured yet.
                        </p>
                    ) : (
                        <div className="grid gap-4 max-h-96 overflow-y-auto pr-1">
                            {data.metrics.map((metric, index) => (
                                <div key={index} className="grid gap-1.5">
                                    <Label
                                        htmlFor={`metric-value-${index}`}
                                        className="label-sm font-semibold text-muted-foreground uppercase tracking-wider"
                                    >
                                        {otherMetrics[index]?.name ??
                                            `Metric ${index + 1}`}
                                    </Label>
                                    <Input
                                        id={`metric-value-${index}`}
                                        name={`metrics.${index}.value`}
                                        type="number"
                                        min={0}
                                        value={metric.value}
                                        onChange={(e) =>
                                            setMetricValue(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                        className="font-medium h-9"
                                    />
                                    <InputError />
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter className="pt-2 border-t border-border">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={
                                !canEdit ||
                                processing ||
                                otherMetrics.length === 0
                            }
                            className="font-semibold shadow-xs"
                        >
                            Save Metric Values
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
