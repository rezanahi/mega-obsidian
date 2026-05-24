import {Input, Modal} from "antd";
import {useAppDispatch} from "@/app/store/hooks";
import {closeModal} from "@/app/store/slices/modalSlice";
import {useEffect, useState} from "react";
import {useEditNoteTitle} from "@/apis";
import {usePathname} from "next/navigation";


interface EditNoteTitleModalProps {
    noteId: string
    noteTitle: string
}

export const EditNoteTitleModal = ({noteId, noteTitle} : EditNoteTitleModalProps) => {
    const dispatch = useAppDispatch()
    const pathname = usePathname()
    const [newNoteTitle, setNewNoteTitle] = useState<string>(noteTitle || '')
    // Apis
    const { mutate: EditNoteMutate, isPending: EditNoteIsPending, isSuccess: EditNoteIsSuccess } = useEditNoteTitle({id: noteId})


    // When Edit Title was successful close modal
    useEffect(() => {
        if (EditNoteIsSuccess) {
            dispatch(closeModal())
        }
    }, [EditNoteIsSuccess])

    return (
        <>
            <Modal
                confirmLoading={EditNoteIsPending}
                open={true}
                title={`Edit Title`}
                onCancel={() => dispatch(closeModal())}
                onOk={() => {
                    EditNoteMutate({title: newNoteTitle})
                }}
            >
                <div className={`flex flex-col justify-start items-start gap-2`}>
                    <p>Enter New Title</p>
                    <Input autoFocus value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)}></Input>
                </div>
            </Modal>
        </>
    )
}