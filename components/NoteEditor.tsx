"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {message} from "antd";
import {useEditNote} from "@/apis";

type Props = {
    note: {
        id: number;
        title: string | null;
        content: string;
    };
};

export default function NoteEditor({ note }: Props) {
    const [title, setTitle] = useState(note.title ?? "");
    const [content, setContent] = useState(note.content);
    const [saving, setSaving] = useState(false);
    const { mutate : updateNote } = useEditNote(String(note.id))

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSaving(true);
            updateNote({title: title || '', content: content})
            setSaving(false)
        }, 800);

        return () => clearTimeout(timeout);
    }, [title, content]);



    return (
        <div className="h-full flex flex-col p-6 gap-4">
            <input
                className="bg-transparent text-2xl font-semibold outline-none text-gray-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان..."
            />

            <textarea
                className="flex-1 bg-transparent resize-none outline-none text-gray-300 leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="شروع به نوشتن کن..."
            />

            {saving && (
                <div className="text-sm text-gray-400">در حال ذخیره...</div>
            )}
        </div>
    );
}
