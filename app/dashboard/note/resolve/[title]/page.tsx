"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {useGetNoteByTitle} from "@/apis";
import { use } from "react";
import { Spin } from "antd";



export default function ResolveNotePage({ params }: { params: Promise<{ title: string }> }) {
    const router = useRouter();
    const { title } = use(params);
    const {isLoading: getNoteByTitleIsLoading, data: getNoteByTitleData} = useGetNoteByTitle(title)

    useEffect(() => {
        if (getNoteByTitleData?.data?.status === 'success') {
           router.push(`/dashboard/note/${getNoteByTitleData.data.note.id}`)
        } else {
            // Create New Note

        }
    }, [getNoteByTitleData])

    return (
        <div className="flex w-full h-full">
            <div className="flex-1 flex items-center justify-center text-gray-400">
                <Spin></Spin>
            </div>
        </div>
    );
}
