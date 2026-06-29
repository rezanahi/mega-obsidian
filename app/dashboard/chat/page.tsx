'use client'
import { Input } from 'antd';
import {useState} from "react";

const { TextArea } = Input;


export default function ChatPage () {

    const [prompt, setPrompt] = useState<string>('')

    function SendPromptHandler () {
        console.log('Enter Handled')
        setPrompt('')
    }

    return (
        <div className={'w-full h-full flex justify-center items-center'}>
            <section className={'max-w-[400px] w-full flex flex-col gap-6 justify-start items-center'}>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                    MegaBot
                </h1>
                <Input onPressEnter={() => SendPromptHandler()} placeholder={'Ask...'} className={'w-full'} autoFocus value={prompt} onChange={(e) => setPrompt(e.target.value)}></Input>
            </section>
        </div>
    )
}