import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/auth";


export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const user = await getUserFromToken();
    const noteId = Number(params.id);

    const note = await prisma.note.findFirst({
        where: { id: noteId, userId: user.id },
        include: {
            incomingLinks: {
                include: {
                    source: { select: { id: true, title: true } },
                },
            },
        },
    });

    if (!note) return new Response("Not found", { status: 404 });

    return NextResponse.json({ note });
}




export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const user = await getUserFromToken();
    const noteId = Number(params.id);
    const { title, content } = await req.json();

    const note = await prisma.note.updateMany({
        where: { id: noteId, userId: user.id },
        data: { title, content },
    });

    return NextResponse.json({ success: true });
}


export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const user = await getUserFromToken();
    const noteId = Number(params.id);

    await prisma.note.deleteMany({
        where: { id: noteId, userId: user.id },
    });

    return NextResponse.json({ success: true });
}

