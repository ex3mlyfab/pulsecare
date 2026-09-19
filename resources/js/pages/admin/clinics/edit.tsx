import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import ClinicController from '@/actions/App/Http/Controllers/Admin/ClinicController';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const OPERATING_DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
] as const;

type OperatingDay = (typeof OPERATING_DAYS)[number];

type Clinic = {
    id: string;
    name: string;
    location: string | null;
    operating_days: OperatingDay[];
};

type ClinicForm = {
    name: string;
    location: string;
    operating_days: OperatingDay[];
};

export default function ClinicEdit({ clinic }: { clinic: Clinic }) {
    const { data, setData, patch, processing, errors } = useForm<ClinicForm>({
        name: clinic.name,
        location: clinic.location || '',
        operating_days: (clinic.operating_days ?? []) as OperatingDay[],
    });

    const selectedDays = data.operating_days;

    const toggleDay = (day: OperatingDay) => {
        const nextDays = selectedDays.includes(day)
            ? selectedDays.filter((d) => d !== day)
            : [...selectedDays, day];
        setData('operating_days', nextDays);
    };

    const clearDays = () => {
        setData('operating_days', []);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(ClinicController.update.url({ clinic: clinic.id }));
    };

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Clinics',
                href: ClinicController.index.url(),
            },
            {
                title: 'Edit clinic',
                href: ClinicController.edit.url({ clinic: clinic.id }),
            },
        ],
    });

    const daysError = errors.operating_days;

    return (
        <>
            <Head title={`Edit ${clinic.name}`} />
            <Heading
                title="Edit clinic"
                description="Update clinic details and operating days"
            />

            <div className="border-border bg-card shadow-layer-1 max-w-2xl rounded-lg border overflow-hidden">
                <div className="border-b border-border border-t-4 border-t-primary bg-muted/60 px-6 py-5">
                    <h2 className="headline-sm font-bold text-foreground">Edit Clinic Details</h2>
                    <p className="body-sm text-muted-foreground mt-0.5">Update clinic designation, operating schedule, and physical location.</p>
                </div>
                <form onSubmit={submit} className="p-6 space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">
                        Clinic name{' '}
                        <span className="text-destructive" aria-hidden="true">
                            *
                        </span>
                    </Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        name="name"
                        required
                        autoComplete="off"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                            errors.name ? 'name-error' : undefined
                        }
                    />
                    <p id="name-error" aria-live="polite">
                        <InputError message={errors.name} />
                    </p>
                </div>

                <fieldset
                    aria-describedby={
                        daysError ? 'operating-days-error' : undefined
                    }
                    className="grid gap-2"
                >
                    <legend className="text-sm font-medium">
                        Days the clinic holds
                        {daysError && (
                            <span className="text-muted-foreground ml-1 font-normal">
                                (select at least one)
                            </span>
                        )}
                    </legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {OPERATING_DAYS.map((day) => {
                            const checked = selectedDays.includes(day);
                            return (
                                <label
                                    key={day}
                                    htmlFor={`operating-day-${day.toLowerCase()}`}
                                    className={
                                        'peer flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm transition-colors ' +
                                        'focus-within:ring-ring focus-within:ring-1 ' +
                                        (checked
                                            ? 'border-primary/40 bg-primary/5'
                                            : 'border-input hover:bg-accent')
                                    }
                                >
                                    <Checkbox
                                        id={`operating-day-${day.toLowerCase()}`}
                                        name="operating_days"
                                        value={day}
                                        checked={checked}
                                        onCheckedChange={() => toggleDay(day)}
                                        aria-invalid={Boolean(daysError)}
                                    />
                                    <span className="flex-1">{day}</span>
                                    {checked && <Check className="size-3.5" />}
                                </label>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p
                            id="operating-days-error"
                            className="text-sm text-red-600 dark:text-red-400"
                            aria-live="polite"
                        >
                            {daysError ?? ''}
                        </p>
                        {selectedDays.length > 0 && (
                            <button
                                type="button"
                                onClick={clearDays}
                                className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </fieldset>

                <div className="grid gap-2">
                    <Label htmlFor="location">
                        Location{' '}
                        <span className="text-muted-foreground font-normal">
                            (optional)
                        </span>
                    </Label>
                    <Input
                        id="location"
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        name="location"
                        autoComplete="off"
                        aria-invalid={Boolean(errors.location)}
                        aria-describedby={
                            errors.location ? 'location-error' : undefined
                        }
                    />
                    <p id="location-error" aria-live="polite">
                        <InputError message={errors.location} />
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Save changes</Button>
                    <Link href={ClinicController.index.url()}>
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
