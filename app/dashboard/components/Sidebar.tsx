"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusOutlined } from "@ant-design/icons";
import { LogoutOutlined } from '@ant-design/icons';
import {message} from "antd";
import {useRouter} from "next/navigation";
import axios from "axios";
import {Note} from "@/types";
import {useGetAllNotes} from "@/apis";


export default function Sidebar() {
    const {notes, isLoading} = useGetAllNotes()
    const router = useRouter();


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
            const newNote = await axios.post("/api/notes");
            message.success("یادداشت با موفقیت ساخته شد")
            // await fetchNotes()
        } catch (err) {
            message.error("خطا در ساخت یادداشت")
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-700 flex justify-between">
                <span className="font-semibold">Notes</span>
                <button onClick={createNote} className="text-green-400 hover:text-green-300">
                    <PlusOutlined />
                </button>
            </div>

            {/* Notes list */}
            <div className="overflow-y-auto">
                {notes?.map((note : Note) => (
                    <Link
                        key={note.id}
                        href={`/dashboard/note/${note.id}`}
                        className="block px-3 py-2 hover:bg-gray-700 transition"
                    >
                        {note.title || "Untitled"}
                    </Link>
                ))}
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
        </div>
    );
}
