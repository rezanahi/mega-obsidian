import {getUserFromToken} from "@/utils/auth";
import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";


export async function GET () {
    const user = await getUserFromToken();
    const notes = await prisma.note.findMany({
        where: {userId: user.id},
        select: {id: true, title: true}
    })
    const noteIds = notes.map((n) => n.id);
    const links = await prisma.noteLink.findMany({
        where: {
            OR: [
                {sourceId: {in: noteIds}},
                {targetId: {in: noteIds}}
            ]
        },
        include: {
            source: true,
            target: true
        }
    })

    return NextResponse.json({
        nodes: notes,
        links: links
    });
}