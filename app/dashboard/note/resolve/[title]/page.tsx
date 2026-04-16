"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {useAddNote, useGetNoteByTitle} from "@/apis";
import { use } from "react";
import { Spin } from "antd";



export default function ResolveNotePage({ params }: { params: Promise<{ title: string }> }) {
    const router = useRouter();
    let { title } = use(params);
    title = title.replaceAll("%20", " ")
    const {
        isLoading: getNoteByTitleIsLoading,
        data: getNoteByTitleData,
        isSuccess: getNoteByTitleIsSuccess,
        isError: getNoteByTitleIsError ,
    } = useGetNoteByTitle(title)
    const { mutateAsync: addNote } = useAddNote()


    useEffect(() => {
        if (getNoteByTitleIsLoading) return
        if (getNoteByTitleIsSuccess) {
            console.log("Find note and navigate to it")
            return router.push(`/dashboard/note/${getNoteByTitleData.data.note.id}`)
        }
        if (getNoteByTitleIsError) {
            (async () => {
                console.log('dont found note and create it');
                await createNote()
            })()
        }
    }, [getNoteByTitleIsLoading, getNoteByTitleIsSuccess, getNoteByTitleIsError])

    const createNote = async () => {
        try {
            console.log("Create note func - title = ", title)
            const newNote = await addNote({title: title})
            console.log("newNote = ", newNote)
            router.push(`/dashboard/note/${newNote.id}`)
        } catch (err) {

        }
    }

    return (
        <div className="flex w-full h-full">
            <div className="flex-1 flex items-center justify-center text-gray-400">
                <Spin></Spin>
            </div>
        </div>
    );
}
