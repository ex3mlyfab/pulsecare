import { CheckCircle2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AuthStatusAlert({
    message,
    className,
    ...props
}: HTMLAttributes<HTMLDivElement> & { message?: string }) {
    if (!message) {
        return null;
    }

    return (
        <div
            role="status"
            className={cn(
                'flex items-center gap-2.5 rounded-sm border border-stable-border bg-stable-surface p-3 text-sm font-medium text-stable shadow-layer-1',
                className,
            )}
            {...props}
        >
            <CheckCircle2 className="size-4 shrink-0 text-stable" />
            <span className="leading-snug">{message}</span>
        </div>
    );
}
