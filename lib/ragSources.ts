export type RagSourceItem = {
    id: string | number;
    title: string | null;
    score: number;
};

export function extractUsedNoteIds(answer: string): number[] {
    if (!answer) return [];

    const ids = new Set<number>();

    const patterns = [
        /یادداشت\s*شماره\s*(\d+)/g,
        /یادداشت\s*(\d+)/g,
        /شناسه\s*یادداشت\s*[:：]?\s*(\d+)/g,
        /منبع\s*[:：]?\s*یادداشت\s*شماره\s*(\d+)/g,
    ];

    for (const pattern of patterns) {
        for (const match of answer.matchAll(pattern)) {
            const id = Number(match[1]);
            if (!Number.isNaN(id)) {
                ids.add(id);
            }
        }
    }

    return Array.from(ids);
}

export function stripSourcesSection(answer: string): string {
    return answer
        .replace(/(?:\n|^)\s*منبع\s*[:：]?\s*[\s\S]*$/u, "")
        .trim();
}

export function mapUsedSources(
    answer: string,
    retrievedSources: RagSourceItem[]
): RagSourceItem[] {
    const usedIds = new Set(extractUsedNoteIds(answer).map(String));

    return retrievedSources.filter((source) => usedIds.has(String(source.id)));
}
