import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";
import {getUserFromToken} from "@/utils/auth";
import prisma from "@/lib/prisma";
import {message} from "antd";

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

// Get One Note By Title
export const useGetNoteByTitle = (title: string | null) => {
    const { data, isLoading, isSuccess, isError } = useQuery<any, any>({
        queryKey: ["note", title],
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


// Edit Note Api
export const useEditNote = (id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({title, content}: {title: string, content: string}) => {
            return await axios.put(`/api/notes/${id}`, { title, content });
        },
        onSuccess: () => {
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

// Add Note Api
export const useAddNote = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (body: { title?: string }) => {
            const res = await axios.post(`/api/notes`, {title: body.title});
            return res.data.note
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