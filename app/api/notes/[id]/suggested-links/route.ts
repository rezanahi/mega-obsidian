import prisma from "@/lib/prisma";
import { cosineSimilarity } from "@/lib/similarity";
import {
    buildEmbeddingText,
    generateNotePreview,
    isLowSignalNote,
} from "@/lib/textUtils";
import { calculateHybridScore } from "@/lib/scoring";

const MIN_SEMANTIC_SCORE = 0.55;
const MIN_FINAL_SCORE = 0.50;
const MAX_RESULTS = 8;

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const noteId = Number(id);

    if (Number.isNaN(noteId)) {
        return Response.json({ error: "Invalid note id" }, { status: 400 });
    }

    const current = await prisma.note.findUnique({
        where: { id: noteId },
        select: {
            id: true,
            title: true,
            content: true,
            embedding: true,
        },
    });

    if (!current || !current.embedding) {
        return Response.json([]);
    }

    const currentTitle = current.title || "";
    const currentContent = current.content || "";

    // Skip notes that are too short/noisy to generate useful suggestions.
    if (isLowSignalNote(currentTitle, currentContent)) {
        return Response.json([]);
    }

    const currentEmbedding = current.embedding as number[];
    const currentText = buildEmbeddingText(currentTitle, currentContent);

    const others = await prisma.note.findMany({
        where: {
            id: { not: noteId },
        },
        select: {
            id: true,
            title: true,
            content: true,
            embedding: true,
        },
    });

    const suggestions = others
        .map((note) => {
            const emb = note.embedding as number[] | null;
            if (!emb) return null;

            const noteTitle = note.title || "";
            const noteContent = note.content || "";

            if (isLowSignalNote(noteTitle, noteContent)) {
                return null;
            }

            const semanticScore = cosineSimilarity(currentEmbedding, emb);

            // Early cutoff to avoid weak candidates entering final ranking.
            if (semanticScore < MIN_SEMANTIC_SCORE) {
                return null;
            }

            const candidateText = buildEmbeddingText(noteTitle, noteContent);
            const finalScore = calculateHybridScore({
                semanticScore,
                queryTitle: currentTitle,
                queryContent: currentText,
                candidateTitle: noteTitle,
                candidateContent: candidateText,
            });

            return {
                id: note.id,
                title: note.title,
                score: finalScore,
                semanticScore,
            };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .filter((x) => x.score >= MIN_FINAL_SCORE)
        .sort((a, b) => b.score - a.score)
        // .slice(0, MAX_RESULTS);

    return Response.json(suggestions);
}
