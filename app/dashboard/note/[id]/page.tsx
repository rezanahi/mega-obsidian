"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Note } from "@/types"
import axios from "axios";
import NoteEditor from "@/components/NoteEditor";
import dynamic from "next/dynamic";
import {useEditNote} from "@/apis";
const MarkdownEditor = dynamic(
    () => import("@/components/MarkdownEditor"),
    { ssr: false }
);
export default function NotePage() {
    const { id } = useParams();
    const [note, setNote] = useState<Partial<Note> | null>(null);
    const [noteTitle, setNoteTitle] = useState<Note['title']>('')
    const [noteContent, setNoteContent] = useState<Note['content']>('')
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { mutate : updateNote } = useEditNote(String(id))

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSaving(true);
            updateNote({title: noteTitle || '', content: noteContent})
            setSaving(false)
        }, 800);

        return () => clearTimeout(timeout);
    }, [noteTitle, noteContent]);


    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await axios.get(`/api/notes/${id}`);

                setNote(res.data.note);
                setNoteTitle(res.data.note.title)
                setNoteContent(res.data.note.content)
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };

        fetchNote();
    }, [id]);

    if (loading) {
        return <div className="p-6 text-gray-400">در حال بارگذاری...</div>;
    }

    if (!note) {
        return <div className="p-6 text-red-400">نوت پیدا نشد</div>;
    }

    return (
        <div className="flex flex-col justify-start gap-3 h-full">

            <input
                value={noteTitle || ""}
                onChange={(e) =>
                    setNoteTitle(e.target.value)
                }
                className="text-3xl font-bold bg-transparent outline-none px-6 pt-6"
                placeholder="Untitled"
            />

            <div className="flex-1 px-6 pb-6 grow">
                <MarkdownEditor
                    value={noteContent}
                    onChange={(value) => setNoteContent(value)}
                    className={'h-full'}
                />
            </div>

        </div>
    )
}
