'use client';

import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { Placeholder } from '@tiptap/extensions';
import {
  Bold, Code, Code2, Heading2, Heading3, Italic, Link2, List, ListOrdered, Minus, Pilcrow, Quote, Redo2, Strikethrough, Undo2, Unlink,
} from 'lucide-react';

/*
 * WYSIWYG editor for long-form content. It reads and writes Markdown, so the
 * stored value (and the website's renderer) stay exactly as before.
 */

type Mode = 'visual' | 'markdown';

function ToolButton({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30 ${active ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />;

function Toolbar({ editor }: { editor: Editor }) {
  // Re-render the toolbar when the selection or formatting changes.
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      p: e.isActive('paragraph'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      link: e.isActive('link'),
      ul: e.isActive('bulletList'),
      ol: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const previous = (editor.getAttributes('link').href as string | undefined) ?? '';
    const url = window.prompt('Link URL (e.g. /services/web-development or https://…)', previous);
    if (url === null) return;
    if (!url.trim()) return chain().extendMarkRange('link').unsetLink().run();
    chain().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <ToolButton label="Paragraph" active={s.p} onClick={() => chain().setParagraph().run()}><Pilcrow className="h-4 w-4" /></ToolButton>
      <ToolButton label="Heading (shows in “On this page”)" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></ToolButton>
      <ToolButton label="Sub-heading" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></ToolButton>
      <Divider />
      <ToolButton label="Bold" active={s.bold} onClick={() => chain().toggleBold().run()}><Bold className="h-4 w-4" /></ToolButton>
      <ToolButton label="Italic" active={s.italic} onClick={() => chain().toggleItalic().run()}><Italic className="h-4 w-4" /></ToolButton>
      <ToolButton label="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></ToolButton>
      <ToolButton label="Inline code" active={s.code} onClick={() => chain().toggleCode().run()}><Code className="h-4 w-4" /></ToolButton>
      <ToolButton label={s.link ? 'Edit link' : 'Add link'} active={s.link} onClick={setLink}><Link2 className="h-4 w-4" /></ToolButton>
      {s.link && <ToolButton label="Remove link" onClick={() => chain().extendMarkRange('link').unsetLink().run()}><Unlink className="h-4 w-4" /></ToolButton>}
      <Divider />
      <ToolButton label="Bullet list" active={s.ul} onClick={() => chain().toggleBulletList().run()}><List className="h-4 w-4" /></ToolButton>
      <ToolButton label="Numbered list" active={s.ol} onClick={() => chain().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></ToolButton>
      <ToolButton label="Quote" active={s.quote} onClick={() => chain().toggleBlockquote().run()}><Quote className="h-4 w-4" /></ToolButton>
      <ToolButton label="Code block" active={s.codeBlock} onClick={() => chain().toggleCodeBlock().run()}><Code2 className="h-4 w-4" /></ToolButton>
      <ToolButton label="Divider line" onClick={() => chain().setHorizontalRule().run()}><Minus className="h-4 w-4" /></ToolButton>
      <Divider />
      <ToolButton label="Undo" disabled={!s.canUndo} onClick={() => chain().undo().run()}><Undo2 className="h-4 w-4" /></ToolButton>
      <ToolButton label="Redo" disabled={!s.canRedo} onClick={() => chain().redo().run()}><Redo2 className="h-4 w-4" /></ToolButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder = 'Start writing…' }: { value: string; onChange: (markdown: string) => void; placeholder?: string }) {
  const [mode, setMode] = useState<Mode>('visual');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Underline has no Markdown form; the website renders the rest.
        underline: false,
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } },
      }),
      Markdown,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    contentType: 'markdown',
    editorProps: { attributes: { class: 'twh-editor min-h-[420px] px-5 py-4 outline-none' } },
    onUpdate: ({ editor: e }) => onChange(e.getMarkdown()),
  });

  // Keep the editor in sync when the value changes from outside (discard, AI fill, reload).
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (editor.getMarkdown() !== value) editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false });
  }, [editor, value]);

  const words = value.split(/\s+/).filter(Boolean).length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/95 px-2 py-1.5 backdrop-blur">
        {mode === 'visual' && editor ? <Toolbar editor={editor} /> : <span className="px-2 text-[12px] text-slate-500">Markdown: ## heading, - list, **bold**, [link](url)</span>}
        <div className="flex rounded-lg bg-white p-0.5 ring-1 ring-slate-200">
          {(['visual', 'markdown'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                if (m === 'visual' && editor) editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false });
                setMode(m);
              }}
              className={`rounded-md px-3 py-1 text-[12px] font-semibold capitalize ${mode === m ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'visual' ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={22} className="block min-h-[420px] w-full resize-y p-4 font-mono text-[13px] leading-relaxed outline-none" />
      )}

      <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-[11.5px] text-slate-400">
        {words} words · ~{Math.max(1, Math.round(words / 220))} min read
      </div>
    </div>
  );
}
