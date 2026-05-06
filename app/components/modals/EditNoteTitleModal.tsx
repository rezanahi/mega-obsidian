import {Modal} from "antd";
import {useAppDispatch} from "@/app/store/hooks";
import {closeModal} from "@/app/store/slices/modalSlice";


interface EditNoteTitleModalProps {
    noteId: string
}

export const EditNoteTitleModal = ({noteId} : EditNoteTitleModalProps) => {
    const dispatch = useAppDispatch()

    return (
        <>
            <Modal
                open={true}
                title={`${noteId}`}
                onCancel={() => dispatch(closeModal())}
                onOk={() => dispatch(closeModal())}
            >
                <p>
                    Create your note here - noteId =
                </p>
            </Modal>
        </>
    )
}