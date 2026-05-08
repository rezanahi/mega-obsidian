import { configureStore } from "@reduxjs/toolkit"
import sidebarReducer from "@/app/store/slices/sidebarSlice";
import modalReducer from "@/app/store/slices/modalSlice"
import noteReducer from "@/app/store/slices/noteSlice"


export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        modal: modalReducer,
        note: noteReducer
    }
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch