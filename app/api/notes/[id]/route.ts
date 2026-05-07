import prisma from "@/lib/prisma";
import { NextResponse, NextRequest} from "next/server";
import { getUserFromToken } from "@/utils/auth";
import {extractWikiLinks} from "@/utils/methods";

// Functions / Helpers
function replaceWikiLinkTitle(content: string, oldTitle: string, newTitle: string) {
    const escapedOldTitle = oldTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\[\\[\\s*${escapedOldTitle}\\s*\\]\\]`, "g");
    return content.replace(regex, `[[${newTitle}]]`);
}
async function syncNoteLinksTx(
    tx: any,
    noteId: number,
    content: string,
    userId: number
) {
    const rawLinks = extractWikiLinks(content);

    const uniqueRawLinks = [...new Set(rawLinks)];

    const targetNotes = await tx.note.findMany({
        where: {
            title: { in: uniqueRawLinks },
            userId,
        },
    });

    const existingTitles = targetNotes.map((n: any) => n.title);
    const missingTitles = uniqueRawLinks.filter(name => !existingTitles.includes(name));

    if (missingTitles.length > 0) {
        await tx.note.createMany({
            data: missingTitles.map(title => ({
                title,
                content: "",
                userId
            })),
            skipDuplicates: true
        });
    }

    const allTargets = await tx.note.findMany({
        where: {
            title: { in: uniqueRawLinks },
            userId
        },
        select: { id: true }
    });

    const newTargetIds = allTargets.map((n: any) => n.id);

    const existing = await tx.noteLink.findMany({
        where: { sourceId: noteId },
        select: { targetId: true }
    });

    const existingIds = existing.map((l: any) => l.targetId);

    const toDelete = existingIds.filter((id: number) => !newTargetIds.includes(id));
    const toCreate = newTargetIds.filter((id: number) => !existingIds.includes(id));

    if (toDelete.length > 0) {
        await tx.noteLink.deleteMany({
            where: {
                sourceId: noteId,
                targetId: { in: toDelete }
            }
        });
    }

    if (toCreate.length > 0) {
        await tx.noteLink.createMany({
            data: toCreate.map((tid: number) => ({
                sourceId: noteId,
                targetId: tid
            })),
            skipDuplicates: true
        });
    }
}



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
    try {
        const user = await getUserFromToken();
        const { id } = await params;
        const noteId = Number(id);
        const body = await req.json();

        const title = body.title?.trim();
        const content = body.content ?? "";

        if (!title) {
            return NextResponse.json(
                { message: "عنوان اجباری است" },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            const note = await tx.note.findFirst({
                where: { id: noteId, userId: user.id },
                select: { id: true, title: true }
            });

            if (!note) {
                throw new Error("NOTE_NOT_FOUND");
            }

            const oldTitle = note.title;

            const existingByTitle = await tx.note.findFirst({
                where: {
                    title,
                    userId: user.id,
                    NOT: { id: noteId }
                }
            });

            if (existingByTitle) {
                throw new Error("TITLE_ALREADY_EXISTS");
            }

            // اگر title عوض شده، backlink content های دیگر هم آپدیت شوند
            if (oldTitle !== title) {
                await tx.note.update({
                    where: { id: noteId },
                    data: { title }
                });

                const backlinks = await tx.noteLink.findMany({
                    where: { targetId: noteId },
                    select: { sourceId: true }
                });

                const sourceIds = [...new Set(backlinks.map((l: any) => l.sourceId))];

                if (sourceIds.length > 0) {
                    const sourceNotes = await tx.note.findMany({
                        where: {
                            id: { in: sourceIds },
                            userId: user.id
                        },
                        select: {
                            id: true,
                            content: true
                        }
                    });

                    for (const sourceNote of sourceNotes) {
                        const updatedContent = replaceWikiLinkTitle(
                            sourceNote.content || "",
                            oldTitle || '',
                            title
                        );

                        if (updatedContent !== sourceNote.content) {
                            await tx.note.update({
                                where: { id: sourceNote.id },
                                data: { content: updatedContent }
                            });

                            await syncNoteLinksTx(
                                tx,
                                sourceNote.id,
                                updatedContent,
                                user.id
                            );
                        }
                    }
                }
            }

            // آپدیت خود note
            await tx.note.update({
                where: { id: noteId },
                data: {
                    title,
                    content
                }
            });

            // sync لینک‌های خود note از روی content جدید
            await syncNoteLinksTx(tx, noteId, content, user.id);
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        if (error.message === "NOTE_NOT_FOUND") {
            return NextResponse.json(
                { message: "یادداشت پیدا نشد" },
                { status: 404 }
            );
        }

        if (error.message === "TITLE_ALREADY_EXISTS") {
            return NextResponse.json(
                { message: "یادداشتی با این عنوان وجود دارد" },
                { status: 409 }
            );
        }

        console.error("PUT_NOTE_ERROR:", error);
        return NextResponse.json(
            { message: "خطای داخلی سرور" },
            { status: 500 }
        );
    }
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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromToken();
        const { id } = await params;
        const noteId = Number(id);
        const { title } = await req.json();

        if (!title?.trim()) {
            return NextResponse.json(
                { message: "عنوان اجباری است" },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            const note = await tx.note.findFirst({
                where: { id: noteId, userId: user.id },
                select: { id: true, title: true }
            });

            if (!note) {
                throw new Error("NOTE_NOT_FOUND");
            }

            const oldTitle = note.title;
            const newTitle = title.trim();

            if (oldTitle === newTitle) {
                return;
            }

            const existingByTitle = await tx.note.findFirst({
                where: {
                    title: newTitle,
                    userId: user.id,
                    NOT: { id: noteId }
                }
            });

            if (existingByTitle) {
                throw new Error("TITLE_ALREADY_EXISTS");
            }

            await tx.note.update({
                where: { id: noteId },
                data: { title: newTitle }
            });

            const backlinks = await tx.noteLink.findMany({
                where: { targetId: noteId },
                select: { sourceId: true }
            });

            const sourceIds = [...new Set(backlinks.map((l: any) => l.sourceId))];

            if (sourceIds.length > 0) {
                const sourceNotes = await tx.note.findMany({
                    where: {
                        id: { in: sourceIds },
                        userId: user.id
                    },
                    select: {
                        id: true,
                        content: true
                    }
                });

                for (const sourceNote of sourceNotes) {
                    const updatedContent = replaceWikiLinkTitle(
                        sourceNote.content || "",
                        oldTitle || '',
                        newTitle
                    );

                    if (updatedContent !== sourceNote.content) {
                        await tx.note.update({
                            where: { id: sourceNote.id },
                            data: { content: updatedContent }
                        });

                        await syncNoteLinksTx(
                            tx,
                            sourceNote.id,
                            updatedContent,
                            user.id
                        );
                    }
                }
            }
        });

        return NextResponse.json(
            { success: true, message: "عنوان بروزرسانی شد" },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.message === "NOTE_NOT_FOUND") {
            return NextResponse.json(
                { message: "یادداشت پیدا نشد" },
                { status: 404 }
            );
        }

        if (error.message === "TITLE_ALREADY_EXISTS") {
            return NextResponse.json(
                { message: "یادداشتی با این عنوان وجود دارد" },
                { status: 409 }
            );
        }

        console.error("PATCH_NOTE_ERROR:", error);
        return NextResponse.json(
            { message: "خطای داخلی سرور" },
            { status: 500 }
        );
    }
}

