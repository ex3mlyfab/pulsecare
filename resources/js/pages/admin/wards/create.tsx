import { Head, Link, useForm } from '@inertiajs/react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useState } from 'react';
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

type MatronOption = {
    id: string;
    name: string;
};

type WardForm = {
    name: string;
    beds_count: string;
    location: string;
    status: string;
    matron_in_charge_id: string;
};

export default function WardCreate({
    availableMatrons,
}: {
    availableMatrons: MatronOption[];
}) {
    const { data, setData, post, processing, errors, reset } =
        useForm<WardForm>({
            name: '',
            beds_count: '',
            location: '',
            status: 'Active',
            matron_in_charge_id: '',
        });

    const [matronSearch, setMatronSearch] = useState('');
    const [matronOpen, setMatronOpen] = useState(false);

    const filteredMatrons = availableMatrons.filter((matron) =>
        matron.name.toLowerCase().includes(matronSearch.toLowerCase()),
    );

    const selectedMatron = availableMatrons.find(
        (m) => m.id === data.matron_in_charge_id,
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(WardController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    const handleMatronSelect = (matron: MatronOption) => {
        setData('matron_in_charge_id', matron.id);
        setMatronOpen(false);
        setMatronSearch('');
    };

    const handleMatronClear = () => {
        setData('matron_in_charge_id', '');
        setMatronOpen(false);
        setMatronSearch('');
    };

    return (
        <>
            <Head title="New ward" />
            <Heading
                title="New ward"
                description="Create a new hospital ward and assign a matron in charge"
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
                        placeholder="e.g. ICU Ward"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="beds_count">Number of beds</Label>
                    <Input
                        id="beds_count"
                        type="number"
                        min={0}
                        value={data.beds_count}
                        onChange={(e) => setData('beds_count', e.target.value)}
                        name="beds_count"
                        autoComplete="off"
                        placeholder="Optional"
                    />
                    <InputError message={errors.beds_count} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        name="location"
                        autoComplete="off"
                        placeholder="e.g. Building A, Floor 2"
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
                    <Label htmlFor="matron_in_charge_id">
                        Matron in charge
                    </Label>
                    <div className="relative">
                        <button
                            type="button"
                            id="matron_in_charge_id"
                            className="border-input bg-background text-foreground hover:bg-accent focus:ring-ring flex h-9 w-full items-center justify-between rounded-sm border px-3 py-2 text-sm transition-colors focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => setMatronOpen((open) => !open)}
                            aria-expanded={matronOpen}
                            aria-haspopup="listbox"
                            role="combobox"
                        >
                            <span
                                className={
                                    selectedMatron
                                        ? ''
                                        : 'text-muted-foreground'
                                }
                            >
                                {selectedMatron
                                    ? selectedMatron.name
                                    : 'Select a matron'}
                            </span>
                            <span className="flex items-center gap-1">
                                {selectedMatron && (
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMatronClear();
                                        }}
                                        aria-label="Clear selection"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                                <ChevronDown className="size-4 opacity-50" />
                            </span>
                        </button>

                        {matronOpen && (
                            <div className="border-sidebar-border bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full rounded-sm border shadow-md">
                                <div className="p-1">
                                    <div className="relative">
                                        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                                        <Input
                                            autoFocus
                                            value={matronSearch}
                                            onChange={(e) =>
                                                setMatronSearch(e.target.value)
                                            }
                                            placeholder="Search matrons..."
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto p-1 pt-0">
                                    <button
                                        type="button"
                                        className="hover:bg-accent flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm"
                                        onClick={handleMatronClear}
                                    >
                                        <span className="text-muted-foreground">
                                            Unassigned
                                        </span>
                                        {!data.matron_in_charge_id && (
                                            <Check className="size-4" />
                                        )}
                                    </button>
                                    {filteredMatrons.map((matron) => (
                                        <button
                                            key={matron.id}
                                            type="button"
                                            className={
                                                'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm ' +
                                                (matron.id ===
                                                data.matron_in_charge_id
                                                    ? 'bg-accent font-medium'
                                                    : 'hover:bg-accent')
                                            }
                                            onClick={() =>
                                                handleMatronSelect(matron)
                                            }
                                        >
                                            <span>{matron.name}</span>
                                            {matron.id ===
                                                data.matron_in_charge_id && (
                                                <Check className="size-4" />
                                            )}
                                        </button>
                                    ))}
                                    {filteredMatrons.length === 0 && (
                                        <p className="text-muted-foreground px-2 py-2 text-sm">
                                            No matrons found.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        <InputError message={errors.matron_in_charge_id} />
                    </div>
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

WardCreate.layout = {
    breadcrumbs: [
        {
            title: 'Wards',
            href: WardController.index.url(),
        },
        {
            title: 'New ward',
            href: WardController.create.url(),
        },
    ],
};
