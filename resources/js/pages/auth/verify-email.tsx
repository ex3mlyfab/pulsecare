// Components
import { Form, Head, Link } from '@inertiajs/react';
import AuthStatusAlert from '@/components/auth-status-alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-6">
                    <AuthStatusAlert message="A new verification link has been sent to the email address you provided during registration." />
                </div>
            )}

            <div className="space-y-6">
                <Form {...send.form()} className="space-y-4 text-center">
                    {({ processing }) => (
                        <Button disabled={processing} className="w-full">
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>
                    )}
                </Form>

                <div className="border-t border-border/80 pt-4 text-center">
                    <Link
                        href={logout().url}
                        method="post"
                        as="button"
                        className="cursor-pointer text-sm font-semibold text-primary underline-offset-4 hover:text-primary/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Log out
                    </Link>
                </div>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Email verification',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
