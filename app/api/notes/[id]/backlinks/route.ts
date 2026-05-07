import { getUserFromToken } from "@/utils/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromToken();
        const { id } = await params;
        const noteId = Number(id);

        // آیا نوت متعلق به این کاربر است؟
        const note = await prisma.note.findFirst({
            where: { id: noteId, userId: user.id },
            select: { id: true }
        });

        if (!note) {
            return NextResponse.json(
                { message: "یادداشت پیدا نشد" },
                { status: 404 }
            );
        }

        // پیدا کردن بک لینک‌ها
        const backlinks = await prisma.noteLink.findMany({
            where: { targetId: noteId },
            select: {
                source: {
                    select: {
                        id: true,
                        title: true,
                        // اگر بخواهی preview content:
                        // content: true,
                    }
                }
            }
        });
        const result = backlinks.map(b => b.source);
        return NextResponse.json(
            {
                noteId,
                count: result.length,
                backlinks: result
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("BACKLINK_API_ERROR:", error);
        return NextResponse.json(
            { message: "Internal error" },
            { status: 500 }
        );
    }
}
