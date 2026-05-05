from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import chronicles, sessions, players, ai_gen, map_gen

app = FastAPI(
    title="ECHO VTT",
    version="1.0.0",
    description="AI-powered fantasy tabletop RPG platform. Open source — swap any AI provider via .env.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chronicles.router)
app.include_router(sessions.router)
app.include_router(players.router)
app.include_router(ai_gen.router)
app.include_router(map_gen.router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "ai_provider": settings.ai_provider,
        "payments_enabled": settings.payments_enabled,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=settings.debug)
