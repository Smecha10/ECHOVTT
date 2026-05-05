from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from pydantic import BaseModel
from services.game_engine import engine
from services.ai.base import AIProvider
from services.ai.deps import ai_provider_dep
from ws.manager import manager
from ws.handlers import handle_message
from models.entity import Entity
from models.session import GameSession

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


class NarrateRequest(BaseModel):
    session_id: str
    context: str = ""
    event: str


class EncounterRequest(BaseModel):
    session_id: str
    chronicle_id: str
    context: str = ""
    difficulty: str = "medium"
    count: int = 2


class SpawnRequest(BaseModel):
    session_id: str
    entity: dict


class MoveRequest(BaseModel):
    session_id: str
    entity_id: str
    position: list[int]


class ValidMovesRequest(BaseModel):
    session_id: str
    entity_id: str


class ValidTargetsRequest(BaseModel):
    session_id: str
    entity_id: str
    ability_range: int = 1


class DamageRequest(BaseModel):
    session_id: str
    target_id: str
    damage: int
    attacker_id: str = ""
    attack_range: int | None = None


@router.post("/start/{chronicle_id}")
async def start_session(chronicle_id: str):
    c = engine.get_chronicle(chronicle_id)
    if not c:
        raise HTTPException(404, "Chronicle not found")
    session = engine.get_or_create_session(chronicle_id)
    session.status = "exploring"
    from datetime import datetime
    if not session.started_at:
        session.started_at = datetime.utcnow()
    return session


@router.get("/chronicle/{chronicle_id}")
async def get_session_for_chronicle(chronicle_id: str):
    s = engine.get_session_for_chronicle(chronicle_id)
    if not s:
        raise HTTPException(404, "No active session")
    scene = engine.get_current_scene(s.id)
    return {"session": s, "scene": scene}


@router.get("/{session_id}")
async def get_session(session_id: str):
    s = engine.get_session(session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    scene = engine.get_current_scene(session_id)
    return {"session": s, "scene": scene}


@router.post("/spawn")
async def spawn_entity(req: SpawnRequest):
    entity = Entity(**req.entity)
    engine.add_entity(req.session_id, entity)
    await manager.broadcast(req.session_id, {
        "type": "entity_spawned",
        "entity": entity.model_dump(),
    })
    return entity


@router.post("/move")
async def move_entity(req: MoveRequest):
    """Move an entity with distance validation."""
    result = engine.move_entity(req.session_id, req.entity_id, req.position)
    if not result["success"]:
        raise HTTPException(400, result["reason"])
    await manager.broadcast(req.session_id, {
        "type": "entity_moved",
        "entity_id": req.entity_id,
        "position": req.position,
    })
    return result


@router.post("/valid-moves")
async def get_valid_moves(req: ValidMovesRequest):
    """Get all cells an entity can move to this turn (respects speed, obstacles, occupied cells)."""
    result = engine.get_valid_moves(req.session_id, req.entity_id)
    if result.get("error"):
        raise HTTPException(404, result["error"])
    return result


@router.post("/valid-targets")
async def get_valid_targets(req: ValidTargetsRequest):
    """Get all entities within ability range of the given entity."""
    result = engine.get_valid_targets(req.session_id, req.entity_id, req.ability_range)
    if result.get("error"):
        raise HTTPException(404, result["error"])
    return result


@router.post("/damage")
async def apply_damage(req: DamageRequest):
    """Apply damage with optional range validation."""
    result = engine.apply_damage(
        req.session_id, req.target_id, req.damage,
        attacker_id=req.attacker_id or None,
        attack_range=req.attack_range,
    )
    if not result.get("success", True):
        raise HTTPException(400, result.get("reason", "Damage failed"))
    if result.get("entity"):
        await manager.broadcast(req.session_id, {
            "type": "entity_damaged",
            "entity": result["entity"],
            "damage": req.damage,
        })
    return result


@router.post("/encounter")
async def generate_encounter(req: EncounterRequest, ai: AIProvider = Depends(ai_provider_dep)):
    c = engine.get_chronicle(req.chronicle_id)
    ctx = req.context or (c.overview[:300] if c else "a dangerous dungeon")
    return await ai.generate_encounter(ctx, req.difficulty, req.count)


@router.post("/narrate")
async def narrate(req: NarrateRequest, ai: AIProvider = Depends(ai_provider_dep)):
    text = await ai.generate_narration(req.context, req.event)
    event = engine.log_event(req.session_id, "narration", text)
    await manager.broadcast(req.session_id, {
        "type": "narration",
        "source": "ai",
        "text": text,
        "event": event,
    })
    return {"text": text}


@router.websocket("/ws/{session_id}/{player_id}")
async def ws_endpoint(websocket: WebSocket, session_id: str, player_id: str):
    await manager.connect(session_id, player_id, websocket)

    # Register player in session
    session = engine.get_session(session_id)
    if session and player_id not in session.connected_players:
        session.connected_players.append(player_id)

    # Send full state immediately
    session = engine.get_session(session_id)
    scene = engine.get_current_scene(session_id)
    await websocket.send_json({
        "type": "state_sync",
        "session": session.model_dump() if session else {},
        "scene": scene.model_dump() if scene else None,
    })

    await manager.broadcast(session_id, {
        "type": "player_connected",
        "player_id": player_id,
    }, exclude=player_id)

    try:
        while True:
            data = await websocket.receive_json()
            await handle_message(session_id, player_id, data)
    except WebSocketDisconnect:
        manager.disconnect(session_id, player_id)
        if session and player_id in session.connected_players:
            session.connected_players.remove(player_id)
        await manager.broadcast(session_id, {
            "type": "player_disconnected",
            "player_id": player_id,
        })
