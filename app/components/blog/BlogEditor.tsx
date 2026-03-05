"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
// @ts-ignore
import draftToHtml from "draftjs-to-html";
// @ts-ignore
import htmlToDraft from "html-to-draftjs";
import {
  EditorState,
  ContentState,
  convertToRaw,
  RichUtils,
  Editor,
} from "draft-js";
// TODO: Install proper TypeScript types for 'draft-js' if available:
// Run: npm i --save-dev @types/draft-js
// Or add the following to a global .d.ts file to suppress TS error if types do not exist:
// declare module 'draft-js';

type BlockType =
  | "header-one"
  | "header-two"
  | "header-three"
  | "unordered-list-item"
  | "ordered-list-item"
  | "blockquote";

const BLOCK_TYPES: { label: string; style: BlockType }[] = [
  { label: "H1", style: "header-one" },
  { label: "H2", style: "header-two" },
  { label: "H3", style: "header-three" },
  { label: "• List", style: "unordered-list-item" },
  { label: "1. List", style: "ordered-list-item" },
  { label: "Quote", style: "blockquote" },
];

interface BlogEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function getInitialState(html: string): EditorState {
  if (!html || typeof html !== "string" || !html.trim()) {
    return EditorState.createEmpty();
  }
  // If content looks like HTML, parse it
  if (html.trim().startsWith("<")) {
    try {
      const { contentBlocks, entityMap } = htmlToDraft(html);
      if (contentBlocks && contentBlocks.length > 0) {
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        return EditorState.createWithContent(contentState);
      }
    } catch {
      // Fall through to plain text
    }
  }
  // Plain text fallback
  return EditorState.createWithContent(
    ContentState.createFromText(html)
  );
}

export default function BlogEditor({
  value,
  onChange,
  placeholder = "Write your blog content...",
  minHeight = "200px",
}: BlogEditorProps) {
  const [editorState, setEditorState] = useState<EditorState>(() =>
    EditorState.createEmpty()
  );
  const [mounted, setMounted] = useState(false);
  const lastEmittedRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync from parent value only when it changes externally (e.g. opening edit, reset)
  useEffect(() => {
    if (!mounted) return;
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    setEditorState(getInitialState(value));
  }, [value, mounted]);

  const handleChange = useCallback(
    (nextState: EditorState) => {
      setEditorState(nextState);
      const raw = convertToRaw(nextState.getCurrentContent());
      const html = draftToHtml(raw);
      lastEmittedRef.current = html;
      onChange(html);
    },
    [onChange]
  );

  const toggleInlineStyle = (style: string) => {
    handleChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType: string) => {
    handleChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const currentStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  if (!mounted || !Editor) {
    return (
      <div
        className="w-full p-3 border border-gray-300 rounded min-h-[200px] bg-gray-50 animate-pulse"
        style={{ minHeight }}
      >
        <div className="text-gray-400 text-sm">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t">
        {/* Inline styles - onMouseDown preventDefault keeps editor focus */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleInlineStyle("BOLD")}
          className={`px-2 py-1 text-sm font-semibold rounded hover:bg-gray-200 ${
            currentStyle.has("BOLD") ? "bg-blue-200 text-blue-800" : ""
          }`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleInlineStyle("ITALIC")}
          className={`px-2 py-1 text-sm italic rounded hover:bg-gray-200 ${
            currentStyle.has("ITALIC") ? "bg-blue-200 text-blue-800" : ""
          }`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleInlineStyle("UNDERLINE")}
          className={`px-2 py-1 text-sm underline rounded hover:bg-gray-200 ${
            currentStyle.has("UNDERLINE") ? "bg-blue-200 text-blue-800" : ""
          }`}
          title="Underline"
        >
          U
        </button>
        <span className="w-px h-6 bg-gray-300 mx-1" />
        {/* Block types */}
        {BLOCK_TYPES.map(({ label, style }) => (
          <button
            key={style}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleBlockType(style)}
            className={`px-2 py-1 text-xs rounded hover:bg-gray-200 ${
              blockType === style ? "bg-blue-200 text-blue-800" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Editor */}
      <div
        className="p-3 bg-white rounded-b overflow-auto"
        style={{ minHeight }}
      >
        <Editor
          editorState={editorState}
          onChange={handleChange}
          placeholder={placeholder}
          editorKey="blog-editor"
        />
      </div>
      <style jsx global>{`
        .DraftEditor-root {
          min-height: 1.5em;
          font-size: 1rem;
          line-height: 1.6;
        }
        .DraftEditor-editorContainer {
          outline: none;
        }
        .public-DraftEditor-content {
          min-height: 1.5em;
        }
        .public-DraftEditorPlaceholder-root {
          color: #9ca3af;
          position: absolute;
        }
        .DraftEditor-root .header-one {
          font-size: 1.875rem;
          font-weight: 700;
        }
        .DraftEditor-root .header-two {
          font-size: 1.5rem;
          font-weight: 600;
        }
        .DraftEditor-root .header-three {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .DraftEditor-root .blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
