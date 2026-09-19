import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Pencil, Users } from 'lucide-react';
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
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="headline-md text-foreground">
                            Record Stats
                        </h1>
                        <p className="text-muted-foreground body-sm">
                            Daily ward movement by metric
                        </p>
                    </div>
                    <span className="bg-primary/10 text-primary label-sm rounded-md px-3 py-1.5 tabular-nums">
                        {date}
                    </span>
                </div>
            </div>

            <div className="mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="label-sm w-48">
                                Metric
                            </TableHead>
                            {activeWards.map((ward) => (
                                <TableHead key={ward.id} className="label-sm">
                                    {ward.name}
                                </TableHead>
                            ))}
                            <TableHead className="label-sm text-right">
                                Total
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {metrics.map((metric) => (
                            <TableRow key={metric.key}>
                                <TableCell className="body-md font-medium">
                                    {metric.label}
                                </TableCell>
                                {activeWards.map((ward) => {
                                    const value =
                                        records[ward.id]?.[metric.key] ?? 0;

                                    return (
                                        <TableCell
                                            key={ward.id}
                                            className="text-right"
                                        >
                                            {canEdit ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="tabular-dense h-auto px-2 py-1"
                                                    onClick={() =>
                                                        setOpenWardId(ward.id)
                                                    }
                                                >
                                                    {value}
                                                </Button>
                                            ) : (
                                                <span className="tabular-dense text-foreground">
                                                    {value}
                                                </span>
                                            )}
                                        </TableCell>
                                    );
                                })}
                                <TableCell className="tabular-dense text-right font-semibold">
                                    {sumAcrossWards(metric.key)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <section className="mt-6">
                <div className="mb-4">
                    <h2 className="headline-sm text-foreground">
                        Daily summary
                    </h2>
                    <p className="text-muted-foreground body-sm">
                        Outpatient attendance and other metrics for the day
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4">
                        <p className="label-md text-muted-foreground">Day</p>
                        <div className="text-foreground tabular-kpi mt-2">
                            {weekday}
                        </div>
                        <p className="text-muted-foreground body-sm mt-1 tabular-nums">
                            {date}
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={!canEdit}
                        onClick={() => setAttendanceOpen(true)}
                        className="disabled:bg-muted h-auto w-full p-4 text-left transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:shadow-none"
                    >
                        <div className="flex items-center justify-between">
                            <p className="label-md text-muted-foreground">
                                Outpatients
                            </p>
                            {canEdit && (
                                <Pencil className="text-muted-foreground size-4" />
                            )}
                        </div>
                        <div className="text-foreground tabular-kpi mt-2">
                            {outpatients}
                        </div>
                        <p className="text-muted-foreground body-sm mt-1">
                            Across {clinics.length} clinic
                            {clinics.length === 1 ? '' : 's'}
                        </p>
                    </Button>

                    <div className="border-border bg-card shadow-layer-1 rounded-lg border p-4">
                        <p className="label-md text-muted-foreground">
                            Total patients
                        </p>
                        <div className="text-primary tabular-kpi mt-2">
                            {totalPatients}
                        </div>
                        <p className="text-muted-foreground body-sm mt-1">
                            Sum of clinic attendance
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_1fr]">
                    <div className="border-border bg-card shadow-layer-1 rounded-lg border">
                        <div className="border-border/70 flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <p className="label-sm text-muted-foreground">
                                    Clinics
                                </p>
                                <h3 className="headline-sm text-foreground mt-1">
                                    Operating {weekday.toLowerCase()}
                                </h3>
                            </div>
                            <Users className="text-muted-foreground size-5" />
                        </div>

                        {clinics.length === 0 ? (
                            <div className="text-muted-foreground body-sm px-4 py-10 text-center">
                                No clinics operate on {weekday}.
                            </div>
                        ) : (
                            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                {clinics.map((clinic) => (
                                    <div
                                        key={clinic.id}
                                        className="border-border shadow-layer-1 rounded-lg border p-4"
                                    >
                                        <p className="label-md text-muted-foreground">
                                            {clinic.name}
                                        </p>
                                        <div className="text-foreground mt-3 flex items-baseline gap-1.5">
                                            <span className="tabular-kpi">
                                                {clinic.outpatients}
                                            </span>
                                            <span className="text-muted-foreground body-sm">
                                                patients
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-border bg-card shadow-layer-1 rounded-lg border">
                        <div className="border-border/70 flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <p className="label-sm text-muted-foreground">
                                    Other metrics
                                </p>
                                <h3 className="headline-sm text-foreground mt-1">
                                    Today&rsquo;s values
                                </h3>
                            </div>
                            {canEdit && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMetricsOpen(true)}
                                    className="text-primary"
                                >
                                    Edit
                                </Button>
                            )}
                        </div>

                        <div className="p-4">
                            {otherMetrics.length === 0 ? (
                                <div className="text-muted-foreground body-sm py-8 text-center">
                                    No other metrics configured.
                                </div>
                            ) : (
                                <div className="border-border rounded-lg border">
                                    <div className="divide-border/70 divide-y">
                                        {otherMetrics.map((metric) => (
                                            <div
                                                key={metric.id}
                                                className="flex items-center justify-between px-4 py-3"
                                            >
                                                <span className="body-md font-medium">
                                                    {metric.name}
                                                </span>
                                                <span className="tabular-dense text-foreground font-semibold">
                                                    {metric.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="headline-md">
                        {ward.name}
                    </DialogTitle>
                    <DialogDescription className="body-sm">
                        Record today&rsquo;s movement figures for this ward.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {metrics.map((metric) => (
                            <div key={metric.key} className="grid gap-2">
                                <Label
                                    htmlFor={`metric-${metric.key}`}
                                    className="label-sm"
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
                                />
                                <InputError message={errors[metric.key]} />
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            Save
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="headline-md">
                        Outpatient attendance
                    </DialogTitle>
                    <DialogDescription className="body-sm">
                        Record today&rsquo;s attendance for each clinic
                        operating on {date}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {clinics.length === 0 ? (
                        <p className="text-muted-foreground body-sm">
                            No clinics operate today, so there is nothing to
                            record.
                        </p>
                    ) : (
                        <div className="grid gap-4">
                            {data.clinics.map((clinic, index) => (
                                <div key={index} className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor={`attendance-${index}`}
                                            className="label-sm"
                                        >
                                            {clinics[index]?.name ??
                                                `Clinic ${index + 1}`}
                                        </Label>
                                        <span className="text-muted-foreground body-sm tabular-nums">
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
                                    />
                                    <InputError />
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={
                                !canEdit || processing || clinics.length === 0
                            }
                        >
                            Save
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="headline-md">
                        Other metric values
                    </DialogTitle>
                    <DialogDescription className="body-sm">
                        Record today&rsquo;s value for each metric on {date}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {otherMetrics.length === 0 ? (
                        <p className="text-muted-foreground body-sm">
                            No other metrics are configured yet.
                        </p>
                    ) : (
                        <div className="grid gap-4">
                            {data.metrics.map((metric, index) => (
                                <div key={index} className="grid gap-2">
                                    <Label
                                        htmlFor={`metric-value-${index}`}
                                        className="label-sm"
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
                                    />
                                    <InputError />
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
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
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
