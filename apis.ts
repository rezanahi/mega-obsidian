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
    });
}

// Add Note Api
export const useAddNote = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () => {
            const res = await axios.post(`/api/notes`);
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