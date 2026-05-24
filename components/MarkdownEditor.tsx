"use client";

import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function MarkdownEditor({ value, onChange, className = "" }: MarkdownEditorProps) {
    return (
        <div className="h-full w-full overflow-hidden">
            <CodeMirror
                value={value}
                onChange={onChange}
                extensions={[
                    markdown(),
                    EditorView.lineWrapping // مهم‌ترین بخش برای شکستن خطوط
                ]}
                basicSetup={{
                    lineNumbers: false,
                    foldGutter: false,
                    highlightActiveLine: false
                }}
                className={`obsidian-editor whitespace-pre-wrap break-words overflow-x-hidden ${className}`}
            />
        </div>
    );
}
