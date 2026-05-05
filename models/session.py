from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class CombatTurn(BaseModel):
    entity_id: str
    entity_name: str
    entity_type: str
    initiative: int


class CombatState(BaseModel):
    active: bool = False
    round: int = 1
    initiative_order: list[CombatTurn] = []
    current_turn_index: int = 0
    combatants: list[str] = []


class GameSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chronicle_id: str
    session_number: int = 1
    status: str = "lobby"  # lobby | exploring | combat | ended
    current_scene_id: str = ""
    entities: list[dict] = []
    combat: CombatState = Field(default_factory=CombatState)
    event_log: list[dict] = []
    connected_players: list[str] = []
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
