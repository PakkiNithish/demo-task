from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.retrieval import router as retrieval_router
from routes.translation import router as translation_router


app = FastAPI(title="Lawsutra AI Demo")


import os

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "").strip()
if allowed_origins_raw:
    origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]
    allow_creds = "*" not in origins
else:
    # Default for local dev and easy deployment
    origins = ["*"]
    allow_creds = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "status": "ok"
    }