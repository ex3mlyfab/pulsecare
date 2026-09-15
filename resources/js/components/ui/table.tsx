import { cn } from '@/lib/utils';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
    return (
        <div
            data-slot="table-container"
            className="border-sidebar-border relative w-full overflow-x-auto rounded-xl border shadow-layer-1"
        >
            <table
                data-slot="table"
                className="w-full caption-bottom border-collapse text-sm"
                {...props}
            />
        </div>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
    return (
        <thead
            data-slot="table-header"
            className={cn(
                'text-muted-foreground [&_tr]:border-b [&_tr]:border-sidebar-border/70 [&_tr:hover]:bg-transparent',
                className,
            )}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    return (
        <tbody
            data-slot="table-body"
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                'border-t border-sidebar-border bg-muted/50 font-medium [&>tr:last-child]>td[:last-child]:rounded-b-lg',
                className,
            )}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                'h-9 border-b border-sidebar-border/70 transition-colors hover:bg-accent/50 data-[state=selected]:bg-muted',
                className,
            )}
            {...props}
        />
    );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                'border-sidebar-border/70 bg-muted/40 p-3 text-left align-middle text-xs font-semibold tracking-wide text-muted-foreground uppercase [&:has([role=checkbox])]:pr-0 last:[&:has([role=checkbox])]:pl-0 last:[rounded-tl-lg] first:[rounded-tr-lg]',
                className,
            )}
            {...props}
        />
    );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                'p-3 align-middle text-sm [&:has([role=checkbox])]:pr-0 last:[rounded-bl-lg] first:[rounded-br-lg]',
                className,
            )}
            {...props}
        />
    );
}

function TableCaption({
    className,
    ...props
}: React.ComponentProps<'caption'>) {
    return (
        <caption
            data-slot="table-caption"
            className={cn('text-muted-foreground mt-3 text-sm', className)}
            {...props}
        />
    );
}

export {
    Table,
    TableBody,
    TableCaption,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
};
