"use client";
import {useEffect, useRef, useState} from "react";
import { useParams } from "next/navigation";
import { Note } from "@/types"
import axios from "axios";
import NoteEditor from "@/components/NoteEditor";
import dynamic from "next/dynamic";
import {useEditNote, useGetAllNotes, useGetNoteByTitle} from "@/apis";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import remarkWikiLink from 'remark-wiki-link';
import {EditOutlined, MoreOutlined, ReadOutlined, AudioOutlined  } from '@ant-design/icons';
import {RecordCircleIcon} from "@/components/icons"
import Link from "next/link";
const MarkdownEditor = dynamic(
    () => import("@/components/MarkdownEditor"),
    { ssr: false }
);
export default function NotePage() {
    const { id } = useParams();
    const isFirstRender = useRef(true)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const [note, setNote] = useState<Partial<Note> | null>(null);
    const [noteTitle, setNoteTitle] = useState<Note['title']>('')
    const [noteContent, setNoteContent] = useState<Note['content']>('')
    const [mode, setMode] = useState<"edit" | "preview">("edit");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [recording, setRecording] = useState<boolean>(false)
    const [audioBlob, setAudioBlob] = useState(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const { mutate : updateNote } = useEditNote(String(id))

    async function sendAudioToAPI(blob: Blob) {
        const file = new File([blob], "voice.webm", { type: "audio/webm" })

        const formData = new FormData()
        formData.append("audio", file)

        const res = await fetch("/api/audio-to-text", {
            method: "POST",
            body: formData,
        })

        const data = await res.json()
        console.log("AI text:", data.text)

        return data.text
    }

    async function startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

        const mediaRecorder = new MediaRecorder(stream)

        mediaRecorderRef.current = mediaRecorder
        chunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
            chunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" })
            const url = URL.createObjectURL(blob)

            setAudioUrl(url)

            console.log("Audio Blob:", blob)
        }

        mediaRecorder.start()
        setRecording(true)
    }

    async function stopRecording() {
        mediaRecorderRef.current?.stop()
        setRecording(false)
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const text = await sendAudioToAPI(blob)
        console.log("final text = ", text)
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        } else {
            const timeout = setTimeout(() => {
                setSaving(true);
                updateNote({title: noteTitle || '', content: noteContent})
                setSaving(false)
            }, 1500);
            return () => clearTimeout(timeout);
        }
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
        <div className="flex flex-col justify-start gap-3 h-full overflow-y-auto">
            <div className={`h-12 shrink-0 flex gap-1 justify-start items-center px-3 border-b border-gray-700`}>
                {
                    recording ?
                        <button
                            className="flex justify-between ml-auto items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
                            onClick={() => {
                                stopRecording()
                            }}
                        >
                            <RecordCircleIcon width={16} height={16} fill={"red"}></RecordCircleIcon>
                        </button>
                        : <button
                            className="flex justify-between ml-auto items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
                            onClick={() => {
                                startRecording()
                            }}
                        >
                            <AudioOutlined></AudioOutlined>
                        </button>
                }
                {
                    mode === 'edit' ?
                        <button
                            className="flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
                            onClick={() => setMode("preview")}
                        >
                            <ReadOutlined></ReadOutlined>
                        </button>
                        : mode === 'preview' &&
                        <button
                            className="flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
                            onClick={() => setMode("edit")}
                        >
                            <EditOutlined></EditOutlined>
                        </button>
                }
                <button
                    className="flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
                    onClick={() => console.log("more action")}
                >
                    <MoreOutlined></MoreOutlined>
                </button>
            </div>
            <input
                value={noteTitle || ""}
                onChange={(e) =>
                    setNoteTitle(e.target.value)
                }
                className="text-3xl font-bold bg-transparent outline-none px-6 pt-6"
                placeholder="Untitled"
            />

            <div className="flex-1 px-6 pb-6 grow">
                {
                    mode === 'edit' ?
                        <MarkdownEditor
                            value={noteContent}
                            onChange={(value) => setNoteContent(value)}
                            className={'h-full'}
                        /> :
                        <div className="prose prose-invert markdown max-w-none">
                            <ReactMarkdown
                                components={{
                                    a: ({node, ...props}) => {
                                        const href = String(props.href)?.split("/").slice(2).join('/');
                                        return (
                                            <Link href={href} prefetch={false}>
                                                {props.children}
                                            </Link>
                                        );
                                    },
                                }}
                                remarkPlugins={[
                                remarkGfm,
                                remarkBreaks,
                                [
                                    remarkWikiLink, {
                                    pageResolver: (name: string) => {
                                        return [`/dashboard/note/resolve/${name.trim()}`]
                                    }
                                }]
                            ]}>
                                {String(noteContent ?? '').replace(/^\t+/gm, "").replace(/^ {1,4}/gm, "").trimStart()}
                            </ReactMarkdown>
                        </div>
                }
            </div>

        </div>
    )
}
