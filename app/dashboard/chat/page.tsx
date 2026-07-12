'use client'
import { Input, Spin } from 'antd';
import {useEffect, useRef, useState} from "react";
import {ChatAvalAiApi, voiceToTextAvalAi} from "@/apis";
import Link from "next/link";
import {ArrowRightOutlined, AudioOutlined, LoadingOutlined} from "@ant-design/icons";
import {formatTime} from "@/utils/methods";
import {RecordCircleIcon} from "@/components/icons";
import type { InputRef } from "antd";


const { TextArea } = Input;


export default function ChatPage () {

    const [prompt, setPrompt] = useState<string>('')
    const [recording, setRecording] = useState<boolean>(false)
    const [recordTime, setRecordTime] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const textAreaRef = useRef<InputRef>(null);
    // Apis
    const { mutate: chatApi, isSuccess: chatApiSuccess, isPending: chatApiIsLoading, data: chatApiData } = ChatAvalAiApi()
    const { mutate : voiceToTextAvalAiMutate, data: voiceToTextAvalAiData, isSuccess: voiceToTextAvalAiIsSuccess, isPending: voiceToTextAvalAiIsPending, isError: voiceToTextAvalAiIsError } = voiceToTextAvalAi()

    function SendPromptHandler () {
        console.log('Enter Handled')
        chatApi({question: prompt})
        setPrompt('')
    }

    // Sync voice to text response with prompt state
    useEffect(() => {
        if (voiceToTextAvalAiIsSuccess && !!voiceToTextAvalAiData) {
            setPrompt(voiceToTextAvalAiData?.data?.text)
            requestAnimationFrame(() => {
                textAreaRef.current?.focus();
            });

        }
    }, [voiceToTextAvalAiIsSuccess, voiceToTextAvalAiData])

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

    return (
        <div className={'w-full h-full flex justify-center items-center'}>
            <section className={'max-w-[400px] w-full flex flex-col gap-6 justify-start items-center'}>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                    MegaBot
                </h1>
                <div className={'relative w-full'}>
                    <div className={'absolute z-50! bg-gray-600/20 flex justify-center items-center aspect-square rounded-md right-1 top-1'}>
                        {
                            voiceToTextAvalAiIsPending ?
                                <Spin indicator={<LoadingOutlined spin />} size={"small"}></Spin> :
                                recording ?
                                    <div className={'flex justify-start items-center gap-2 '}>
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
                    </div>
                    <TextArea
                        ref={textAreaRef}
                        disabled={chatApiIsLoading}
                        onPressEnter={() => SendPromptHandler()}
                        placeholder={'Ask...'}
                        className={'w-full text-wrap h-auto overflow-hidden pr-10!'}
                        autoFocus
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}>
                    </TextArea>
                </div>
                {
                    chatApiIsLoading ?
                        <Spin></Spin> :
                        (chatApiSuccess && chatApiData) &&
                        <div className={'bg-gray-800 rounded-md w-full h-auto p-2'}>
                            <p style={{ direction: 'rtl' }} className={'border-b border-gray-500 pb-4 mb-4 text-right'}>
                                {chatApiData?.data?.answer}
                            </p>
                            {
                                chatApiData?.data?.sources?.map(source => {
                                    return (
                                        <div className={`flex justify-start gap-4 items-center py-1`} key={source.id}>
                                            <Link className={'!text-gray-400/70'} href={`/dashboard/note/${source.id}`}>{source.title}</Link>
                                            <ArrowRightOutlined/>
                                        </div>
                                    )
                                })
                            }
                        </div>

                }
            </section>
        </div>
    )
}