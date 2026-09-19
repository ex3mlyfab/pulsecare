import { Form, Head, Link, useForm } from '@inertiajs/react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import ClinicController from '@/actions/App/Http/Controllers/Admin/ClinicController';
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

export const OPERATING_DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
] as const;

type OperatingDay = (typeof OPERATING_DAYS)[number];

type Clinic = {
    id: string;
    name: string;
    location: string | null;
    operating_days: OperatingDay[];
    created_at: string;
};

type Filters = {
    search: string;
    day: string;
    per_page: number;
};

function formatDays(days: OperatingDay[]): string {
    if (days.length === 0) {
        return '—';
    }
    const initials = days.map((d) => d.slice(0, 2).toUpperCase());
    return initials.join(' · ');
}

export default function ClinicsIndex({
    clinics,
    filters,
    pagination,
}: {
    clinics: Clinic[];
    filters: Filters;
    pagination: PaginationMeta;
}) {
    const { data, setData, get, processing } = useForm<Filters>(filters);
    const { can } = usePermissions();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(ClinicController.index.url(), {
            preserveState: true,
            replace: true,
            only: ['clinics', 'filters', 'pagination'],
        });
    };

    const resolvePageUrl = (page: number) =>
        ClinicController.index.url({ query: { ...data, page } });

    return (
        <>
            <Head title="Clinics" />
            <Heading
                title="Clinics"
                description="Manage clinics and the days of the week they hold"
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <form
                    onSubmit={submitFilters}
                    className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-layer-1 sm:max-w-xl"
                >
                    <div className="relative min-w-48 flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                        <Input
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            placeholder="Search by name or location"
                            className="pl-8"
                            aria-label="Search clinics"
                        />
                    </div>
                    <Select
                        value={data.day || 'all'}
                        onValueChange={(value) =>
                            setData('day', value === 'all' ? '' : value)
                        }
                        disabled={processing}
                    >
                        <SelectTrigger
                            className="w-40"
                            aria-label="Filter by operating day"
                        >
                            <SelectValue placeholder="All days" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All days</SelectItem>
                            {OPERATING_DAYS.map((day) => (
                                <SelectItem key={day} value={day}>
                                    {day}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={processing}
                    >
                        Filter
                    </Button>
                </form>

                <div className="ml-auto">
                    {can('clinics.create') && (
                        <Link href={ClinicController.create.url()}>
                            <Button variant="default">New clinic</Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="border-border bg-card shadow-layer-1 overflow-hidden rounded-xl border">
                    <Table>
                        <TableHeader className="bg-muted/50 border-b border-border">
                            <TableRow>
                                <TableHead className="w-[35%] font-bold uppercase text-xs tracking-wider text-muted-foreground">Clinic</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Days</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Location</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                    <TableBody>
                        {clinics.map((clinic) => (
                            <TableRow key={clinic.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {clinic.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Created{' '}
                                            {new Date(
                                                clinic.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {clinic.operating_days.length > 0 ? (
                                        <span
                                            className="text-muted-foreground text-xs tabular-nums"
                                            title={clinic.operating_days.join(
                                                ', ',
                                            )}
                                        >
                                            {formatDays(clinic.operating_days)}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">
                                            Not set
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {clinic.location || (
                                        <span className="text-muted-foreground text-xs">
                                            No location set
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {can('clinics.update') && (
                                            <Link
                                                href={ClinicController.edit.url(
                                                    {
                                                        clinic: clinic.id,
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
                                        {can('clinics.delete') && (
                                            <ClinicDeleteDialog
                                                clinicId={clinic.id}
                                                clinicLabel={clinic.name}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {clinics.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-muted-foreground py-8 text-center text-sm"
                                >
                                    No clinics found.
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

function ClinicDeleteDialog({
    clinicId,
    clinicLabel,
}: {
    clinicId: string;
    clinicLabel: string;
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
                <DialogTitle>Delete clinic</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the &ldquo;{clinicLabel}
                    &rdquo; clinic? This action cannot be undone.
                </DialogDescription>

                <Form
                    {...ClinicController.destroy.form({ clinic: clinicId })}
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
                                    Delete clinic
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

ClinicsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Clinics',
            href: ClinicController.index.url(),
        },
    ],
};
