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


from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


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