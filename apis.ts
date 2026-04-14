import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";
import {getUserFromToken} from "@/utils/auth";
import prisma from "@/lib/prisma";

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

