from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.game_engine import engine
from services.ai.base import AIProvider
from services.ai.deps import ai_provider_dep
from models.chronicle import Chronicle, ChronicleConfig, Scene, Faction
import uuid

router = APIRouter(prefix="/api/chronicles", tags=["chronicles"])


class CreateRequest(BaseModel):
    name: str
    gm_id: str


class GenerateRequest(BaseModel):
    chronicle_id: str
    config: dict


@router.post("/")
async def create_chronicle(req: CreateRequest):
    c = engine.create_chronicle(req.gm_id, req.name)
    return c


@router.get("/gm/{gm_id}")
async def list_chronicles(gm_id: str):
    return engine.list_chronicles(gm_id)


@router.get("/{chronicle_id}")
async def get_chronicle(chronicle_id: str):
    c = engine.get_chronicle(chronicle_id)
    if not c:
        raise HTTPException(404, "Chronicle not found")
    return c


@router.patch("/{chronicle_id}")
async def update_chronicle(chronicle_id: str, updates: dict):
    c = engine.get_chronicle(chronicle_id)
    if not c:
        raise HTTPException(404, "Chronicle not found")
    for key, value in updates.items():
        if hasattr(c, key):
            setattr(c, key, value)
    engine.save_chronicle(c)
    return c


@router.post("/generate")
async def generate_chronicle(req: GenerateRequest, ai: AIProvider = Depends(ai_provider_dep)):
    c = engine.get_chronicle(req.chronicle_id)
    if not c:
        raise HTTPException(404, "Chronicle not found")
    result = await ai.build_chronicle(req.config)

    if not result:
        raise HTTPException(500, "AI generation failed")

    c.overview = result.get("overview", "")
    c.gm_notes = result.get("gm_notes", "")
    c.opening_hook = result.get("opening_hook", "")
    c.factions = [Faction(**f) for f in result.get("factions", [])]
    c.bestiary = result.get("bestiary", [])

    scene_data = result.get("starting_scene", {})
    if scene_data:
        scene = Scene(
            name=scene_data.get("name", "Starting Scene"),
            description=scene_data.get("description", ""),
            terrain_type=scene_data.get("terrain_type", "stone"),
            width=scene_data.get("width", 20),
            height=scene_data.get("height", 15),
        )
        c.scenes = [scene]

    valid_keys = ChronicleConfig.model_fields.keys()
    config_data = {k: v for k, v in req.config.items() if k in valid_keys}
    c.config = ChronicleConfig(**config_data)
    c.status = "active"

    engine.save_chronicle(c)
    return {"chronicle": c, "ai_result": result}


@router.get("/join/{join_code}")
async def get_by_join_code(join_code: str):
    c = engine.get_chronicle_by_code(join_code)
    if not c:
        raise HTTPException(404, "Invalid join code")
    return {
        "id": c.id,
        "name": c.name,
        "status": c.status,
        "max_players": c.max_players,
        "overview": c.overview,
        "join_code": c.join_code,
    }
