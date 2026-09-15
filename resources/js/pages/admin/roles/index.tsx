import { Form, Head, Link } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
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
import { useMemo } from 'react';

type Role = {
    id: number;
    name: string;
    guard_name: string;
    users_count: number;
    permissions: number[];
    created_at: string;
};

type AvailablePermission = {
    id: number;
    name: string;
};

export default function RolesIndex({
    roles,
    availablePermissions,
}: {
    roles: Role[];
    availablePermissions: AvailablePermission[];
}) {
    const permissionNameById = useMemo(
        () => Object.fromEntries(availablePermissions.map((p) => [p.id, p.name])),
        [availablePermissions]
    );

    return (
        <>
            <Head title="Roles" />
            <Heading
                title="Roles"
                description="Manage application roles and their permissions"
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    {roles.length} role{roles.length === 1 ? '' : 's'}
                </p>
                <Link href={RoleController.create.url()}>
                    <Button variant="default">New role</Button>
                </Link>
            </div>

            <div className="space-y-4">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="border-sidebar-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="space-y-1">
                            <p className="text-base font-medium">{role.name}</p>
                            <p className="text-muted-foreground text-sm">
                                {role.users_count} user{role.users_count === 1 ? '' : 's'} ·{' '}
                                {role.permissions.map((id) => permissionNameById[id]).filter(Boolean).join(', ') ||
                                    'No permissions'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href={RoleController.edit.url({ role: role.id })}>
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                            </Link>
                            <RoleDeleteDialog roleId={role.id} roleLabel={role.name} />
                        </div>
                    </div>
                ))}

                {roles.length === 0 && (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                        No roles found.
                    </div>
                )}
            </div>
        </>
    );
}

function RoleDeleteDialog({ roleId, roleLabel }: { roleId: number; roleLabel: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Delete role</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the &ldquo;{roleLabel}&rdquo; role? This
                    action cannot be undone.
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
                                <Button variant="destructive" disabled={processing}>
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
