import {createSlice, PayloadAction} from "@reduxjs/toolkit";


interface ModalState {
    isOpen: boolean,
    modalType: string | null,
    modalProps: any
}

const initialState: ModalState = {
    isOpen: false,
    modalType: null,
    modalProps: {}
}

const modalSlice = createSlice({
    name: 'modal' ,
    initialState: initialState,
    reducers: {
        openModal: (state, action: PayloadAction<{ modalType: string; modalProps?: any }>) => {
            state.isOpen = true
            state.modalType = action.payload.modalType
            state.modalProps = action.payload.modalProps
        },
        closeModal: (state) => {
            state.isOpen = false
            state.modalType = null
            state.modalProps = {}
        }
    }
})


export const { openModal, closeModal } = modalSlice.actions
export default modalSlice.reducer