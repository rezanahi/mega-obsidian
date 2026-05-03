import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {SidebarModeType} from "@/types";

interface SidebarState {
    searchValue: string
    sidebarMode: SidebarModeType
}

const initialState: SidebarState = {
    searchValue: '',
    sidebarMode: "file"
}

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState: initialState,
    reducers: {
        setSearchValue: (state, action: PayloadAction<string>) => {
            state.searchValue = action.payload
        },
        setSidebarMode: (state, action: PayloadAction<SidebarModeType>) => {
            state.sidebarMode = action.payload
        }
    }
})


export const { setSearchValue, setSidebarMode } = sidebarSlice.actions
export default sidebarSlice.reducer