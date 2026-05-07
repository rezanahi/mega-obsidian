import {getUserFromToken} from "@/utils/auth";
import prisma from "@/lib/prisma";
import {NextRequest, NextResponse} from "next/server";


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromToken();
        const { id } = await params;

        const noteId = Number(id);

        // 1) نوت اصلی
        const mainNote = await prisma.note.findUnique({
            where: { id: noteId, userId: user.id },
            select: { id: true, title: true }
        });

        if (!mainNote) {
            return NextResponse.json(
                { error: "Note not found" },
                { status: 404 }
            );
        }

        // 2) تمام لینک‌های مستقیم
        const links = await prisma.noteLink.findMany({
            where: {
                OR: [{ sourceId: noteId }, { targetId: noteId }]
            },
            select: { sourceId: true, targetId: true }
        });

        // 3) استخراج همه نوت‌های مرتبط
        const connectedNoteIds = Array.from(
            new Set(
                links.flatMap(l => [l.sourceId, l.targetId])
            )
        ).filter(nid => nid !== noteId); // خود نوت اصلی حذف شود

        // 4) گرفتن دیتای نوت‌های مرتبط
        const connectedNotes = await prisma.note.findMany({
            where: {
                id: { in: connectedNoteIds },
                userId: user.id
            },
            select: { id: true, title: true }
        });

        // 5) برگرداندن همه نودها: نوت اصلی + نوت‌های مرتبط
        const nodes = [mainNote, ...connectedNotes];

        return NextResponse.json({
            nodes,
            links
        });

    } catch (err) {
        console.error("GRAPH_API_ERROR:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}