"use client";
import {useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import {useGetNoteById} from "@/apis";
import {ArrowRightOutlined, EditOutlined} from "@ant-design/icons";


export default function ({children} : any) {
    const params = useParams();
    const hasId = !!params.id
    const router = useRouter();

    // Apis
    const { data: NoteData, isLoading: NoteIsLoading, isSuccess: NoteIsSuccess } = useGetNoteById({id: params?.id as string})

    return (
        <>
            <div className="flex flex-col justify-start gap-3 h-full overflow-y-auto relative">
                <div className={`h-24 !z-50 bg-transparent absolute top-0 left-0 right-0 flex justify-start items-center shrink-0 flex gap-1 justify-end items-center px-6`}>
                    <h3 className={'font-bold text-lg'}>Graph View</h3>
                    {hasId && NoteIsSuccess && <p> - {NoteData?.data?.note?.title}</p>}
                    {
                        hasId && NoteIsSuccess &&
                        <button
                            className="flex justify-between items-center rounded-md cursor-pointer ml-auto w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
                            onClick={() => {router.push(`/dashboard/graph`)}}
                        >
                            <ArrowRightOutlined></ArrowRightOutlined>
                        </button>
                    }
                </div>
                {children}
            </div>
        </>
    )
}