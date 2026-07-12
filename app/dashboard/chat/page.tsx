'use client'
import { Input, Spin } from 'antd';
import {useState} from "react";
import {ChatAvalAiApi} from "@/apis";
import Link from "next/link";
import {ArrowRightOutlined} from "@ant-design/icons";


const { TextArea } = Input;


export default function ChatPage () {

    const [prompt, setPrompt] = useState<string>('')

    // Apis
    const { mutate: chatApi, isSuccess: chatApiSuccess, isPending: chatApiIsLoading, data: chatApiData } = ChatAvalAiApi()

    function SendPromptHandler () {
        console.log('Enter Handled')
        chatApi({question: prompt})
        setPrompt('')
    }

    return (
        <div className={'w-full h-full flex justify-center items-center'}>
            <section className={'max-w-[400px] w-full flex flex-col gap-6 justify-start items-center'}>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                    MegaBot
                </h1>
                <TextArea
                    disabled={chatApiIsLoading}
                    onPressEnter={() => SendPromptHandler()}
                    placeholder={'Ask...'}
                    className={'w-full text-wrap h-auto overflow-hidden'}
                    autoFocus
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}>
                </TextArea>
                {
                    chatApiIsLoading ?
                        <Spin></Spin> :
                        (chatApiSuccess && chatApiData) &&
                        <div className={'bg-gray-800 rounded-md w-full h-auto p-2'}>
                            <p className={'border-b border-gray-500 pb-4 mb-4'}>
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