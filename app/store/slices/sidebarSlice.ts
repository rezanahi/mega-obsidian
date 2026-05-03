import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface SidebarState {
    searchValue: string
}

const initialState: SidebarState = {
    searchValue: ''
}

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState: initialState,
    reducers: {
        setSearchValue: (state, action: PayloadAction<string>) => {
            state.searchValue = action.payload
        }
    }
})


export const { setSearchValue } = sidebarSlice.actions
export default sidebarSlice.reducer