import { Head, Link, useForm } from '@inertiajs/react';
import WardController from '@/actions/App/Http/Controllers/Admin/WardController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Ward = {
    id: string;
    name: string;
    location: string;
    status: string;
    matron_in_charge_id: string | null;
};

type MatronOption = {
    id: string;
    name: string;
};

type WardForm = {
    name: string;
    location: string;
    status: string;
    matron_in_charge_id: string;
};

export default function WardEdit({
    ward,
    availableMatrons,
}: {
    ward: Ward;
    availableMatrons: MatronOption[];
}) {
    const { data, setData, patch, processing, errors } = useForm<WardForm>({
        name: ward.name,
        location: ward.location || '',
        status: ward.status,
        matron_in_charge_id: ward.matron_in_charge_id || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(WardController.update.url({ ward: ward.id }));
    };

    return (
        <>
            <Head title={`Edit ${ward.name}`} />
            <Heading
                title="Edit ward"
                description="Update ward details and matron assignment"
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
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        name="location"
                        autoComplete="off"
                    />
                    <InputError message={errors.location} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={data.status}
                        onValueChange={(value) => setData('status', value)}
                    >
                        <SelectTrigger
                            id="status"
                            className="w-40"
                            aria-label="Select status"
                        >
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="matron_in_charge_id">Matron in charge</Label>
                    <Select
                        value={data.matron_in_charge_id || 'none'}
                        onValueChange={(value) =>
                            setData(
                                'matron_in_charge_id',
                                value === 'none' ? '' : value,
                            )
                        }
                    >
                        <SelectTrigger
                            id="matron_in_charge_id"
                            className="w-full"
                            aria-label="Select matron in charge"
                        >
                            <SelectValue placeholder="Select a matron" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {availableMatrons.map((matron) => (
                                <SelectItem
                                    key={matron.id}
                                    value={matron.id}
                                >
                                    {matron.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.matron_in_charge_id} />
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Save</Button>
                    <Link href={WardController.index.url()}>
                        <Button variant="secondary" type="button">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </>
    );
}

WardEdit.layout = {
    breadcrumbs: [
        {
            title: 'Wards',
            href: WardController.index.url(),
        },
        {
            title: 'Edit ward',
            href: WardController.edit.url({ ward: '0' }),
        },
    ],
};
