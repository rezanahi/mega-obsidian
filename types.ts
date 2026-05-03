export interface Note {
    id: number;
    title: string | null;
    content: string;
}

export type SidebarModeType = 'file' | 'search'