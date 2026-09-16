import { Form, Head, Link, useForm } from '@inertiajs/react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import PermissionController from '@/actions/App/Http/Controllers/Admin/PermissionController';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Permission = {
    id: number;
    name: string;
    guard_name: string;
    roles_count: number;
    created_at: string;
};

type Filters = {
    search: string;
    per_page: number;
};

export default function PermissionsIndex({
    permissions,
    filters,
    pagination,
}: {
    permissions: Permission[];
    filters: Filters;
    pagination: PaginationMeta;
}) {
    const { data, setData, get, processing } = useForm<Filters>(filters);
    const { can } = usePermissions();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(PermissionController.index.url(), {
            preserveState: true,
            replace: true,
            only: ['permissions', 'filters', 'pagination'],
        });
    };

    const resolvePageUrl = (page: number) =>
        PermissionController.index.url({ query: { ...data, page } });

    return (
        <>
            <Head title="Permissions" />
            <Heading
                title="Permissions"
                description="Manage application permissions"
            />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <form
                    onSubmit={submitFilters}
                    className="flex w-full items-center gap-3 sm:max-w-md"
                >
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                        <Input
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            placeholder="Search permissions by name"
                            className="pl-8"
                            aria-label="Search permissions"
                        />
                    </div>
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
                    {can('permissions.create') && (
                        <Link href={PermissionController.create.url()}>
                            <Button variant="default">New permission</Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">
                                Permission
                            </TableHead>
                            <TableHead>Guard</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {permissions.map((permission) => (
                            <TableRow key={permission.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium tabular-nums">
                                            {permission.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Created {permission.created_at}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {permission.guard_name}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {permission.roles_count}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {can('permissions.update') && (
                                            <Link
                                                href={PermissionController.edit.url(
                                                    {
                                                        permission: permission.id,
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
                                        {can('permissions.delete') && (
                                            <PermissionDeleteDialog
                                                permissionId={permission.id}
                                                permissionLabel={permission.name}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {permissions.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-muted-foreground py-8 text-center text-sm"
                                >
                                    No permissions found.
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

function PermissionDeleteDialog({
    permissionId,
    permissionLabel,
}: {
    permissionId: number;
    permissionLabel: string;
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
                <DialogTitle>Delete permission</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the &ldquo;{permissionLabel}
                    &rdquo; permission? This action cannot be undone.
                </DialogDescription>

                <Form
                    {...PermissionController.destroy.form({
                        permission: permissionId,
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
                                    Delete permission
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Permissions',
            href: PermissionController.index.url(),
        },
    ],
};
