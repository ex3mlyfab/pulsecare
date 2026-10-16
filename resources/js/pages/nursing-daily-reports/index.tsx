import { Form, Head, Link, useForm } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    Pencil,
    Search,
    Trash2,
} from 'lucide-react';
import NursingDailyReportController from '@/actions/App/Http/Controllers/Admin/NursingDailyReportController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { usePermissions } from '@/hooks/use-permissions';
import { Pagination, type PaginationMeta } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
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

type WardOption = {
    id: string;
    name: string;
};

type Report = {
    id: string;
    patient_name: string;
    hospital_number: string;
    shift: 'Morning' | 'Afternoon' | 'Evening';
    creation_date: string;
    created_by: string;
    ward: { id: string; name: string };
    reported_by: { id: number; name: string } | null;
    created_at: string;
};

type Filters = {
    search: string;
    shift: string;
    ward_id: string;
    date: string;
    per_page: number;
};

const shiftVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    Morning: 'default',
    Afternoon: 'secondary',
    Evening: 'outline',
};

export default function NursingDailyReportsIndex({
    reports,
    filters,
    pagination,
    wards,
}: {
    reports: Report[];
    filters: Filters;
    pagination: PaginationMeta;
    wards: WardOption[];
}) {
    const { data, setData, get, processing } = useForm<Filters>(filters);
    const { can } = usePermissions();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(NursingDailyReportController.index.url(), {
            preserveState: true,
            replace: true,
            only: ['reports', 'filters', 'pagination'],
        });
    };

    const resolvePageUrl = (page: number) =>
        NursingDailyReportController.index.url({ query: { ...data, page } });

    return (
        <>
            <Head title="Nursing Daily Reports" />
            <Heading
                title="Nursing Daily Reports"
                description="View, filter, and manage nursing daily reports across all wards"
            />

            {/* Filter bar */}
            <div className="mb-6 flex flex-wrap items-end gap-3">
                <form
                    onSubmit={submitFilters}
                    className="flex w-full flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-layer-1"
                >
                    {/* Search */}
                    <div className="relative min-w-52 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            placeholder="Search patient, hospital no., created by…"
                            className="pl-8"
                            aria-label="Search reports"
                        />
                    </div>

                    {/* Shift filter */}
                    <Select
                        value={data.shift || 'all'}
                        onValueChange={(v) =>
                            setData('shift', v === 'all' ? '' : v)
                        }
                        disabled={processing}
                    >
                        <SelectTrigger className="w-40" aria-label="Filter by shift">
                            <SelectValue placeholder="All shifts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All shifts</SelectItem>
                            <SelectItem value="Morning">Morning</SelectItem>
                            <SelectItem value="Afternoon">Afternoon</SelectItem>
                            <SelectItem value="Evening">Evening</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Ward filter */}
                    <Select
                        value={data.ward_id || 'all'}
                        onValueChange={(v) =>
                            setData('ward_id', v === 'all' ? '' : v)
                        }
                        disabled={processing}
                    >
                        <SelectTrigger className="w-48" aria-label="Filter by ward">
                            <SelectValue placeholder="All wards" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All wards</SelectItem>
                            {wards.map((ward) => (
                                <SelectItem key={ward.id} value={ward.id}>
                                    {ward.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Date filter */}
                    <div className="relative">
                        <Calendar className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className="w-44 pl-8"
                            aria-label="Filter by date"
                        />
                    </div>

                    <Button
                        type="submit"
                        size="sm"
                        className="font-semibold shadow-xs"
                        disabled={processing}
                    >
                        Filter
                    </Button>

                    {(data.search || data.shift || data.ward_id || data.date) && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setData({
                                    search: '',
                                    shift: '',
                                    ward_id: '',
                                    date: '',
                                    per_page: data.per_page,
                                });
                                get(NursingDailyReportController.index.url(), {
                                    preserveState: true,
                                    replace: true,
                                    only: ['reports', 'filters', 'pagination'],
                                });
                            }}
                        >
                            Clear filters
                        </Button>
                    )}
                </form>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {pagination.total} report{pagination.total !== 1 ? 's' : ''}
                    </span>
                    {can('nursing_daily_reports.create') && (
                        <Link href={NursingDailyReportController.create.url()}>
                            <Button variant="default" className="font-semibold shadow-xs">
                                New report
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-layer-1">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/70 hover:bg-muted/70">
                                <TableHead className="w-[22%] pl-4 font-bold uppercase tracking-wider text-foreground">
                                    Patient
                                </TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-foreground">
                                    Hospital No.
                                </TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-foreground">
                                    Ward
                                </TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-foreground">
                                    Shift
                                </TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-foreground">
                                    Date
                                </TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-foreground">
                                    Created By
                                </TableHead>
                                <TableHead className="font-bold uppercase tracking-wider text-foreground">
                                    Reported By
                                </TableHead>
                                <TableHead className="pr-4 font-bold uppercase tracking-wider text-foreground">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map((report) => (
                                <TableRow
                                    key={report.id}
                                    className="border-b border-border/50 last:border-0"
                                >
                                    <TableCell className="pl-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">
                                                {report.patient_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Added{' '}
                                                {new Date(
                                                    report.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm font-medium text-foreground">
                                            {report.hospital_number}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-foreground">
                                            {report.ward.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                shiftVariant[report.shift] ??
                                                'outline'
                                            }
                                        >
                                            {report.shift}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="tabular-nums text-sm text-muted-foreground">
                                        {new Date(
                                            report.creation_date,
                                        ).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {report.created_by}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {report.reported_by ? (
                                            report.reported_by.name
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="pr-4">
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={NursingDailyReportController.show.url(
                                                    {
                                                        nursing_daily_report:
                                                            report.id,
                                                    },
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1"
                                                >
                                                    <Eye className="size-3.5" />
                                                    View
                                                </Button>
                                            </Link>
                                            {can('nursing_daily_reports.update') && (
                                                <Link
                                                    href={NursingDailyReportController.edit.url(
                                                        {
                                                            nursing_daily_report:
                                                                report.id,
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
                                            {can('nursing_daily_reports.delete') && (
                                                <ReportDeleteDialog
                                                    reportId={report.id}
                                                    patientName={
                                                        report.patient_name
                                                    }
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {reports.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-2xl">📋</span>
                                            <span>No nursing daily reports found.</span>
                                            {(filters.search ||
                                                filters.shift ||
                                                filters.ward_id ||
                                                filters.date) && (
                                                <span className="text-xs">
                                                    Try clearing your filters.
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination
                    meta={pagination}
                    resolveUrl={(page) => resolvePageUrl(page)}
                />
            </div>
        </>
    );
}

function ReportDeleteDialog({
    reportId,
    patientName,
}: {
    reportId: string;
    patientName: string;
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
                <DialogTitle>Delete report</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the nursing daily report for{' '}
                    &ldquo;{patientName}&rdquo;? This action cannot be undone.
                </DialogDescription>

                <Form
                    {...NursingDailyReportController.destroy.form({
                        nursing_daily_report: reportId,
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
                                    Delete report
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

NursingDailyReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Nursing Daily Reports',
            href: NursingDailyReportController.index.url(),
        },
    ],
};
