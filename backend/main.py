from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.retrieval import router as retrieval_router
from routes.translation import router as translation_router


app = FastAPI(title="Lawsutra AI Demo")


import os

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://demo-task-lawsutra.vercel.app",
    "*"
]

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "").strip()
if allowed_origins_raw:
    extra = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]
    origins.extend(extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


app.include_router(retrieval_router)
app.include_router(translation_router)


@app.get("/")
def root():
    return {
        "message": "Lawsutra AI backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "groq_configured": bool(os.getenv("GROQ_API_KEY"))
    }