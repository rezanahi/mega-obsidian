import prisma from "@/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import { getUserFromToken } from "@/utils/auth";

// Note List
export async function GET(req: NextRequest) {
    const user = await getUserFromToken();
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const searchTerm = searchParams.get("search")

    if (title) {
        const note = await prisma.note.findUnique({
            where: {title: title, userId: user.id} ,
            select: {
                id: true,
                title: true,
                updatedAt: true,
            }
        })
        if (note) {
            return NextResponse.json({ note, status: 'success' }, {status: 200});
        } else {
            return NextResponse.json({ message: "یادداشتی با این عنوان نداریم", status: 'success' }, {status: 404});
        }
    }

    if (searchTerm) {
        const notes = await prisma.note.findMany({
            where: {userId: user.id, title: {contains: searchTerm, mode: 'insensitive'}} ,
            select: {
                id: true,
                title: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ notes });
    }

    const notes = await prisma.note.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            title: true,
            updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });

}


// Create Note
export async function POST(req: NextRequest) {
    const user = await getUserFromToken();
    const body = await req.json();
    const { title } = body;
    if ( title ) {
        const note = await prisma.note.create({
            data: {
                title: title,
                content: "",
                userId: user.id,
            },
        })
        return NextResponse.json({ note });
    } else {
        const note = await prisma.note.create({
            data: {
                title: "Untitled",
                content: "",
                userId: user.id,
            },
        });
        const updatedNote = await prisma.note.update({
            where: {id: note.id, userId: user.id},
            data: {title: `Untitled ${note.id}`}
        })
        return NextResponse.json({ updatedNote });
    }
}

