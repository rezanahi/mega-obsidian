import prisma from "@/lib/prisma";
import { cosineSimilarity } from "@/lib/similarity";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const noteId = Number(id);
    const current = await prisma.note.findUnique({
        where: { id: noteId },
    });

    if (!current || !current.embedding) {
        return Response.json([]);
    }

    const currentEmbedding = current.embedding as number[];

    const others = await prisma.note.findMany({
        where: {
            id: { not: noteId },
        },
        select: {
            id: true,
            title: true,
            embedding: true,
        },
    });

    const suggestions = others
        .map((note) => {
            const emb = note.embedding as number[] | null;
            return {
                id: note.id,
                title: note.title,
                score: emb ? cosineSimilarity(currentEmbedding, emb) : 0,
            };
        })
        .filter((x) => x.score > 0.35)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

    return Response.json(suggestions);
}
