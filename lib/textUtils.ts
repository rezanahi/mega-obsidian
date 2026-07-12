export function cleanNoteContent(content: string): string {
    return content.replace(/ ```[\s\S]*?```/g, " ")
        .replace(/`[^`]*`/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/[#>*_\-\n\r\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function generateNotePreview(content: string, maxLength = 300): string {
    const cleaned = cleanNoteContent(content);
    return cleaned.slice(0, maxLength).trim();
}

export function buildEmbeddingText(title: string, content: string): string {
    const preview = generateNotePreview(content, 300);
    return [title?.trim(), preview].filter(Boolean).join(". ");
}

export function isLowSignalNote(title: string, content: string): boolean {
    const text = `${title || ""} ${cleanNoteContent(content || "")}`.trim();

    if (text.length < 20) return true;

    const normalized = text.toLowerCase();

    if (/^(test|demo|sample|tmp|hello)+$/i.test(normalized.replace(/\s+/g, ""))) {
        return true;
    }

    if (/^(تست|نمونه|موقت)+$/i.test(normalized.replace(/\s+/g, ""))) {
        return true;
    }

    return false;
}
