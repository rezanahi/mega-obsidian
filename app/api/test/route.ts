import { getEmbedding } from "@/lib/embedding";

export async function GET() {
    const emb = await getEmbedding("سلام این یک تست است");
    return Response.json({
        dim: emb.length,
        sample: emb.slice(0, 10),
    });
}
