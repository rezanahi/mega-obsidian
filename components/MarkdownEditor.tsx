"use client";

import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { languages } from "@codemirror/language-data";

interface MarkdownEditor {
    value: string,
    onChange: (value: string) => void
    className?: string
}

export default function MarkdownEditor({ value, onChange, className='' } : MarkdownEditor) {
    return (
        <div className="h-full">
            {/*<CodeMirror*/}
            {/*    value={value}*/}
            {/*    height="100%"*/}
            {/*    theme={oneDark}*/}
            {/*    basicSetup={{*/}
            {/*        lineNumbers: true,*/}
            {/*        highlightActiveLine: true,*/}
            {/*        foldGutter: true,*/}
            {/*    }}*/}
            {/*    extensions={[*/}
            {/*        markdown({ base: markdownLanguage, codeLanguages: languages }),*/}
            {/*    ]}*/}
            {/*    onChange={(val) => onChange(val)}*/}
            {/*    className={`border border-gray-700 rounded-md ${className}`}*/}
            {/*/>*/}
            <CodeMirror
                value={value}
                onChange={onChange}
                extensions={[markdown()]}
                basicSetup={{
                    lineNumbers: false,
                    foldGutter: false,
                    highlightActiveLine: false
                }}
                className="obsidian-editor"
            />
        </div>
    );
}
