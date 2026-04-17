"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusOutlined } from "@ant-design/icons";
import { LogoutOutlined } from '@ant-design/icons';
import {message} from "antd";
import {useRouter, usePathname} from "next/navigation";
import axios from "axios";
import {Note} from "@/types";
import {useAddNote, useDeleteNote, useGetAllNotes} from "@/apis";
import { DeleteOutlined, EditOutlined, NodeIndexOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"



export default function Sidebar() {
    const {notes, isLoading} = useGetAllNotes()
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; noteId: number | null; }>({visible: false, x: 0, y: 0, noteId: null,});
    const router = useRouter();
    const { mutateAsync: addNote } = useAddNote()
    const { mutate: deleteNote } = useDeleteNote()
    const pathname = usePathname();

    // Close Context Menu
    useEffect(() => {
        const close = () => setContextMenu((prev) => ({ ...prev, visible: false }));
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);


    const logout = async () => {
        try {
            const res = await axios.post("/api/auth/logout");
            message.success("با موفقیت خارج شدید")
            router.push('/login');
        } catch (err) {
            message.error("خطا در خروج")
        }
    };


    const createNote = async () => {
        try {
            const newNote = await addNote({title: undefined})
            // message.success("یادداشت با موفقیت ساخته شد")
            console.log("newNote = ", newNote)
            router.push(`/dashboard/note/${newNote.id}`)
        } catch (err) {

        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 h-12 border-b border-gray-700 flex justify-start gap-3">
                <span className="font-semibold mr-auto">Notes</span>
                <button onClick={() => {router.push('/dashboard/graph')}} className="text-green-400 hover:text-green-300">
                    <NodeIndexOutlined />
                </button>
                <button onClick={createNote} className="text-green-400 hover:text-green-300">
                    <PlusOutlined />
                </button>
            </div>

            {/* Notes list */}
            <div className="overflow-y-auto">
                {notes?.map((note : Note) => {
                    const isActive = pathname === `/dashboard/note/${note.id}`;
                    return (
                        <Link
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu({
                                    visible: true,
                                    x: e.clientX,
                                    y: e.clientY,
                                    noteId: note.id,
                                });
                            }}
                            key={note.id}
                            href={`/dashboard/note/${note.id}`}
                            className={`block px-3 py-2 ${isActive ? "bg-gray-600 text-white" : "hover:bg-gray-700"} transition`}
                        >
                            {note.title || "Untitled"}
                        </Link>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700 flex justify-between mt-auto">
                {/*<span className="font-semibold">Notes</span>*/}
                <button className="text-green-400 hover:text-green-300">
                    <LogoutOutlined
                        className={"rotate-[180deg]"}
                        onClick={logout} />
                </button>
            </div>
            {contextMenu.visible && (
                <div
                    className="fixed w-48 bg-[#2b2b2b] border border-gray-700 rounded-md shadow-lg z-50"
                    style={{
                        top: contextMenu.y,
                        left: contextMenu.x,
                    }}
                >
                    <button
                        className="flex justify-between items-center cursor-pointer w-full text-left px-4 py-2 hover:bg-[#3a3a3a] text-gray-200"
                        onClick={() => console.log("Rename")}
                    >
                        <EditOutlined></EditOutlined>
                        تغییر عنوان
                    </button>
                    <button
                        className="flex justify-between items-center cursor-pointer w-full text-left px-4 py-2 hover:bg-[#3a3a3a] text-red-400"
                        onClick={ async () => {
                            if (contextMenu.noteId) await deleteNote(String(contextMenu.noteId))
                            if (pathname === `/dashboard/note/${contextMenu.noteId}`) router.push('/dashboard/')
                        }}
                    >
                        <DeleteOutlined></DeleteOutlined>
                        حذف یادداشت
                    </button>
                </div>
            )}

        </div>


    );
}
