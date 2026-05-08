from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
# model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
class EmbedRequest(BaseModel):
    text: str

@app.post("/embed")
def embed(req: EmbedRequest):
    vector = model.encode(req.text, normalize_embeddings=True).tolist()
    return {
        "embedding": vector,
        "dimension": len(vector)
    }
