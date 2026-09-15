import { Head, Link, useForm } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function UserCreate({
    availableRoles,
}: {
    availableRoles: RoleOption[];
}) {
    const { data, setData, post, processing, errors, reset } =
        useForm<UserForm>({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            roles: [] as number[],
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
        post(UserController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="New user" />
            <Heading
                title="New user"
                description="Create a user account and assign roles"
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
                        placeholder="e.g. Jordan Miles"
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
                        placeholder="name@example.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            name="password"
                            required
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            name="password_confirmation"
                            required
                            autoComplete="new-password"
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

UserCreate.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: UserController.index.url(),
        },
        {
            title: 'New user',
            href: UserController.create.url(),
        },
    ],
};
