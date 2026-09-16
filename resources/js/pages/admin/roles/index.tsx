import { Form, Head, Link, useForm } from '@inertiajs/react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import InputError from '@/components/input-error';
import { Pagination, type PaginationMeta } from '@/components/pagination';
import Heading from '@/components/heading';
import { usePermissions } from '@/hooks/use-permissions';
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

type Role = {
    id: number;
    name: string;
    guard_name: string;
    users_count: number;
    permissions: string[];
    created_at: string;
};

type Filters = {
    search: string;
    per_page: number;
};

export default function RolesIndex({
    roles,
    filters,
    pagination,
}: {
    roles: Role[];
    filters: Filters;
    pagination: PaginationMeta;
}) {
    const { data, setData, get, processing } = useForm<Filters>(filters);
    const { can } = usePermissions();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(RoleController.index.url(), {
            preserveState: true,
            replace: true,
            only: ['roles', 'filters', 'pagination'],
        });
    };

    const resolvePageUrl = (page: number) =>
        RoleController.index.url({ query: { ...data, page } });

    return (
        <>
            <Head title="Roles" />
            <Heading
                title="Roles"
                description="Manage application roles and their permissions"
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
                            placeholder="Search roles by name"
                            className="pl-8"
                            aria-label="Search roles"
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
                    {can('roles.create') && (
                        <Link href={RoleController.create.url()}>
                            <Button variant="default">New role</Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Role</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium tabular-nums">
                                            {role.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {role.created_at}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {role.users_count}
                                </TableCell>
                                <TableCell>
                                    {role.permissions.length === 0 ? (
                                        <span className="text-muted-foreground text-xs">
                                            No permissions
                                        </span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions
                                                .slice(0, 4)
                                                .map((permission) => (
                                                    <span
                                                        key={permission}
                                                        className="border-sidebar-border/70 bg-muted/40 text-muted-foreground rounded-sm border px-1.5 py-0.5 text-xs"
                                                    >
                                                        {permission}
                                                    </span>
                                                ))}
                                            {role.permissions.length > 4 && (
                                                <span className="text-muted-foreground text-xs">
                                                    +
                                                    {role.permissions.length -
                                                        4}{' '}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {can('roles.update') && (
                                            <Link
                                                href={RoleController.edit.url({
                                                    role: role.id,
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
                                        {can('roles.delete') && (
                                            <RoleDeleteDialog
                                                roleId={role.id}
                                                roleLabel={role.name}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {roles.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-muted-foreground py-8 text-center text-sm"
                                >
                                    No roles found.
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

function RoleDeleteDialog({
    roleId,
    roleLabel,
}: {
    roleId: number;
    roleLabel: string;
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
                <DialogTitle>Delete role</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the &ldquo;{roleLabel}
                    &rdquo; role? This action cannot be undone.
                </DialogDescription>

                <Form
                    {...RoleController.destroy.form({ role: roleId })}
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
                                    Delete role
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: RoleController.index.url(),
        },
    ],
};
