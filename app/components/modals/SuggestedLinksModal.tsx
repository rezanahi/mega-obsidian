import {Input, Modal} from "antd";
import {useAppDispatch, useAppSelector} from "@/app/store/hooks";
import {closeModal} from "@/app/store/slices/modalSlice";
import {useEffect, useState} from "react";
import {useEditNoteTitle, useGetSuggestedLinks} from "@/apis";
import {SimilarityScore} from "@/app/components/atom/SimilarityScore";
import {setNoteContent} from "@/app/store/slices/noteSlice";
import {extractWikiLinks} from "@/utils/methods";


interface SuggestedLinksModalProps {
    noteId: string
}

export const SuggestedLinksModal = ({ noteId }: SuggestedLinksModalProps) => {
    const dispatch = useAppDispatch()
    const noteContent = useAppSelector(state => state.note.noteContent)
    const existingLinks = new Set(extractWikiLinks(noteContent))
    const { data: embeddingData, isLoading, isSuccess } = useGetSuggestedLinks({ id: noteId })

    const filteredLinks = embeddingData?.filter((link: any) => {
        return !existingLinks.has(link.title.trim())
    })

    return (
        <Modal
            loading={isLoading}
            open={true}
            title="Suggested Links"
            footer={null}
            onCancel={() => dispatch(closeModal())}
        >
            <div className="flex flex-col justify-start items-start gap-2">
                {
                    (isSuccess && filteredLinks?.length === 0) ?
                        <p>There is no suggested note!</p> :
                        filteredLinks?.map((link: any) => (
                            <div key={link.id} className="w-full flex justify-start items-center gap-2">
                                <SimilarityScore score={Number(String(link.score * 100).split('.')[0])} />
                                <p className="truncate">{link.title}</p>
                                <button
                                    onClick={() => {
                                        dispatch(setNoteContent((noteContent || "") + "\n" + `[[${link.title}]]`))
                                    }}
                                    className="ml-auto shrink-0 flex justify-between items-center rounded-md cursor-pointer w-auto text-left px-3 py-2 hover:bg-[#3a3a3a] text-gray-200"
                                >
                                    Add Link
                                </button>
                            </div>
                        ))
                }
            </div>
        </Modal>
    )
}

