import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";
import {getUserFromToken} from "@/utils/auth";
import prisma from "@/lib/prisma";
import {message} from "antd";
import {usePathname} from "next/navigation";

// Get All Notes
export const useGetAllNotes = () => {
    const { data, isLoading } = useQuery<any, any>({
        queryKey: ["notes"],
        queryFn: async () => {
            const res = await axios.get("/api/notes");
            return res.data.notes
        },
    });
    return {
        notes: data ,
        isLoading
    };
}

// Get Searched Notes
export const useGetAllNotesBySearch = (search: string) => {
    const { data, isLoading, isError, error } = useQuery<any, any>({
        queryKey: ["snote", search],
        queryFn: async ({}) => {
            if (search) {
                const res = await axios.get(`/api/notes?search=${search}`)
                return res
            }
        },
        enabled: !!search
    })
    return {
        data, isLoading, isError, error
    }
}

// Get One Note By Title
export const useGetNoteByTitle = (title: string | null) => {
    const { data, isLoading, isSuccess, isError } = useQuery<any, any>({
        queryKey: ["tnote", title],
        queryFn: async ({ queryKey }) => {
            if (title) {
                const res = await axios.get(`/api/notes?title=${title}`)
                return res
            }
        },
    });
    return {
        data ,
        isLoading ,
        isSuccess ,
        isError
    };
}

// Get Note By Id
export const useGetNoteById = ({id} :{id: string | undefined}) => {
    const { data, isLoading, isSuccess, isError } = useQuery<any, any>({
        queryKey: ["note", id],
        queryFn: async ({ queryKey }) => {
            const res = await axios.get(`/api/notes/${id}`)
            return res
        },
        enabled: !!id
    });
    return {
        data ,
        isLoading ,
        isSuccess ,
        isError
    };
}


// Edit Note Api
export const useEditNote = (id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({title, content}: {title: string, content: string}) => {
            return await axios.put(`/api/notes/${id}`, { title, content });
        },
        onSuccess:async () => {
            queryClient.invalidateQueries({
                queryKey: ["notes"]
            }); // ریفرش کردن GET;
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message
            if (msg) {
                message.error(msg)
            }
        }
    });
}

// Edit Note Title Api
export const useEditNoteTitle = ({id} : {id: string}) => {
    const pathName = usePathname()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage();
    return useMutation({
        mutationFn: async ({title}: {title: string}) => {
            return await axios.patch(`/api/notes/${id}`, { title });
        },
        onSuccess: async (data) => {
            message.success(data?.data?.message);
            await queryClient.invalidateQueries({
                queryKey: ["notes"]
            }); // ریفرش کردن GET;
            if (pathName.split('/')[pathName.split('/').length-1] == id) {
                await queryClient.invalidateQueries({
                    queryKey: ["note", id],
                    exact: true
                }); // ریفرش کردن GET;
            }
            // setTimeout(() => messageApi.success(data?.data?.message), 0);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message
            if (msg) {
                message.error(msg)
            }
        }
    });
}

// Add Note Api
export const useAddNote = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (body: { title?: string }) => {
            const res = await axios.post(`/api/notes`, {title: body.title});
            return res?.data?.note
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["notes"]
            });
            message.success("یادداشت با موفقیت ساخته شد")
        },
        onError: () => {
            message.error("خطا در ساخت یادداشت")
        }
    });
}

// Delete Note Api
export const useDeleteNote = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await axios.delete(`/api/notes/${id}`);
            return res.data.note
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["notes"]
            });
            message.success("یادداشت حذف شد")
        },
        onError: () => {
            message.error("خطا در حذف یادداشت")
        }
    });
}

// Get Graph Data
export const useGetAllGraph = () => {
    const { data, isLoading, isSuccess } = useQuery<any, any>({
        queryKey: ["graph"],
        queryFn: async () => {
            const res = await axios.get("/api/graph");
            return res.data
        },
    });
    return {
        data: data ,
        isLoading,
        isSuccess
    };
}

// Get Graph Data For One Note
export const useGetGraphById = ({id}: {id: string}) => {
    const { data, isLoading, isSuccess } = useQuery<any, any>({
        queryKey: ["graphById", id],
        queryFn: async () => {
            const res = await axios.get(`/api/graph/${id}`);
            return res.data
        },
    });
    return {
        data ,
        isLoading,
        isSuccess
    };
}

export const voiceToTextAvalAi = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (file: any) => {
            console.log("in the hook - file = ", file)
            const formData = new FormData();
            formData.append("file", file);
            formData.append("model", "scribe_v2");
            formData.append("language", "fa");
            formData.append("prompt", "");
            const res = await axios.post(`https://api.avalai.ir/v1/audio/transcriptions`,
                formData, {
                headers: {
                    Authorization: `Bearer aa-NFjmVEzkqbtyFydy3KlFHsEZL974gUHkvfecTYQV4VRxDOaa`,
                }
            });
            console.log("res in hook +++++++++++ = ", res)
            return res
        },
        onSuccess: () => {
            // queryClient.invalidateQueries({
            //     queryKey: ["notes"]
            // });
            // message.success("یادداشت حذف شد")
        },
        onError: () => {
            message.error("خطا در تبدیل صوت به متن")
        }
    })
}

// Get All Backlinks Data
export const useGetAllBacklinks = ({id}: {id: string}) => {
    const { data, isLoading, isSuccess } = useQuery<any, any>({
        queryKey: ["backlinks"],
        queryFn: async () => {
            const res = await axios.get(`/api/notes/${id}/backlinks`);
            return res.data
        },
        enabled: !!id
    });
    return {
        data ,
        isLoading,
        isSuccess
    };
}

// Embedding
export const useGetSuggestedLinks = ({id}: {id: string}) => {
    const { data, isLoading, isSuccess } = useQuery<any, any>({
        queryKey: ["suggested-links"],
        queryFn: async () => {
            const res = await axios.get(`/api/notes/${id}/suggested-links`);
            return res.data
        },
        enabled: !!id
    });
    return {
        data ,
        isLoading,
        isSuccess
    };
}