import { Form, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import recordStats from '@/routes/record-stats';

type MetricDefinition = { key: string; label: string };

type WardOption = {
    id: string;
    name: string;
};

type Props = {
    date: string;
    activeWards: WardOption[];
    metrics: MetricDefinition[];
    records: Record<string, Record<string, number>>;
};

type WardStatsForm = Record<string, string> & {
    ward_id: string;
    stat_date: string;
};

export default function RecordStatsIndex({
    date,
    activeWards,
    metrics,
    records,
}: Props) {
    const { can } = usePermissions();
    const [openWardId, setOpenWardId] = useState<string | null>(null);

    const totalInPoints = (values: Record<string, number>): number =>
        metrics.reduce((sum, metric) => sum + (values[metric.key] ?? 0), 0);

    const sumAcrossWards = (metricKey: string): number =>
        activeWards.reduce(
            (sum, ward) => sum + (records[ward.id]?.[metricKey] ?? 0),
            0,
        );

    const grandTotal = activeWards.reduce(
        (sum, ward) => sum + totalInPoints(records[ward.id] ?? {}),
        0,
    );

    const activeWardForModal = openWardId
        ? activeWards.find((ward) => ward.id === openWardId) ?? null
        : null;

    return (
        <>
            <Head title="Record Stats" />

            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Record Stats
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Daily ward movement by metric
                        </p>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs font-semibold tabular-nums rounded-md px-3 py-1.5">
                        {date}
                    </span>
                </div>
            </div>

            <div className="mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-48">Metric</TableHead>
                            {activeWards.map((ward) => (
                                <TableHead key={ward.id}>{ward.name}</TableHead>
                            ))}
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {metrics.map((metric) => (
                            <TableRow key={metric.key}>
                                <TableCell className="font-medium">
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
                                            {can('record_stats.update') ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenWardId(ward.id)
                                                    }
                                                    className="rounded px-1 py-0.5 tabular-nums transition-colors hover:bg-muted"
                                                >
                                                    {value}
                                                </button>
                                            ) : (
                                                <span className="tabular-nums">
                                                    {value}
                                                </span>
                                            )}
                                        </TableCell>
                                    );
                                })}
                                <TableCell className="font-semibold text-right tabular-nums">
                                    {sumAcrossWards(metric.key)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell className="font-semibold">
                                Total in PTS
                            </TableCell>
                            {activeWards.map((ward) => (
                                <TableCell
                                    key={ward.id}
                                    className="font-semibold text-right tabular-nums"
                                >
                                    {totalInPoints(records[ward.id] ?? {})}
                                </TableCell>
                            ))}
                            <TableCell className="font-bold text-right tabular-nums">
                                {grandTotal}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            <WardStatsModal
                ward={activeWardForModal}
                metrics={metrics}
                initialValues={
                    activeWardForModal
                        ? records[activeWardForModal.id] ?? {}
                        : {}
                }
                open={activeWardForModal !== null}
                onClose={() => setOpenWardId(null)}
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
    const initialForm = ward
        ? {
            ward_id: ward.id,
            stat_date: new Date().toISOString().split('T')[0],
            ...metrics.reduce<Record<string, string>>(
                (acc, metric) => {
                    acc[metric.key] = String(initialValues[metric.key] ?? 0);
                    return acc;
                },
                {} as Record<string, string>,
            ),
        }
        : null;

    const { data, setData, post, processing, errors, reset } =
        useForm<WardStatsForm>(initialForm ?? {});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(recordStats.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset({ ward_id: '', stat_date: '' });
                onClose();
            },
        });
    };

    if (!ward) return null;

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{ward.name}</DialogTitle>
                    <DialogDescription>
                        Record today&rsquo;s movement figures for this ward.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {metrics.map((metric) => (
                            <div key={metric.key} className="grid gap-2">
                                <Label htmlFor={`metric-${metric.key}`}>
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
