from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.game_engine import engine
from models.player import Player, Character, CLASS_BINDINGS, CLASS_COLORS, Binding
import hashlib
import uuid

router = APIRouter(prefix="/api/players", tags=["players"])


def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


class RegisterRequest(BaseModel):
    display_name: str
    email: str = ""
    password: str = ""
    is_guest: bool = False


class LoginRequest(BaseModel):
    email: str
    password: str


class CharacterRequest(BaseModel):
    player_id: str
    name: str
    class_name: str = "vanguard"
    origin: str = "coastal"
    ether_affinity: str = "fire"
    appearance_prompt: str = ""


@router.post("/register")
async def register(req: RegisterRequest):
    player = Player(
        display_name=req.display_name,
        email=req.email,
        password_hash=_hash(req.password) if req.password else "",
        is_guest=req.is_guest,
    )
    engine.players[player.id] = player
    return {"player_id": player.id, "display_name": player.display_name}


@router.post("/login")
async def login(req: LoginRequest):
    ph = _hash(req.password)
    for p in engine.players.values():
        if p.email == req.email and p.password_hash == ph:
            return {"player_id": p.id, "display_name": p.display_name}
    raise HTTPException(401, "Invalid credentials")


@router.post("/guest")
async def guest(data: dict):
    name = data.get("display_name") or f"Wanderer-{str(uuid.uuid4())[:4].upper()}"
    player = Player(display_name=name, is_guest=True)
    engine.players[player.id] = player
    return {"player_id": player.id, "display_name": player.display_name}


@router.get("/classes")
async def list_classes():
    from models.player import CLASSES
    return [{"id": k, **v.model_dump()} for k, v in CLASSES.items()]


@router.get("/{player_id}")
async def get_player(player_id: str):
    p = engine.players.get(player_id)
    if not p:
        raise HTTPException(404, "Player not found")
    return p


@router.post("/character")
async def create_character(req: CharacterRequest):
    player = engine.players.get(req.player_id)
    if not player:
        raise HTTPException(404, "Player not found")

    raw_bindings = CLASS_BINDINGS.get(req.class_name, CLASS_BINDINGS["vanguard"])
    bindings = [Binding(id=str(uuid.uuid4()), **b) for b in raw_bindings]

    color = CLASS_COLORS.get(req.class_name, "#7c5cbf")
    character = Character(
        name=req.name,
        player_id=req.player_id,
        class_name=req.class_name,
        origin=req.origin,
        ether_affinity=req.ether_affinity,
        bindings=bindings,
        appearance_prompt=req.appearance_prompt,
        color=color,
    )
    player.character = character
    return character
