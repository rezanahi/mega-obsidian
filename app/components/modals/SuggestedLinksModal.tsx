import {Input, Modal} from "antd";
import {useAppDispatch} from "@/app/store/hooks";
import {closeModal} from "@/app/store/slices/modalSlice";
import {useEffect, useState} from "react";
import {useEditNoteTitle, useGetSuggestedLinks} from "@/apis";
import {SimilarityScore} from "@/app/components/atom/SimilarityScore";


interface SuggestedLinksModalProps {
    noteId: string
    noteTitle: string
}

export const SuggestedLinksModal = ({noteId, noteTitle} : SuggestedLinksModalProps) => {
    const dispatch = useAppDispatch()
    const [newNoteTitle, setNewNoteTitle] = useState<string>(noteTitle || '')
    // Apis
    const { data: embeddingData, isLoading: embeddingIsLoading, isSuccess: embeddingIsSuccess} = useGetSuggestedLinks({id: noteId})

    return (
        <>
            <Modal

                loading={embeddingIsLoading}
                open={true}
                title={`Suggested Links`}
                footer={null}
                onCancel={() => dispatch(closeModal())}
            >
                <div className={`flex flex-col justify-start items-start gap-2`}>
                    {
                        (embeddingIsSuccess && embeddingData.length === 0) ?
                            <p>There is no suggested note !</p> :
                            embeddingData?.map((link: any) => {
                                return (
                                    <div key={link.id} className={`w-full flex justify-start items-center gap-2`}>
                                        <SimilarityScore score={Number(String(link.score * 100).split('.')[0])}></SimilarityScore>
                                        <p className={'truncate'}>{link.title}</p>
                                        <button className={`ml-auto shrink-0 flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200`}>
                                            Add Link
                                        </button>
                                    </div>
                                )
                            })
                    }
                </div>
            </Modal>
        </>
    )
}