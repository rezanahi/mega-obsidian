from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()

model = SentenceTransformer("intfloat/multilingual-e5-base")
# model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
# model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")


class EmbedRequest(BaseModel):
    text: str
    input_type: str = "passage"   # query | passage

@app.post("/embed")
def embed(req: EmbedRequest):
    prefix = "query: " if req.input_type == "query" else "passage: "
    formatted_text = prefix + req.text

    vector = model.encode(formatted_text, normalize_embeddings=True).tolist()

    return {
        "embedding": vector,
        "dimension": len(vector)
    }