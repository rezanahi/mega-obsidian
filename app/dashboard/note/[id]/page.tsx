"use client";
import {useEffect, useRef, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import { Note } from "@/types"
import axios from "axios";
import NoteEditor from "@/components/NoteEditor";
import dynamic from "next/dynamic";
import { setNoteContent, setNoteTitle } from "@/app/store/slices/noteSlice";
import {
    useEditNote,
    useGetAllBacklinks,
    useGetAllNotes, useGetSuggestedLinks,
    useGetNoteByTitle,
    voiceToTextAvalAi
} from "@/apis";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import remarkWikiLink from 'remark-wiki-link';
import {
    EditOutlined,
    MoreOutlined,
    ReadOutlined,
    AudioOutlined,
    LoadingOutlined,
    NodeIndexOutlined, ArrowRightOutlined, BulbOutlined
} from '@ant-design/icons';
import {RecordCircleIcon} from "@/components/icons"
import Link from "next/link";
import {Spin} from "antd";
import {formatTime} from "@/utils/methods";
import {useAppDispatch, useAppSelector} from "@/app/store/hooks";
import {openModal} from "@/app/store/slices/modalSlice";
const MarkdownEditor = dynamic(
    () => import("@/components/MarkdownEditor"),
    { ssr: false }
);
export default function NotePage() {
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch()
    const isFirstRender = useRef(true)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const [note, setNote] = useState<Partial<Note> | null>(null);
    // const [noteTitle, setNoteTitle] = useState<Note['title']>('')
    const noteTitle = useAppSelector(state => state.note.noteTitle)
    // const [noteContent, setNoteContent] = useState<Note['content']>('')
    const noteContent = useAppSelector(state => state.note.noteContent)
    const [mode, setMode] = useState<"edit" | "preview">("edit");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [recording, setRecording] = useState<boolean>(false)
    const [recordTime, setRecordTime] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const { mutate : updateNote } = useEditNote(String(id))
    const { mutate : voiceToTextAvalAiMutate, data: voiceToTextAvalAiData, isSuccess: voiceToTextAvalAiIsSuccess, isPending: voiceToTextAvalAiIsPending, isError: voiceToTextAvalAiIsError } = voiceToTextAvalAi()
    const { data: backlinksData, isSuccess: backlinksIsSuccess, isLoading: backlinksIsLoading } = useGetAllBacklinks({id: id as string})

    // useEffect(() => {
    //     if (voiceToTextIsSuccess) console.log("voiceToTextData = ", voiceToTextData)
    //     if (voiceToTextData?.data?.text) {
    //         setNoteContent(prev => {
    //             const newContent = (prev || "") + "\n" + voiceToTextData?.data?.text
    //             return newContent
    //         })
    //     }
    // }, [voiceToTextData])

    // Add api response to end of contents of notes
    useEffect(() => {
        console.log("==============================")
        if (voiceToTextAvalAiIsSuccess) console.log("voiceToTextData = ", voiceToTextAvalAiData)
        if (voiceToTextAvalAiIsSuccess) {
            dispatch(setNoteContent((noteContent || "") + "\n" + voiceToTextAvalAiData?.data?.text))
        }
    }, [voiceToTextAvalAiData, voiceToTextAvalAiIsSuccess])
    async function sendAudioToAPI(blob: Blob) {
        const file = new File([blob], "voice.webm", { type: "audio/webm" })

        const formData = new FormData()
        formData.append("audio", file)

        // const res = await fetch("/api/audio-to-text", {
        //     method: "POST",
        //     body: formData,
        // })
        console.log("YOHAHA = ", file)
        voiceToTextAvalAiMutate(file)

        // const data = voiceToTextData
        // console.log("AI text:", data.text)

        // return data.text
    }

    async function startRecording() {
        // اگر تایمر قبلی هنوز فعال است، پاکش کن
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        chunksRef.current = []
        mediaRecorder.ondataavailable = (event) => {
            chunksRef.current.push(event.data)
        }
        mediaRecorder.onstop = async () => {
            // ساخت Blob واقعی بعد از اینکه Recorder کامل داده‌ها را جمع کرد
            const blob = new Blob(chunksRef.current, { type: "audio/webm" })
            console.log("Recorded Blob:", blob, "size:", blob.size)
            // اگر size=0 → یعنی میکروفن mute، یا start/stop خیلی سریع
            // const text = await sendAudioToAPI(blob)
            sendAudioToAPI(blob)
            // if (text) {
            //     setNoteContent(prev => {
            //         const newContent = (prev || "") + "\n" + text
            //         return newContent
            //     })
            // }
        }
        mediaRecorder.start()
        setRecording(true)
        setRecordTime(0)
        timerRef.current = setInterval(() => {
            setRecordTime(prev => prev + 1)
        }, 1000)
    }

    async function stopRecording() {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop()
        }
        setRecording(false)
        if (timerRef.current) {
            console.log("=== I Deleted It ===")
            clearInterval(timerRef.current)
        }
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
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [noteTitle, noteContent]);


    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await axios.get(`/api/notes/${id}`);

                setNote(res.data.note);
                dispatch(setNoteTitle(res.data.note.title))
                dispatch(setNoteContent(res.data.note.content))
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
            <div className={`h-12 sticky top-0 bg-[#252526] shrink-0 flex gap-1 justify-end items-center px-3 border-b border-gray-700`}>
                {
                    voiceToTextAvalAiIsPending ?
                        <Spin indicator={<LoadingOutlined spin />} size={"small"}></Spin> :
                    recording ?
                        <div className={'flex justify-start items-center gap-2 '}>
                            <div className={'flex justify-start gap-4 items-center'}>
                                <p>Recording...</p>
                                <p className={''}>{formatTime(recordTime)}</p>
                            </div>
                            <button
                                className="flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
                                onClick={() => {
                                    stopRecording()
                                }}
                            >
                                <RecordCircleIcon width={16} height={16} fill={"red"}></RecordCircleIcon>
                            </button>
                        </div>
                        : <button
                            className="flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
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
                    onClick={() => {router.push(`/dashboard/graph/${id}`)}}
                    className="flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200">
                    <NodeIndexOutlined />
                </button>
                <button
                    onClick={() => {dispatch(openModal({
                        modalType: 'SuggestedLinksModal',
                        modalProps: {noteId: id}
                    }))}}
                    className="flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200">
                    <BulbOutlined />
                </button>
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
                    dispatch(setNoteTitle(e.target.value))
                }
                className="text-3xl font-bold bg-transparent outline-none px-6 pt-6"
                placeholder="Untitled"
            />

            <div className="flex-1 px-6 pb-6 grow">
                {
                    mode === 'edit' ?
                        <MarkdownEditor
                            value={noteContent}
                            onChange={(value) => dispatch(setNoteContent(value))}
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
            {
                backlinksIsSuccess && !!backlinksData?.backlinks?.length &&
                <div className={'h-auto pb-8 shrink-0 border-t border-gray-500/50 pt-4 mx-8'}>
                    <h3 className={'text-gray-300/80'}>Backlinks : </h3>
                    {
                        backlinksData?.backlinks?.map((bl : any) => {
                            return (
                                <div className={`flex justify-start gap-4 items-center text-gray-400/70`} key={bl.id}>
                                    <Link href={`/dashboard/note/${bl.id}`}>{bl.title}</Link>
                                    <ArrowRightOutlined />
                                </div>
                            )
                        })
                    }
                </div>
            }
        </div>
    )
}
