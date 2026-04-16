import prisma from "@/lib/prisma";
import { NextResponse, NextRequest} from "next/server";
import { getUserFromToken } from "@/utils/auth";
import {extractWikiLinks} from "@/utils/methods";


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



// Update Note
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

    console.log("Link = ", extractWikiLinks(content))
    // Find All the internal links - titles
    const rawLinks = extractWikiLinks(content)
    // find all the ids of the notes that we linked
    const targetNotes = await prisma.note.findMany({
        where: {
            title: { in: rawLinks },
            userId: user.id,
        },
    });
    // titles that we have note for them in db
    const existingTitles = targetNotes.map(n => n.title);
    // titles that we have not note for them in db
    const missingTitles = rawLinks.filter(name => !existingTitles.includes(name));
    // Create note for missing titles
    const newNotes = await prisma.note.createMany({
        data: missingTitles.map(title => ({
            title,
            content: "",
            userId: user.id
        })),
    });
    const allTargets = await prisma.note.findMany({
        where: { title: { in: rawLinks }, userId: user.id },
        select: { id: true }
    });
    const newTargetIds = allTargets.map(n => n.id);
    const existing = await prisma.noteLink.findMany({
        where: { sourceId: noteId },
        select: { targetId: true }
    });
    const existingIds = existing.map(l => l.targetId);
    const toDelete = existingIds.filter(id => !newTargetIds.includes(id));
    const toCreate = newTargetIds.filter(id => !existingIds.includes(id));
    await prisma.noteLink.deleteMany({
        where: {
            sourceId: noteId,
            targetId: { in: toDelete }
        }
    });

    await prisma.noteLink.createMany({
        data: toCreate.map(tid => ({
            sourceId: noteId,
            targetId: tid
        }))
    });
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

