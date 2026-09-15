import { Head, Link, useForm } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type User = {
    id: number;
    name: string;
    email: string;
    roles: number[];
};

type RoleOption = {
    id: number;
    name: string;
};

type UserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: number[];
};

export default function UserEdit({
    user,
    availableRoles,
}: {
    user: User;
    availableRoles: RoleOption[];
}) {
    const { data, setData, patch, processing, errors } = useForm<UserForm>({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles,
    });

    const toggleRole = (roleId: number) => {
        setData(
            'roles',
            data.roles.includes(roleId)
                ? data.roles.filter((id) => id !== roleId)
                : [...data.roles, roleId],
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(UserController.update.url({ user: user.id }));
    };

    const hasPassword = data.password.length > 0;

    return (
        <>
            <Head title={`Edit ${user.name}`} />
            <Heading
                title="Edit user"
                description="Update the user's details and role assignments"
            />

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        name="name"
                        required
                        autoComplete="off"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        name="email"
                        required
                        autoComplete="off"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">New password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            name="password"
                            autoComplete="new-password"
                            placeholder="Leave blank to keep current"
                        />
                        <InputError message={errors.password} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm new password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            name="password_confirmation"
                            autoComplete="new-password"
                            disabled={!hasPassword}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Roles</Label>
                    <div className="flex flex-wrap gap-4">
                        {availableRoles.map((role) => (
                            <label
                                key={role.id}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <Checkbox
                                    id={`role-${role.id}`}
                                    checked={data.roles.includes(role.id)}
                                    onCheckedChange={() => toggleRole(role.id)}
                                />
                                <Label
                                    htmlFor={`role-${role.id}`}
                                    className="text-sm font-normal"
                                >
                                    {role.name}
                                </Label>
                            </label>
                        ))}
                    </div>
                    <InputError message={errors.roles} />
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Save</Button>
                    <Link href={UserController.index.url()}>
                        <Button variant="secondary" type="button">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </>
    );
}

UserEdit.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: UserController.index.url(),
        },
        {
            title: 'Edit user',
            href: UserController.edit.url({ user: 0 }),
        },
    ],
};
