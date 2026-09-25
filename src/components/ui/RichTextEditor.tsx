'use client';

import React, { useRef, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Palette, Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

const BLOCK_OPTIONS = [
  { label: 'Paragraph', value: 'P' },
  { label: 'Heading 1', value: 'H1' },
  { label: 'Heading 2', value: 'H2' },
  { label: 'Heading 3', value: 'H3' },
  { label: 'Heading 4', value: 'H4' },
  { label: 'Heading 5', value: 'H5' },
  { label: 'Heading 6', value: 'H6' },
];

const COLOR_SWATCHES = ['#0f172a', '#dc2626', '#d97706', '#16a34a', '#2563eb', '#7c3aed', '#db2777'];

// Lightweight contentEditable rich text editor — no external editor
// dependency. Uncontrolled by design (like a native textarea): the initial
// HTML is set once via dangerouslySetInnerHTML and never fed back in on
// re-render, so typing never fights React for the caret position. A hidden
// input mirrors the live HTML so it travels through the surrounding
// <form>'s FormData like any other field.
export function RichTextEditor({ name, defaultValue = '', placeholder, required, className, id }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [html, setHtml] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange();
      }
    }
  }

  function restoreSelection() {
    if (!savedRange.current) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange.current);
  }

  function exec(command: string, value?: string) {
    setColorMenuOpen(false);
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    setHtml(editorRef.current?.innerHTML ?? '');
    saveSelection();
  }

  function handleInput() {
    setHtml(editorRef.current?.innerHTML ?? '');
  }

  function handleLink() {
    const url = window.prompt('Enter URL');
    if (url) exec('createLink', url);
  }

  function handleBlockChange(e: React.ChangeEvent<HTMLSelectElement>) {
    exec('formatBlock', `<${e.target.value.toLowerCase()}>`);
  }

  function handleColorPick(color: string) {
    exec('foreColor', color);
    setColorMenuOpen(false);
  }

  const isEmpty = !html || html === '<br>';

  return (
    <div
      className={cn(
        'rounded-lg border border-input bg-transparent transition-colors overflow-hidden',
        focused && 'border-ring ring-3 ring-ring/50',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-slate-50 px-1.5 py-1 dark:bg-input/30">
        <select
          onMouseDown={saveSelection}
          onChange={handleBlockChange}
          defaultValue="P"
          className="h-6 rounded border border-slate-200 bg-white px-1 text-[12px] text-slate-600 outline-none hover:bg-slate-100"
        >
          {BLOCK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <span className="mx-1 h-4 w-px bg-slate-200" />
        <ToolbarButton icon={Bold} label="Bold" onClick={() => exec('bold')} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => exec('italic')} />
        <ToolbarButton icon={Underline} label="Underline" onClick={() => exec('underline')} />

        <span className="mx-1 h-4 w-px bg-slate-200" />
        <div className="relative">
          <button
            type="button"
            title="Font color"
            aria-label="Font color"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setColorMenuOpen((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          >
            <Palette className="h-3.5 w-3.5" />
          </button>
          {colorMenuOpen && (
            <div className="absolute top-full left-0 z-10 mt-1 flex gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-md">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleColorPick(color)}
                  className="h-4.5 w-4.5 rounded-full ring-1 ring-slate-200 ring-offset-1 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        <span className="mx-1 h-4 w-px bg-slate-200" />
        <ToolbarButton icon={List} label="Bullet list" onClick={() => exec('insertUnorderedList')} />
        <ToolbarButton icon={ListOrdered} label="Numbered list" onClick={() => exec('insertOrderedList')} />

        <span className="mx-1 h-4 w-px bg-slate-200" />
        <ToolbarButton icon={LinkIcon} label="Insert link" onClick={handleLink} />

        <span className="mx-1 h-4 w-px bg-slate-200" />
        <ToolbarButton icon={Undo2} label="Undo" onClick={() => exec('undo')} />
        <ToolbarButton icon={Redo2} label="Redo" onClick={() => exec('redo')} />
      </div>
      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute left-2.5 top-1.5 text-[13px] text-muted-foreground">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          id={id}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setColorMenuOpen(false);
          }}
          className="prose-sm min-h-24 max-w-none px-2.5 py-1.5 text-[13px] outline-none [&_a]:text-violet-600 [&_a]:underline [&_h1]:mt-1 [&_h1]:mb-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-800 [&_h2]:mt-1 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-800 [&_h3]:mt-1 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h4]:mt-1 [&_h4]:mb-1 [&_h4]:text-[13px] [&_h4]:font-semibold [&_h5]:mt-1 [&_h5]:mb-1 [&_h5]:text-[13px] [&_h5]:font-medium [&_h6]:mt-1 [&_h6]:mb-1 [&_h6]:text-[12px] [&_h6]:font-medium [&_h6]:uppercase [&_h6]:tracking-wide [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: defaultValue }}
        />
      </div>
      <input type="hidden" name={name} value={html} required={required} readOnly />
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
