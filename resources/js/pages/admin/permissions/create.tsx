import { Head, Link, useForm } from '@inertiajs/react';
import PermissionController from '@/actions/App/Http/Controllers/Admin/PermissionController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PermissionCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(PermissionController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="New permission" />
            <Heading
                title="New permission"
                description="Create a permission that can be assigned to roles"
            />

            <div className="border-border bg-card shadow-layer-1 max-w-2xl overflow-hidden rounded-xl border">
                <div className="border-b border-border border-t-4 border-t-primary bg-muted/50 px-6 py-5">
                    <h2 className="headline-sm font-bold text-foreground">Permission Details</h2>
                    <p className="body-sm mt-0.5 text-muted-foreground">Define a granular permission string that can be assigned to roles.</p>
                </div>
                <form onSubmit={submit} className="p-6 space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Permission name</Label>
                    <Input
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        name="name"
                        required
                        autoComplete="off"
                        placeholder="e.g. users.export"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Save</Button>
                    <Link href={PermissionController.index.url()}>
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

PermissionCreate.layout = {
    breadcrumbs: [
        {
            title: 'Permissions',
            href: PermissionController.index.url(),
        },
        {
            title: 'New permission',
            href: PermissionController.create.url(),
        },
    ],
};
