import { Head, Link, useForm } from '@inertiajs/react';
import RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AvailablePermission = {
    id: number;
    name: string;
};

export default function RoleCreate({
    availablePermissions,
}: {
    availablePermissions: AvailablePermission[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as number[],
    });

    const togglePermission = (permissionId: number) => {
        setData(
            'permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId],
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(RoleController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="New role" />
            <Heading
                title="New role"
                description="Create a role and assign permissions to it"
            />

            <div className="border-border bg-card shadow-layer-1 max-w-2xl overflow-hidden rounded-xl border">
                <div className="border-b border-border border-t-4 border-t-primary bg-muted/50 px-6 py-5">
                    <h2 className="headline-sm font-bold text-foreground">Role Details</h2>
                    <p className="body-sm mt-0.5 text-muted-foreground">Name this role and assign the permissions it grants.</p>
                </div>
                <form onSubmit={submit} className="p-6 space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Role name</Label>
                    <Input
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        name="name"
                        required
                        autoComplete="off"
                        placeholder="e.g. admin, auditor"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="flex flex-wrap gap-4">
                        {availablePermissions.map((permission) => (
                            <label
                                key={permission.id}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={data.permissions.includes(
                                        permission.id,
                                    )}
                                    onCheckedChange={() =>
                                        togglePermission(permission.id)
                                    }
                                />
                                <Label
                                    htmlFor={`permission-${permission.id}`}
                                    className="text-sm font-normal"
                                >
                                    {permission.name}
                                </Label>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Save</Button>
                    <Link href={RoleController.index.url()}>
                        <Button variant="secondary" type="button">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    </>
    );
}

RoleCreate.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: RoleController.index.url(),
        },
        {
            title: 'New role',
            href: RoleController.create.url(),
        },
    ],
};
