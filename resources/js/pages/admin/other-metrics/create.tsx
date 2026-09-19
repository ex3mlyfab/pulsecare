import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import OtherMetricController from '@/actions/App/Http/Controllers/Admin/OtherMetricController';
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

type OtherMetricsForm = {
    name: string;
    status: string;
};

export default function OtherMetricsCreate() {
    const { data, setData, post, processing, errors, reset } =
        useForm<OtherMetricsForm>({
            name: '',
            status: 'Active',
        });

    const [checkingName, setCheckingName] = useState(false);
    const [nameState, setNameState] = useState<'idle' | 'available' | 'exists'>(
        'idle',
    );
    const [lastCheckedName, setLastCheckedName] = useState('');

    const checkName = async (name: string) => {
        const trimmed = name.trim();

        if (trimmed === '') {
            setNameState('idle');
            setLastCheckedName('');
            return;
        }

        setCheckingName(true);

        try {
            const response = await fetch(
                OtherMetricController.checkName.url({
                    query: { name: trimmed },
                }),
                { headers: { Accept: 'application/json' } },
            );

            const result = (await response.json()) as { exists: boolean };

            setNameState(result.exists ? 'exists' : 'available');
            setLastCheckedName(trimmed);
        } catch {
            setNameState('idle');
        } finally {
            setCheckingName(false);
        }
    };

    const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const trimmed = name.trim();

        if (trimmed === '') {
            setNameState('idle');
            setLastCheckedName('');
            return;
        }

        if (trimmed === lastCheckedName) {
            return;
        }

        void checkName(name);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(OtherMetricController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    const nameConflict = nameState === 'exists';
    const nameAvailable = nameState === 'available';

    return (
        <>
            <Head title="New other metric" />
            <Heading
                title="New other metric"
                description="Create a new other metric"
            />

            <div className="border-border bg-card shadow-layer-1 max-w-2xl overflow-hidden rounded-xl border">
                <div className="border-b border-border border-t-4 border-t-primary bg-muted/50 px-6 py-5">
                    <h2 className="headline-sm font-bold text-foreground">Metric Details</h2>
                    <p className="body-sm mt-0.5 text-muted-foreground">Define the metric name and configure its operational status.</p>
                </div>
                <form onSubmit={submit} className="p-6 space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">
                        Name{' '}
                        <span className="text-destructive" aria-hidden="true">
                            *
                        </span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => {
                                setData('name', e.target.value);
                                setNameState('idle');
                                setLastCheckedName('');
                            }}
                            onBlur={handleNameBlur}
                            name="name"
                            required
                            autoComplete="off"
                            placeholder="e.g. Blood Pressure"
                            aria-invalid={Boolean(errors.name) || nameConflict}
                            aria-describedby={
                                errors.name || nameConflict
                                    ? 'name-error'
                                    : undefined
                            }
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2">
                            {checkingName ? (
                                <Loader2 className="text-muted-foreground size-4 animate-spin" />
                            ) : nameAvailable ? (
                                <Check className="size-4 text-green-600" />
                            ) : nameConflict ? (
                                <X className="text-destructive size-4" />
                            ) : null}
                        </span>
                    </div>
                    <p id="name-error" aria-live="polite">
                        <InputError message={errors.name} />
                        {!errors.name && nameConflict && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                This metric name already exists.
                            </p>
                        )}
                    </p>
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

                <div className="flex items-center gap-4">
                    <Button disabled={processing || nameConflict}>Save</Button>
                    <Link href={OtherMetricController.index.url()}>
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

OtherMetricsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Other Metrics',
            href: OtherMetricController.index.url(),
        },
        {
            title: 'New metric',
            href: OtherMetricController.create.url(),
        },
    ],
};
