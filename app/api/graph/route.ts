import {getUserFromToken} from "@/utils/auth";
import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";


export async function GET () {
    try {
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
            select: {
                sourceId: true,
                targetId: true
            }
        })

        return NextResponse.json({
            nodes: notes,
            links: links
        });
    } catch (err) {
        console.error("GRAPH_API_ERROR:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}