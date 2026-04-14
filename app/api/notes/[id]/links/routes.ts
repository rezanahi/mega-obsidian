import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/auth";

function extractLinks(content: string): string[] {
    const regex = /\[\[(.*?)\]\]/g;
    return [...content.matchAll(regex)].map((m) => m[1]);
}


export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const user = await getUserFromToken();
    const noteId = Number(params.id);
    const { content } = await req.json();

    const titles = extractLinks(content);

    await prisma.noteLink.deleteMany({
        where: { sourceId: noteId },
    });

    const targets = await prisma.note.findMany({
        where: {
            userId: user.id,
            title: { in: titles },
        },
    });

    await prisma.noteLink.createMany({
        data: targets.map((t) => ({
            sourceId: noteId,
            targetId: t.id,
        })),
    });

    return NextResponse.json({ success: true });
}
