import * as React from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Color from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import {
    BoldIcon,
    ItalicIcon,
    UnderlineIcon,
    StrikethroughIcon,
    AlignLeftIcon,
    AlignCenterIcon,
    AlignRightIcon,
    AlignJustifyIcon,
    ListIcon,
    ListOrderedIcon,
    QuoteIcon,
    CodeIcon,
    Undo2Icon,
    Redo2Icon,
    LinkIcon,
    HighlighterIcon,
    RemoveFormattingIcon,
    Heading2Icon,
    Heading3Icon,
    Heading1Icon,
    SeparatorHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RichTextEditorProps {
    /** Controlled HTML value */
    value?: string
    /** Default HTML value (uncontrolled) */
    defaultValue?: string
    /** Called whenever the content changes; receives the HTML string */
    onChange?: (html: string) => void
    /** Placeholder shown when the editor is empty */
    placeholder?: string
    /** Disable the entire editor */
    disabled?: boolean
    /** Extra class names applied to the outer wrapper */
    className?: string
    /** Min height of the editable area (Tailwind class, e.g. "min-h-48") */
    minHeight?: string
    /** Hide the formatting toolbar */
    hideToolbar?: boolean
}

// ─── Toolbar button ────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    tooltip: string
    children: React.ReactNode
}

function ToolbarButton({ onClick, active = false, disabled = false, tooltip, children }: ToolbarButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle
                    size="sm"
                    pressed={active}
                    onPressedChange={() => onClick()}
                    disabled={disabled}
                    aria-label={tooltip}
                    className="size-7 rounded"
                >
                    {children}
                </Toggle>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    )
}

// ─── Toolbar ───────────────────────────────────────────────────────────────────

function RichTextToolbar({ editor }: { editor: Editor | null }) {
    const setLink = React.useCallback(() => {
        if (!editor) { return }
        const previousUrl = editor.getAttributes("link").href as string | undefined
        const url = window.prompt("Link URL", previousUrl ?? "https://")
        if (url === null) { return }
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }, [editor])

    if (!editor) { return null }

    const iconSize = "size-3.5"

    return (
        <div
            data-slot="rich-text-toolbar"
            className="flex flex-wrap items-center gap-0.5 border-b border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1.5"
        >
            {/* History */}
            <ToolbarButton
                tooltip="Undo (Ctrl+Z)"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                <Undo2Icon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Redo (Ctrl+Y)"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                <Redo2Icon className={iconSize} />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Headings */}
            <ToolbarButton
                tooltip="Heading 1"
                active={editor.isActive("heading", { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <Heading1Icon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Heading 2"
                active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2Icon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Heading 3"
                active={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <Heading3Icon className={iconSize} />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Inline marks */}
            <ToolbarButton
                tooltip="Bold (Ctrl+B)"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <BoldIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Italic (Ctrl+I)"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <ItalicIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Underline (Ctrl+U)"
                active={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <UnderlineIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Strikethrough"
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <StrikethroughIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Inline code"
                active={editor.isActive("code")}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <CodeIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Highlight"
                active={editor.isActive("highlight")}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
                <HighlighterIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Link"
                active={editor.isActive("link")}
                onClick={setLink}
            >
                <LinkIcon className={iconSize} />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Text alignment */}
            <ToolbarButton
                tooltip="Align left"
                active={editor.isActive({ textAlign: "left" })}
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
                <AlignLeftIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Align center"
                active={editor.isActive({ textAlign: "center" })}
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
                <AlignCenterIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Align right"
                active={editor.isActive({ textAlign: "right" })}
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
                <AlignRightIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Justify"
                active={editor.isActive({ textAlign: "justify" })}
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            >
                <AlignJustifyIcon className={iconSize} />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Blocks */}
            <ToolbarButton
                tooltip="Bullet list"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <ListIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Ordered list"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrderedIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Blockquote"
                active={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <QuoteIcon className={iconSize} />
            </ToolbarButton>
            <ToolbarButton
                tooltip="Horizontal rule"
                active={false}
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <SeparatorHorizontalIcon className={iconSize} />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Clear */}
            <ToolbarButton
                tooltip="Clear formatting"
                active={false}
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            >
                <RemoveFormattingIcon className={iconSize} />
            </ToolbarButton>
        </div>
    )
}

// ─── Main component ────────────────────────────────────────────────────────────

/**
 * RichTextEditor
 *
 * A Tiptap-powered WYSIWYG editor styled to the PulseCare design system.
 * Supports controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) usage.
 *
 * @example
 * // Controlled
 * <RichTextEditor value={html} onChange={setHtml} placeholder="Add notes…" />
 *
 * // Uncontrolled
 * <RichTextEditor defaultValue="<p>Hello</p>" />
 */
function RichTextEditor({
    value,
    defaultValue = "",
    onChange,
    placeholder = "Write something…",
    disabled = false,
    className,
    minHeight = "min-h-48",
    hideToolbar = false,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({ placeholder }),
            Link.configure({ openOnClick: false }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: false }),
        ],
        content: value ?? defaultValue,
        editable: !disabled,
        onUpdate({ editor }) {
            onChange?.(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: cn(
                    // Sizing & scroll
                    "w-full px-4 py-3 focus:outline-none overflow-y-auto",
                    minHeight,
                    // Typography — body-md from design system
                    "text-[13px] leading-[18px] text-[#0F172A] font-[Inter,sans-serif]",
                    // Prose formatting
                    [
                        // Headings
                        "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-8 [&_h1]:tracking-[-0.015em] [&_h1]:mb-3",
                        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-7 [&_h2]:tracking-[-0.01em] [&_h2]:mb-2.5",
                        "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:leading-6 [&_h3]:mb-2",
                        // Paragraph
                        "[&_p]:mb-2 [&_p:last-child]:mb-0",
                        // Lists
                        "[&_ul]:mb-2 [&_ul]:pl-5 [&_ul]:list-disc",
                        "[&_ol]:mb-2 [&_ol]:pl-5 [&_ol]:list-decimal",
                        "[&_li]:mb-0.5",
                        // Blockquote
                        "[&_blockquote]:border-l-2 [&_blockquote]:border-[#0D9488] [&_blockquote]:pl-3 [&_blockquote]:text-[#334155] [&_blockquote]:italic [&_blockquote]:mb-2",
                        // Inline code
                        "[&_code]:font-mono [&_code]:text-xs [&_code]:bg-[#F1F5F9] [&_code]:text-[#334155] [&_code]:rounded [&_code]:px-1 [&_code]:py-px",
                        // Links
                        "[&_a]:text-[#0D9488] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[#0F766E]",
                        // Highlight
                        "[&_mark]:bg-amber-100 [&_mark]:text-amber-900 [&_mark]:rounded-sm [&_mark]:px-0.5",
                        // HR
                        "[&_hr]:border-[#E2E8F0] [&_hr]:my-4",
                        // Strong / em
                        "[&_strong]:font-semibold",
                    ].join(" "),
                ),
            },
        },
    })

    // Sync external `value` changes into the editor (controlled mode)
    React.useEffect(() => {
        if (!editor || value === undefined) { return }
        if (editor.getHTML() !== value) {
            editor.commands.setContent(value, { emitUpdate: false })
        }
    }, [editor, value])

    // Toggle editable when `disabled` changes
    React.useEffect(() => {
        editor?.setEditable(!disabled)
    }, [editor, disabled])

    return (
        <TooltipProvider>
            <div
                data-slot="rich-text-editor"
                className={cn(
                    // Layer 1 card surface from design system
                    "rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]",
                    "overflow-hidden transition-[border-color,box-shadow]",
                    // Focus-within ring — teal, zero spread
                    "focus-within:border-[#0D9488]",
                    disabled && "cursor-not-allowed opacity-60",
                    className,
                )}
            >
                {!hideToolbar && <RichTextToolbar editor={editor} />}

                <EditorContent
                    editor={editor}
                    className={cn(disabled && "pointer-events-none")}
                />
            </div>
        </TooltipProvider>
    )
}

export { RichTextEditor }
