export async function getEmbedding(
    text: string,
    inputType: "query" | "passage" = "passage"
): Promise<number[]> {
    const res = await fetch("http://127.0.0.1:8001/embed", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text,
            input_type: inputType,
        }),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Embedding service error: ${res.status}`);
    }

    const data = await res.json();
    return data.embedding;
}
