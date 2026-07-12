import { cosineSimilarity } from "./similarity";

type NoteItem = {
    id: string | number;
    title: string | null;
    content: string | null;
    embedding: number[] | null;
};

export function buildNoteText(note: NoteItem) {
    const title = note.title?.trim() || "";
    const content = note.content?.trim() || "";
    return `${title}\n\n${content}`.trim();
}

export function findTopKNotes(
    queryEmbedding: number[],
    notes: NoteItem[],
    topK = 5
) {
    const scored = notes
        .filter((note) => Array.isArray(note.embedding) && note.embedding.length > 0)
        .map((note) => ({
            note,
            score: cosineSimilarity(queryEmbedding, note.embedding as number[]),
        }))
        .filter((item) => item.score > 0);

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
}

export function buildRagPrompt(
    userQuestion: string,
    retrievedNotes: Array<{
        note: NoteItem;
        score: number;
    }>
) {
    const contextBlocks = retrievedNotes.map((item, index) => {
        const noteText = buildNoteText(item.note);
        return [
            `منبع ${index + 1}:`,
            `شناسه یادداشت: ${item.note.id}`,
            `امتیاز شباهت: ${item.score.toFixed(4)}`,
            `عنوان: ${item.note.title ?? "بدون عنوان"}`,
            `محتوا:`,
            noteText || "محتوایی وجود ندارد.",
        ].join("\n");
    });

    const contextText = contextBlocks.join("\n\n----------------------\n\n");

    return `
تو دستیار هوشمند MegaObsidian هستی.
فقط بر اساس اطلاعات موجود در یادداشت‌های بازیابی‌شده پاسخ بده.
اگر پاسخ به‌صورت مستقیم یا با اطمینان کافی در یادداشت‌ها وجود ندارد، صادقانه بگو که اطلاعات کافی در یادداشت‌ها پیدا نشد.
پاسخ را به زبان فارسی، دقیق، خلاصه و مفید بده.
در انتهای پاسخ اگر پاسخ را در یادداشت ها پیدا کردی حتما بنویس : منبع و سپس یادداشت هایی که جواب را از آنها پیدا کردی را به این صورت لیست کن :
یادداشت شماره 5
یادداشت شماره 3

${contextText}

سوال کاربر:
${userQuestion}
  `.trim();
}
