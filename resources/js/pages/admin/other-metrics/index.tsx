import { Form, Head, Link, useForm } from '@inertiajs/react';
import { Activity, CheckCircle2, Pencil, Search, Trash2 } from 'lucide-react';
import OtherMetricController from '@/actions/App/Http/Controllers/Admin/OtherMetricController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { usePermissions } from '@/hooks/use-permissions';
import { Pagination, type PaginationMeta } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type OtherMetric = {
    id: string;
    name: string;
    status: string;
    created_at: string;
};

type Filters = {
    search: string;
    status: string;
    per_page: number;
};

export default function OtherMetricsIndex({
    otherMetrics,
    filters,
    pagination,
}: {
    otherMetrics: OtherMetric[];
    filters: Filters;
    pagination: PaginationMeta;
}) {
    const { data, setData, get, processing } = useForm<Filters>(filters);
    const { can } = usePermissions();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(OtherMetricController.index.url(), {
            preserveState: true,
            replace: true,
            only: ['otherMetrics', 'filters', 'pagination'],
        });
    };

    const resolvePageUrl = (page: number) =>
        OtherMetricController.index.url({ query: { ...data, page } });

    return (
        <>
            <Head title="Other Metrics" />
            <Heading
                title="Other Metrics"
                description="Manage other clinical metrics and their status"
            />

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <MetricSummary
                    label="Total metrics"
                    value={pagination.total}
                    icon={Activity}
                    tone="primary"
                />
                <MetricSummary
                    label="Active"
                    value={
                        otherMetrics.filter(
                            (metric) => metric.status === 'Active',
                        ).length
                    }
                    icon={CheckCircle2}
                    tone="stable"
                />
                <MetricSummary
                    label="Showing"
                    value={otherMetrics.length}
                    icon={Search}
                    tone="secondary"
                />
            </div>

            <div className="border-border bg-muted/50 mb-6 flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <form
                    onSubmit={submitFilters}
                    className="flex w-full flex-wrap items-center gap-3 sm:max-w-xl"
                >
                    <div className="relative min-w-48 flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                        <Input
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            placeholder="Search by name"
                            className="pl-8"
                            aria-label="Search other metrics"
                        />
                    </div>
                    <Select
                        value={data.status || 'all'}
                        onValueChange={(value) =>
                            setData('status', value === 'all' ? '' : value)
                        }
                        disabled={processing}
                    >
                        <SelectTrigger
                            className="w-40"
                            aria-label="Filter by status"
                        >
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        disabled={processing}
                    >
                        Filter
                    </Button>
                </form>

                <div className="ml-auto">
                    {can('other_metrics.create') && (
                        <Link href={OtherMetricController.create.url()}>
                            <Button variant="default">New metric</Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Metric</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {otherMetrics.map((otherMetric) => (
                            <TableRow key={otherMetric.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {otherMetric.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Created{' '}
                                            {new Date(
                                                otherMetric.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={
                                            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ' +
                                            (otherMetric.status === 'Active'
                                                ? 'border-stable-border bg-stable-surface text-stable'
                                                : 'border-border bg-muted text-muted-foreground')
                                        }
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${otherMetric.status === 'Active' ? 'bg-stable' : 'bg-muted-foreground'}`}
                                        />
                                        {otherMetric.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {can('other_metrics.update') && (
                                            <Link
                                                href={OtherMetricController.edit.url(
                                                    {
                                                        other_metric:
                                                            otherMetric.id,
                                                    },
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1"
                                                >
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        )}
                                        {can('other_metrics.delete') && (
                                            <OtherMetricDeleteDialog
                                                otherMetricId={otherMetric.id}
                                                otherMetricLabel={
                                                    otherMetric.name
                                                }
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {otherMetrics.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-muted-foreground py-8 text-center text-sm"
                                >
                                    No other metrics found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Pagination
                    meta={pagination}
                    resolveUrl={(page) => resolvePageUrl(page)}
                />
            </div>
        </>
    );
}

function MetricSummary({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    icon: typeof Activity;
    tone: 'primary' | 'stable' | 'secondary';
}) {
    const toneClass = {
        primary: 'bg-primary/10 text-primary',
        stable: 'bg-stable-surface text-stable',
        secondary: 'bg-secondary/10 text-secondary',
    }[tone];
    return (
        <div className="border-border bg-card shadow-layer-1 flex items-center gap-3 rounded-lg border p-4">
            <span className={`rounded-md p-2 ${toneClass}`}>
                <Icon className="size-4" />
            </span>
            <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.1em] uppercase">
                    {label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
            </div>
        </div>
    );
}

function OtherMetricDeleteDialog({
    otherMetricId,
    otherMetricLabel,
}: {
    otherMetricId: string;
    otherMetricLabel: string;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1">
                    <Trash2 className="size-3.5" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Delete other metric</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the &ldquo;
                    {otherMetricLabel}
                    &rdquo; metric? This action cannot be undone.
                </DialogDescription>

                <Form
                    {...OtherMetricController.destroy.form({
                        other_metric: otherMetricId,
                    })}
                    options={{ preserveScroll: true }}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <InputError message={errors._} />
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    Delete metric
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

OtherMetricsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Other Metrics',
            href: OtherMetricController.index.url(),
        },
    ],
};
