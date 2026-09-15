import { Form, Head, Link } from '@inertiajs/react';
import PermissionController from '@/actions/App/Http/Controllers/Admin/PermissionController';
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

type Permission = {
    id: number;
    name: string;
    guard_name: string;
    roles_count: number;
    created_at: string;
};

export default function PermissionsIndex({
    permissions,
}: {
    permissions: Permission[];
}) {
    return (
        <>
            <Head title="Permissions" />
            <Heading
                title="Permissions"
                description="Manage application permissions"
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    {permissions.length} permission
                    {permissions.length === 1 ? '' : 's'}
                </p>
                <Link href={PermissionController.create.url()}>
                    <Button variant="default">New permission</Button>
                </Link>
            </div>

            <div className="space-y-4">
                {permissions.map((permission) => (
                    <div
                        key={permission.id}
                        className="border-sidebar-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="space-y-1">
                            <p className="text-base font-medium">{permission.name}</p>
                            <p className="text-muted-foreground text-sm">
                                {permission.roles_count} role
                                {permission.roles_count === 1 ? '' : 's'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={PermissionController.edit.url({
                                    permission: permission.id,
                                })}
                            >
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                            </Link>
                            <PermissionDeleteDialog
                                permissionId={permission.id}
                                permissionLabel={permission.name}
                            />
                        </div>
                    </div>
                ))}

                {permissions.length === 0 && (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                        No permissions found.
                    </div>
                )}
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
                <Button variant="destructive" size="sm">
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Delete permission</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the &ldquo;{permissionLabel}&rdquo;
                    permission? This action cannot be undone.
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
                                <Button variant="destructive" disabled={processing}>
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
