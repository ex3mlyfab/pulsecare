import * as React from "react"

import { cn } from "@/lib/utils"

export interface RichTextViewerProps {
    /** HTML string produced by RichTextEditor */
    value?: string | null
    /** Shown when value is empty / null / undefined */
    empty?: React.ReactNode
    /** Extra class names applied to the outer wrapper */
    className?: string
}

/**
 * RichTextViewer
 *
 * Read-only renderer for HTML content saved by `RichTextEditor`.
 * Applies the same PulseCare prose typography as the editor's editable area —
 * no Tiptap instance is created, so it is lightweight and safe to use in
 * tables, detail drawers, and anywhere a user-generated block of text must
 * be displayed.
 *
 * @example
 * <RichTextViewer value={patient.notes} empty="No notes recorded." />
 */
function RichTextViewer({ value, empty = "—", className }: RichTextViewerProps) {
    const isEmpty = !value || value.replace(/<[^>]*>/g, "").trim() === ""

    if (isEmpty) {
        return (
            <span
                data-slot="rich-text-viewer-empty"
                className={cn("text-[12px] text-[#64748B] italic", className)}
            >
                {empty}
            </span>
        )
    }

    return (
        <div
            data-slot="rich-text-viewer"
            className={cn(
                // Base typography — body-md from design system
                "text-[13px] leading-[18px] text-[#0F172A] font-[Inter,sans-serif]",

                // Headings
                "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-8 [&_h1]:tracking-[-0.015em] [&_h1]:mb-3",
                "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-7 [&_h2]:tracking-[-0.01em] [&_h2]:mb-2.5",
                "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:leading-6 [&_h3]:mb-2",

                // Paragraphs
                "[&_p]:mb-2 [&_p:last-child]:mb-0",

                // Lists
                "[&_ul]:mb-2 [&_ul]:pl-5 [&_ul]:list-disc",
                "[&_ol]:mb-2 [&_ol]:pl-5 [&_ol]:list-decimal",
                "[&_li]:mb-0.5",

                // Blockquote — teal left border matching primary
                "[&_blockquote]:border-l-2 [&_blockquote]:border-[#0D9488] [&_blockquote]:pl-3",
                "[&_blockquote]:text-[#334155] [&_blockquote]:italic [&_blockquote]:mb-2",

                // Inline code
                "[&_code]:font-mono [&_code]:text-xs [&_code]:bg-[#F1F5F9] [&_code]:text-[#334155]",
                "[&_code]:rounded [&_code]:px-1 [&_code]:py-px",

                // Links — teal, underlined
                "[&_a]:text-[#0D9488] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[#0F766E]",

                // Highlight
                "[&_mark]:bg-amber-100 [&_mark]:text-amber-900 [&_mark]:rounded-sm [&_mark]:px-0.5",

                // HR
                "[&_hr]:border-[#E2E8F0] [&_hr]:my-4",

                // Strong / em
                "[&_strong]:font-semibold",

                className,
            )}
            // Safe: content is produced by our own Tiptap editor (no arbitrary user HTML).
            // If you ever accept content from untrusted sources, sanitise with DOMPurify first.
            dangerouslySetInnerHTML={{ __html: value }}
        />
    )
}

export { RichTextViewer }
