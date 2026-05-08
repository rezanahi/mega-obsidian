"use client"

import { useAppSelector } from "@/app/store/hooks"
import {EditNoteTitleModal} from "@/app/components/modals/EditNoteTitleModal";
import {SuggestedLinksModal} from "@/app/components/modals/SuggestedLinksModal";

const MODAL_COMPONENTS: any = {
    EditNoteTitleModal: EditNoteTitleModal,
    SuggestedLinksModal: SuggestedLinksModal
}

export default function ModalRoot() {

    const modalType = useAppSelector(state => state.modal.modalType)
    const isOpen = useAppSelector(state => state.modal.isOpen)
    const modalProps = useAppSelector(state => state.modal.modalProps)

    if (!modalType || !isOpen) return null

    const ModalComponent = MODAL_COMPONENTS[modalType]

    if (!ModalComponent) return null

    return <ModalComponent {...modalProps} />
}
