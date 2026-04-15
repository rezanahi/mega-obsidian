import prisma from "@/lib/prisma";
import { NextResponse, NextRequest} from "next/server";
import { getUserFromToken } from "@/utils/auth";


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

    const user = await getUserFromToken();
    const { id } = await params;
    const noteId = Number(id);


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
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getUserFromToken();
    const { id } = await params;
    const noteId = Number(id);
    const { title, content } = await req.json();

    const existingByTitle = await prisma.note.findFirst({
        where: {
            title: title,
            NOT: {
                id: noteId
            }}
    })
    if (existingByTitle) {
        return NextResponse.json({ message: 'یادداشتی با این عنوان وجود دارد' }, { status: 309 })
    }

    const note = await prisma.note.updateMany({
        where: { id: noteId, userId: user.id },
        data: { title: title, content: content },
    });

    return NextResponse.json({ success: true });
}


export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getUserFromToken();
    const { id } = await params;
    const noteId = Number(id);

    await prisma.note.deleteMany({
        where: { id: noteId, userId: user.id },
    });

    return NextResponse.json({ success: true });
}

