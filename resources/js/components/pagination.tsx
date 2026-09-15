import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type PaginationProps = {
    meta: PaginationMeta;
    /**
     * Resolve the index URL for a given page, merging any active filter query
     * params. Should produce a URL usable by Inertia Link.
     */
    resolveUrl: (page: number) => string;
    className?: string;
};

/**
 * Inertia-aware data-table pagination: prev/next + windowed page numbers.
 */
export function Pagination({ meta, resolveUrl, className }: PaginationProps) {
    const { current_page, last_page, per_page, total } = meta;

    if (last_page <= 1 && total === 0) {
        return null;
    }

    const from = total === 0 ? 0 : (current_page - 1) * per_page + 1;
    const to = Math.min(current_page * per_page, total);

    const pages = windowedPages(current_page, last_page);

    return (
        <div
            data-slot="pagination"
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <p className="text-muted-foreground text-xs tabular-nums">
                Showing {from}&ndash;{to} of {total}
            </p>

            <div className="flex items-center gap-1">
                <Button
                    asChild
                    variant="outline"
                    size="icon"
                    disabled={current_page <= 1}
                >
                    <Link
                        href={resolveUrl(current_page - 1)}
                        prefetch={current_page > 1}
                    >
                        <ChevronLeft className="size-4" />
                        <span className="sr-only">Previous page</span>
                    </Link>
                </Button>

                {pages.map((page, index) =>
                    page === null ? (
                        <span
                            key={`gap-${index}`}
                            className="text-muted-foreground px-2 text-xs tabular-nums"
                        >
                            &hellip;
                        </span>
                    ) : page === current_page ? (
                        <span
                            key={`current-${page}`}
                            className="border-sidebar-border bg-background inline-flex h-8 w-8 items-center justify-center rounded-sm border text-xs font-medium tabular-nums"
                        >
                            {page}
                        </span>
                    ) : (
                        <Button
                            asChild
                            key={`page-${page}`}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-xs tabular-nums"
                        >
                            <Link href={resolveUrl(page)} prefetch>
                                {page}
                            </Link>
                        </Button>
                    ),
                )}

                <Button
                    asChild
                    variant="outline"
                    size="icon"
                    disabled={current_page >= last_page}
                >
                    <Link
                        href={resolveUrl(current_page + 1)}
                        prefetch={current_page < last_page}
                    >
                        <ChevronRight className="size-4" />
                        <span className="sr-only">Next page</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}

/**
 * Build a windowed list of visible page numbers with gaps.
 *
 * @returns an array of page numbers and `null` gap sentinels
 */
function windowedPages(current: number, last: number): (number | null)[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | null)[] = [1];

    if (current > 3) {
        pages.push(null);
    }

    for (
        let page = Math.max(2, current - 1);
        page <= Math.min(last - 1, current + 1);
        page++
    ) {
        pages.push(page);
    }

    if (current < last - 2) {
        pages.push(null);
    }

    pages.push(last);

    return pages;
}
