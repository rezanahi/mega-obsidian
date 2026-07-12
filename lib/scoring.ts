const STOPWORDS = new Set([
    "و",
    "در",
    "به",
    "از",
    "که",
    "را",
    "با",
    "برای",
    "این",
    "آن",
    "یک",
    "است",
    "های",
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
]);

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .split(/[^a-z0-9\u0600-\u06ff]+/i)
        .map((x) => x.trim())
        .filter((x) => x.length >= 2 && !STOPWORDS.has(x));
}

export function keywordOverlapScore(a: string, b: string): number {
    const aTokens = Array.from(new Set(tokenize(a)));
    const bTokens = new Set(tokenize(b));

    if (aTokens.length === 0) return 0;

    const matchCount = aTokens.filter((token) => bTokens.has(token)).length;
    return matchCount / aTokens.length;
}

export function titleSimilarityScore(a: string, b: string): number {
    return keywordOverlapScore(a, b);
}

export function calculateHybridScore(args: {
    semanticScore: number;
    queryTitle: string;
    queryContent: string;
    candidateTitle: string;
    candidateContent: string;
}): number {
    const {
        semanticScore,
        queryTitle,
        queryContent,
        candidateTitle,
        candidateContent,
    } = args;

    const keywordScore = keywordOverlapScore(queryContent, candidateContent);
    const titleScore = titleSimilarityScore(queryTitle, candidateTitle);

    return semanticScore * 0.6 + keywordScore * 0.25 + titleScore * 0.15;
}
