import { Head, Link, useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import NursingDailyReportController from '@/actions/App/Http/Controllers/Admin/NursingDailyReportController';
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
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import type { Auth } from '@/types';

type WardOption = {
    id: string;
    name: string;
};

type UserOption = {
    id: number;
    name: string;
};

type NursingDailyReportForm = {
    patient_name: string;
    hospital_number: string;
    report: string;
    ward_id: string;
    shift: string;
    created_by: string;
    creation_date: string;
    reported_by_id: string;
};

export default function NursingDailyReportCreate({
    wards,
    users,
    shifts,
}: {
    wards: WardOption[];
    users: UserOption[];
    shifts: string[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const { data, setData, post, processing, errors, reset } =
        useForm<NursingDailyReportForm>({
            patient_name: '',
            hospital_number: '',
            report: '',
            ward_id: '',
            shift: '',
            created_by: '',
            creation_date: new Date().toISOString().split('T')[0],
            reported_by_id: String(auth.user.id),
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(NursingDailyReportController.store.url(), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="New Nursing Daily Report" />

            <div className="mx-auto max-w-3xl space-y-6">
                <Heading
                    title="New Nursing Daily Report"
                    description="Record a new nursing daily report for a patient"
                />

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-layer-1">
                <div className="border-b border-border border-t-4 border-t-primary bg-muted/50 px-6 py-5">
                    <h2 className="headline-sm font-bold text-foreground">
                        Report Details
                    </h2>
                    <p className="body-sm mt-0.5 text-muted-foreground">
                        Fill in all required fields to submit the nursing daily report.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6 p-6">
                    {/* Patient Info */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="patient_name">
                                Patient Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="patient_name"
                                value={data.patient_name}
                                onChange={(e) =>
                                    setData('patient_name', e.target.value)
                                }
                                placeholder="e.g. John Doe"
                                autoComplete="off"
                                required
                            />
                            <InputError message={errors.patient_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="hospital_number">
                                Hospital Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="hospital_number"
                                value={data.hospital_number}
                                onChange={(e) =>
                                    setData('hospital_number', e.target.value)
                                }
                                placeholder="e.g. HN-0042A"
                                autoComplete="off"
                                required
                            />
                            <InputError message={errors.hospital_number} />
                        </div>
                    </div>

                    {/* Ward & Shift */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="ward_id">
                                Ward <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.ward_id}
                                onValueChange={(v) => setData('ward_id', v)}
                            >
                                <SelectTrigger
                                    id="ward_id"
                                    aria-label="Select ward"
                                >
                                    <SelectValue placeholder="Select a ward" />
                                </SelectTrigger>
                                <SelectContent>
                                    {wards.map((ward) => (
                                        <SelectItem key={ward.id} value={ward.id}>
                                            {ward.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.ward_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shift">
                                Shift <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.shift}
                                onValueChange={(v) => setData('shift', v)}
                            >
                                <SelectTrigger
                                    id="shift"
                                    aria-label="Select shift"
                                >
                                    <SelectValue placeholder="Select a shift" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shifts.map((shift) => (
                                        <SelectItem key={shift} value={shift}>
                                            {shift}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.shift} />
                        </div>
                    </div>

                    {/* Report */}
                    <div className="grid gap-2">
                        <Label htmlFor="report">
                            Report <span className="text-destructive">*</span>
                        </Label>
                        <RichTextEditor
                            value={data.report}
                            onChange={(html) => setData('report', html)}
                            placeholder="Describe the patient's condition, observations, medications administered, and any notable events during the shift…"
                            minHeight="min-h-48"
                        />
                        <InputError message={errors.report} />
                    </div>

                    {/* Created By & Date */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="created_by">
                                Created By <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="created_by"
                                value={data.created_by}
                                onChange={(e) =>
                                    setData('created_by', e.target.value)
                                }
                                placeholder="e.g. Nurse Jane Obi"
                                autoComplete="off"
                                required
                            />
                            <InputError message={errors.created_by} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="creation_date">
                                Creation Date <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="creation_date"
                                type="date"
                                value={data.creation_date}
                                onChange={(e) =>
                                    setData('creation_date', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.creation_date} />
                        </div>
                    </div>

                    {/* Reported By */}
                    <div className="grid gap-2">
                        <Label htmlFor="reported_by_id">
                            Reported By (User) <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.reported_by_id}
                            onValueChange={(v) => setData('reported_by_id', v)}
                        >
                            <SelectTrigger
                                id="reported_by_id"
                                aria-label="Select reporting user"
                            >
                                <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={String(user.id)}
                                    >
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Defaults to the currently logged-in user.
                        </p>
                        <InputError message={errors.reported_by_id} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-border pt-2">
                        <Button
                            disabled={processing}
                            className="font-semibold shadow-xs"
                        >
                            Save Report
                        </Button>
                        <Link
                            href={NursingDailyReportController.index.url()}
                        >
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
            </div>
        </>
    );
}

NursingDailyReportCreate.layout = {
    breadcrumbs: [
        {
            title: 'Nursing Daily Reports',
            href: NursingDailyReportController.index.url(),
        },
        {
            title: 'New Report',
            href: NursingDailyReportController.create.url(),
        },
    ],
};
