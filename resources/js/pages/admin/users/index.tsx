import { Form, Head, Link, useForm } from '@inertiajs/react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
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

type User = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    created_at: string;
};

type RoleOption = {
    id: number;
    name: string;
};

type Filters = {
    search: string;
    role_id: number | string;
    per_page: number;
};

export default function UsersIndex({
    users,
    availableRoles,
    filters,
    pagination,
}: {
    users: User[];
    availableRoles: RoleOption[];
    filters: Filters;
    pagination: PaginationMeta;
}) {
    const { data, setData, get, processing } = useForm<Filters>(filters);
    const { can } = usePermissions();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(UserController.index.url(), {
            preserveState: true,
            replace: true,
            only: ['users', 'filters', 'pagination'],
        });
    };

    const resolvePageUrl = (page: number) =>
        UserController.index.url({ query: { ...data, page } });

    return (
        <>
            <Head title="Users" />
            <Heading
                title="Users"
                description="Manage user accounts and their role assignments"
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
                            placeholder="Search by name or email"
                            className="pl-8"
                            aria-label="Search users"
                        />
                    </div>
                    <Select
                        value={String(data.role_id)}
                        onValueChange={(value) =>
                            setData('role_id', value === 'all' ? '' : value)
                        }
                        disabled={processing}
                    >
                        <SelectTrigger
                            className="w-40"
                            aria-label="Filter by role"
                        >
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            {availableRoles.map((role) => (
                                <SelectItem
                                    key={role.id}
                                    value={String(role.id)}
                                >
                                    {role.name}
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
                    {can('users.create') && (
                        <Link href={UserController.create.url()}>
                            <Button variant="default">New user</Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="border-border bg-card shadow-layer-1 overflow-hidden rounded-xl border">
                    <Table>
                        <TableHeader className="bg-muted/50 border-b border-border">
                            <TableRow>
                                <TableHead className="w-[35%] font-bold uppercase text-xs tracking-wider text-muted-foreground">User</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Email</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Roles</TableHead>
                                <TableHead className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium tabular-nums">
                                            {user.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Joined {user.created_at}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    {user.roles.length === 0 ? (
                                        <span className="text-muted-foreground text-xs">
                                            No roles
                                        </span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <span
                                                    key={role}
                                                    className="border-sidebar-border/70 bg-muted/40 text-muted-foreground rounded-sm border px-1.5 py-0.5 text-xs"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {can('users.update') && (
                                            <Link
                                                href={UserController.edit.url({
                                                    user: user.id,
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
                                        {can('users.delete') && (
                                            <UserDeleteDialog
                                                userId={user.id}
                                                userLabel={user.name}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-muted-foreground py-8 text-center text-sm"
                                >
                                    No users found.
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

function UserDeleteDialog({
    userId,
    userLabel,
}: {
    userId: number;
    userLabel: string;
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
                <DialogTitle>Delete user</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the &ldquo;{userLabel}
                    &rdquo; user? This action cannot be undone.
                </DialogDescription>

                <Form
                    {...UserController.destroy.form({ user: userId })}
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
                                    Delete user
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: UserController.index.url(),
        },
    ],
};
