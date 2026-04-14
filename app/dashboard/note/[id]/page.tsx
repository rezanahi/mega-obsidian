"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Note } from "@/types"
import axios from "axios";
import NoteEditor from "@/components/NoteEditor";

export default function NotePage() {
    const { id } = useParams();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await axios.get(`/api/notes/${id}`);

                setNote(res.data.note);
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

    return <NoteEditor note={note} />;
}
