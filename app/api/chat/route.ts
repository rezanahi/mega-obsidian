import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildRagPrompt, findTopKNotes } from "@/lib/rag";
import {getUserFromToken} from "@/utils/auth";
import { mapUsedSources } from "@/lib/ragSources";

type EmbedResponse = {
    embedding: number[];
};


export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken();
        const body = await req.json();
        const question = body?.question?.trim();
        const userId = user?.id; // موقت؛ بهتره از session بگیری

        if (!question) {
            return NextResponse.json(
                { error: "Question is required." },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required." },
                { status: 401 }
            );
        }

        // 1) گرفتن embedding سوال از FastAPI
        const embedRes = await fetch(`http://127.0.0.1:8001/embed`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: question }),
            cache: "no-store",
        });

        if (!embedRes.ok) {
            const errorText = await embedRes.text();
            return NextResponse.json(
                { error: `Embedding service failed: ${errorText}` },
                { status: 500 }
            );
        }

        const embedData: EmbedResponse = await embedRes.json();

        if (
            !embedData?.embedding ||
            !Array.isArray(embedData.embedding) ||
            embedData.embedding.length === 0
        ) {
            return NextResponse.json(
                { error: "Invalid embedding returned from embedding service." },
                { status: 500 }
            );
        }

        // 2) گرفتن یادداشت‌های کاربر از دیتابیس
        const notes = await prisma.note.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                title: true,
                content: true,
                embedding: true,
            },
        });

        if (!notes.length) {
            return NextResponse.json({
                answer: "یادداشتی برای این کاربر پیدا نشد.",
                sources: [],
            });
        }

        // 3) پیدا کردن نزدیک‌ترین یادداشت‌ها
        const topNotes = findTopKNotes(embedData.embedding, notes, 5);

        if (!topNotes.length) {
            return NextResponse.json({
                answer: "یادداشت مرتبطی برای پاسخ به این سوال پیدا نشد.",
                sources: [],
            });
        }

        // 4) ساخت prompt
        const prompt = buildRagPrompt(question, topNotes);

        // 5) فراخوانی مدل زبانی
        const llmRes = await fetch("https://api.avalai.ir/v1/chat/completions/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer aa-2DyBUZ8JKyq76gomEaRa50NbdOmoTGfbZD9YPxVecgFdnPKb`,
            },
            body: JSON.stringify({
                model: "gpt-4.1",
                messages: [
                    {
                        role: "system",
                        content: "شما یک دستیار مفید هستید."
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        });

        if (!llmRes.ok) {
            const errorText = await llmRes.text();
            return NextResponse.json(
                { error: `LLM request failed: ${errorText}` },
                { status: 500 }
            );
        }

        const llmData = await llmRes.json();
        const answer =
            llmData?.choices?.[0]?.message?.content ??
            "پاسخی از مدل دریافت نشد.";

        // 6) بازگرداندن پاسخ + منابع
        const sources = topNotes.map((item) => ({
            id: item.note.id,
            title: item.note.title,
            score: item.score,
        }))
        return NextResponse.json({
            answer,
            used_sources: mapUsedSources(answer, sources),
            sources: topNotes.map((item) => ({
                id: item.note.id,
                title: item.note.title,
                score: item.score,
            })),
        });
    } catch (error) {
        console.error("CHAT_API_ERROR:", error);

        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
