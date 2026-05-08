import {createSlice, PayloadAction} from "@reduxjs/toolkit";


interface NoteState {
    noteTitle: string,
    noteContent: string
}

const initialState: NoteState = {
    noteTitle: '',
    noteContent: ''
}

const noteSlice = createSlice({
    name: 'note' ,
    initialState: initialState,
    reducers: {
        setNoteTitle: (state, action: PayloadAction<string>) => {
            state.noteTitle = action.payload
        },
        setNoteContent: (state, action: PayloadAction<string>) => {
            state.noteContent = action.payload
        }
    }
})


export const { setNoteTitle, setNoteContent } = noteSlice.actions
export default noteSlice.reducer