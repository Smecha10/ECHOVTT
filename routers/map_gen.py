from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ai.base import AIProvider
from services.ai.deps import ai_provider_dep
from services.game_engine import engine
from maps.generator import MapGenerator

router = APIRouter(prefix="/api/maps", tags=["maps"])
map_gen = MapGenerator()


class MapGenerateRequest(BaseModel):
    chronicle_id: str
    scene_config: dict = {}


class MapRegenerateRequest(BaseModel):
    chronicle_id: str
    scene_id: str
    config: dict = {}


@router.post("/generate")
async def generate_map(req: MapGenerateRequest, ai: AIProvider = Depends(ai_provider_dep)):
    """Generate an AI-powered map layout for a chronicle scene."""
    c = engine.get_chronicle(req.chronicle_id)
    if not c:
        raise HTTPException(404, "Chronicle not found")

    # Build context from chronicle config
    config = req.scene_config or {}
    if c.config:
        config.setdefault("tone", c.config.tone)
        config.setdefault("setting_era", c.config.setting_era)
        config.setdefault("map_theme", c.config.map_theme)
        config.setdefault("scene_atmosphere", c.config.scene_atmosphere)
        config.setdefault("starting_location", c.config.starting_location)
        config.setdefault("environmental_hazards", c.config.environmental_hazards)
        config.setdefault("points_of_interest", c.config.points_of_interest)

    # Generate AI map layout
    layout = await ai.generate_map_layout(config)

    # Build the grid from the layout
    grid = map_gen.build_grid_from_layout(layout)

    return {
        "layout": layout,
        "grid": grid,
        "width": layout.get("width", 24),
        "height": layout.get("height", 18),
    }


@router.post("/regenerate")
async def regenerate_map(req: MapRegenerateRequest, ai: AIProvider = Depends(ai_provider_dep)):
    """Regenerate a specific scene's map."""
    c = engine.get_chronicle(req.chronicle_id)
    if not c:
        raise HTTPException(404, "Chronicle not found")

    scene = None
    for s in c.scenes:
        if s.id == req.scene_id:
            scene = s
            break
    if not scene:
        raise HTTPException(404, "Scene not found")

    config = req.config or {}
    config["scene_name"] = scene.name
    config["scene_description"] = scene.description
    config["terrain_type"] = scene.terrain_type

    layout = await ai.generate_map_layout(config)
    grid = map_gen.build_grid_from_layout(layout)

    # Update the scene
    scene.grid = grid
    scene.width = layout.get("width", scene.width)
    scene.height = layout.get("height", scene.height)
    engine.save_chronicle(c)

    return {
        "layout": layout,
        "grid": grid,
        "width": scene.width,
        "height": scene.height,
        "scene_id": scene.id,
    }
