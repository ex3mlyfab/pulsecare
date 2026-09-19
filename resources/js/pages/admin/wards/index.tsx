import { Form, Head, Link, useForm } from '@inertiajs/react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import WardController from '@/actions/App/Http/Controllers/Admin/WardController';
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
import { Badge } from '@/components/ui/badge';
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

type Ward = {
    id: string;
    name: string;
    beds_count: number | null;
    location: string | null;
    status: string;
    matron_in_charge: { id: string; name: string } | null;
    created_at: string;
};

type MatronOption = {
    id: string;
    name: string;
};

type Filters = {
    search: string;
    status: string;
    per_page: number;
};

export default function WardsIndex({
    wards,
    availableMatrons,
    filters,
    pagination,
}: {
    wards: Ward[];
    availableMatrons: MatronOption[];
    filters: Filters;
    pagination: PaginationMeta;
}) {
    const { data, setData, get, processing } = useForm<Filters>(filters);
    const { can } = usePermissions();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(WardController.index.url(), {
            preserveState: true,
            replace: true,
            only: ['wards', 'filters', 'pagination'],
        });
    };

    const resolvePageUrl = (page: number) =>
        WardController.index.url({ query: { ...data, page } });

    return (
        <>
            <Head title="Wards" />
            <Heading
                title="Wards"
                description="Manage hospital wards and their matrons in charge"
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <form
                    onSubmit={submitFilters}
                    className="flex w-full flex-wrap items-center gap-3 sm:max-w-xl"
                >
                    <div className="relative min-w-48 flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                        <Input
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            placeholder="Search by name or location"
                            className="pl-8"
                            aria-label="Search wards"
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
                    {can('wards.create') && (
                        <Link href={WardController.create.url()}>
                            <Button variant="default">New ward</Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[35%]">Ward</TableHead>
                            <TableHead>Beds</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Matron in charge</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {wards.map((ward) => (
                            <TableRow key={ward.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {ward.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Created{' '}
                                            {new Date(
                                                ward.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground tabular-nums">
                                    {ward.beds_count ?? '—'}
                                </TableCell>
                                <TableCell>
                                    {ward.location || (
                                        <span className="text-muted-foreground text-xs">
                                            No location set
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            ward.status === 'Active'
                                                ? 'success'
                                                : 'outline'
                                        }
                                    >
                                        {ward.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {ward.matron_in_charge ? (
                                        <span>
                                            {ward.matron_in_charge.name}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">
                                            Unassigned
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {can('wards.update') && (
                                            <Link
                                                href={WardController.edit.url({
                                                    ward: ward.id,
                                                })}
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
                                        {can('wards.delete') && (
                                            <WardDeleteDialog
                                                wardId={ward.id}
                                                wardLabel={ward.name}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {wards.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-muted-foreground py-8 text-center text-sm"
                                >
                                    No wards found.
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

function WardDeleteDialog({
    wardId,
    wardLabel,
}: {
    wardId: string;
    wardLabel: string;
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
                <DialogTitle>Delete ward</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the &ldquo;{wardLabel}
                    &rdquo; ward? This action cannot be undone.
                </DialogDescription>

                <Form
                    {...WardController.destroy.form({ ward: wardId })}
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
                                    Delete ward
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

WardsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Wards',
            href: WardController.index.url(),
        },
    ],
};
