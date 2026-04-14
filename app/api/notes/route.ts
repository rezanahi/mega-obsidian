import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/auth";

export async function GET() {
    const user = await getUserFromToken();

    const notes = await prisma.note.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            title: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ notes });
}


export async function POST() {
    const user = await getUserFromToken();

    const note = await prisma.note.create({
        data: {
            title: "Untitled",
            content: "",
            userId: user.id,
        },
    });

    return NextResponse.json({ note });
}

