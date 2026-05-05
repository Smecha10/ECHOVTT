import uuid
import random
from datetime import datetime
from typing import Optional
from models.chronicle import Chronicle, Scene
from models.player import Player, Character
from models.session import GameSession, CombatState, CombatTurn
from models.entity import Entity
from core.distance import (
    grid_distance, is_in_range, reachable_cells, entities_in_range, find_path
)
from maps.generator import MapGenerator


class GameEngine:
    """
    In-memory game state manager.
    For production, replace the dicts with database calls.
    """

    def __init__(self):
        self.chronicles: dict[str, Chronicle] = {}
        self.players: dict[str, Player] = {}
        self.sessions: dict[str, GameSession] = {}
        self.join_codes: dict[str, str] = {}  # join_code -> chronicle_id
        self.map_gen = MapGenerator()

    # ── Chronicles ─────────────────────────────────────────────────────

    def create_chronicle(self, gm_id: str, name: str) -> Chronicle:
        c = Chronicle(name=name, gm_id=gm_id)
        self.chronicles[c.id] = c
        self.join_codes[c.join_code] = c.id
        return c

    def get_chronicle(self, chronicle_id: str) -> Optional[Chronicle]:
        return self.chronicles.get(chronicle_id)

    def get_chronicle_by_code(self, join_code: str) -> Optional[Chronicle]:
        cid = self.join_codes.get(join_code.upper())
        return self.chronicles.get(cid) if cid else None

    def list_chronicles(self, gm_id: str) -> list[Chronicle]:
        return [c for c in self.chronicles.values() if c.gm_id == gm_id]

    def save_chronicle(self, chronicle: Chronicle):
        self.chronicles[chronicle.id] = chronicle
        self.join_codes[chronicle.join_code] = chronicle.id

    # ── Sessions ───────────────────────────────────────────────────────

    def get_or_create_session(self, chronicle_id: str) -> GameSession:
        for s in self.sessions.values():
            if s.chronicle_id == chronicle_id and s.status != "ended":
                return s
        c = self.chronicles[chronicle_id]
        session = GameSession(
            chronicle_id=chronicle_id,
            session_number=c.session_count + 1,
            status="lobby",
        )
        if c.scenes:
            session.current_scene_id = c.scenes[0].id
        self.sessions[session.id] = session
        return session

    def get_session(self, session_id: str) -> Optional[GameSession]:
        return self.sessions.get(session_id)

    def get_session_for_chronicle(self, chronicle_id: str) -> Optional[GameSession]:
        for s in self.sessions.values():
            if s.chronicle_id == chronicle_id and s.status != "ended":
                return s
        return None

    def get_current_scene(self, session_id: str) -> Optional[Scene]:
        session = self.sessions.get(session_id)
        if not session:
            return None
        c = self.chronicles.get(session.chronicle_id)
        if not c:
            return None
        for scene in c.scenes:
            if scene.id == session.current_scene_id:
                return scene
        return c.scenes[0] if c.scenes else None

    # ── Passability Helper ─────────────────────────────────────────────

    def _get_passable_fn(self, session_id: str):
        """Return a passability function for the current scene's grid."""
        scene = self.get_current_scene(session_id)
        if not scene or not scene.grid:
            return lambda x, y: True
        width = scene.width

        def is_passable(x: int, y: int) -> bool:
            if 0 <= x < scene.width and 0 <= y < scene.height:
                terrain = scene.grid[y * width + x]
                return terrain not in ("wall", "blocked")
            return False

        return is_passable

    # ── Entities ───────────────────────────────────────────────────────

    def add_entity(self, session_id: str, entity: Entity) -> bool:
        session = self.sessions.get(session_id)
        if not session:
            return False
        session.entities = [e for e in session.entities if e.get("id") != entity.id]
        session.entities.append(entity.model_dump())
        return True

    def move_entity(self, session_id: str, entity_id: str, position: list[int]) -> dict:
        """
        Move an entity to a new position. Validates distance against movement_speed.
        Returns {"success": bool, "reason": str, "entity": dict}.
        """
        session = self.sessions.get(session_id)
        if not session:
            return {"success": False, "reason": "Session not found"}

        entity = None
        for e in session.entities:
            if e["id"] == entity_id:
                entity = e
                break
        if not entity:
            return {"success": False, "reason": "Entity not found"}

        current_pos = entity.get("position", [0, 0])
        move_speed = entity.get("movement_speed", 6)
        distance = grid_distance(current_pos, position)

        # Validate movement distance
        if distance > move_speed:
            return {
                "success": False,
                "reason": f"Target is {distance} cells away but movement speed is {move_speed}",
                "entity": entity,
            }

        # Validate passability
        is_passable = self._get_passable_fn(session_id)
        if not is_passable(position[0], position[1]):
            return {
                "success": False,
                "reason": "Target cell is impassable",
                "entity": entity,
            }

        # Check if path exists (not just line-of-sight distance)
        scene = self.get_current_scene(session_id)
        if scene and scene.grid:
            path = find_path(
                current_pos, position,
                scene.width, scene.height,
                is_passable,
            )
            if path is None:
                return {
                    "success": False,
                    "reason": "No passable path to target",
                    "entity": entity,
                }
            path_cost = len(path) - 1
            if path_cost > move_speed:
                return {
                    "success": False,
                    "reason": f"Path requires {path_cost} moves but speed is {move_speed}",
                    "entity": entity,
                }

        entity["position"] = position
        return {"success": True, "reason": "ok", "entity": entity}

    def update_entity(self, session_id: str, entity_id: str, updates: dict) -> Optional[dict]:
        session = self.sessions.get(session_id)
        if not session:
            return None
        for entity in session.entities:
            if entity["id"] == entity_id:
                entity.update(updates)
                return entity
        return None

    def apply_damage(self, session_id: str, target_id: str, damage: int, attacker_id: str = None, attack_range: int = None) -> dict:
        """
        Apply damage with optional distance validation.
        If attacker_id and attack_range are provided, validates the attacker is in range.
        """
        session = self.sessions.get(session_id)
        if not session:
            return {"success": False, "reason": "Session not found"}

        # Find target
        target = None
        for entity in session.entities:
            if entity["id"] == target_id:
                target = entity
                break
        if not target:
            return {"success": False, "reason": "Target not found"}

        # Validate range if attacker specified
        if attacker_id and attack_range is not None:
            attacker = None
            for entity in session.entities:
                if entity["id"] == attacker_id:
                    attacker = entity
                    break
            if not attacker:
                return {"success": False, "reason": "Attacker not found"}

            if not is_in_range(attacker["position"], target["position"], attack_range):
                dist = grid_distance(attacker["position"], target["position"])
                return {
                    "success": False,
                    "reason": f"Target is {dist} cells away, attack range is {attack_range}",
                }

        target["hp"] = max(0, target["hp"] - damage)
        target["is_alive"] = target["hp"] > 0
        return {"success": True, "entity": target, "damage": damage}

    def apply_heal(self, session_id: str, target_id: str, amount: int) -> Optional[dict]:
        session = self.sessions.get(session_id)
        if not session:
            return None
        for entity in session.entities:
            if entity["id"] == target_id:
                entity["hp"] = min(entity["max_hp"], entity["hp"] + amount)
                return entity
        return None

    # ── Distance Queries ───────────────────────────────────────────────

    def get_valid_moves(self, session_id: str, entity_id: str) -> dict:
        """Get all cells an entity can move to this turn."""
        session = self.sessions.get(session_id)
        if not session:
            return {"cells": [], "error": "Session not found"}

        entity = None
        for e in session.entities:
            if e["id"] == entity_id:
                entity = e
                break
        if not entity:
            return {"cells": [], "error": "Entity not found"}

        scene = self.get_current_scene(session_id)
        if not scene:
            return {"cells": [], "error": "No active scene"}

        is_passable = self._get_passable_fn(session_id)
        occupied = [e["position"] for e in session.entities if e["id"] != entity_id and e.get("is_alive", True)]

        cells = reachable_cells(
            entity["position"],
            entity.get("movement_speed", 6),
            scene.width,
            scene.height,
            is_passable,
            occupied,
        )
        return {"cells": cells, "entity_id": entity_id, "movement_speed": entity.get("movement_speed", 6)}

    def get_valid_targets(self, session_id: str, entity_id: str, ability_range: int) -> dict:
        """Get all entities within ability range of the given entity."""
        session = self.sessions.get(session_id)
        if not session:
            return {"targets": [], "error": "Session not found"}

        entity = None
        for e in session.entities:
            if e["id"] == entity_id:
                entity = e
                break
        if not entity:
            return {"targets": [], "error": "Entity not found"}

        targets = entities_in_range(
            entity["position"],
            ability_range,
            [e for e in session.entities if e["id"] != entity_id],
        )
        return {
            "targets": targets,
            "entity_id": entity_id,
            "ability_range": ability_range,
            "origin": entity["position"],
        }

    # ── Combat ─────────────────────────────────────────────────────────

    def start_combat(self, session_id: str, combatant_ids: list[str]) -> CombatState:
        session = self.sessions[session_id]
        initiative_order = []
        for entity in session.entities:
            if entity["id"] in combatant_ids:
                # Initiative bonus factors in grace/speed + distance to nearest enemy
                base_bonus = max(0, (entity.get("ac", 12) - 12))
                speed_bonus = max(0, (entity.get("movement_speed", 6) - 5))

                roll = random.randint(1, 20) + base_bonus + speed_bonus
                initiative_order.append(CombatTurn(
                    entity_id=entity["id"],
                    entity_name=entity["name"],
                    entity_type=entity["type"],
                    initiative=roll,
                ))
        initiative_order.sort(key=lambda x: x.initiative, reverse=True)
        session.combat = CombatState(
            active=True,
            round=1,
            initiative_order=initiative_order,
            current_turn_index=0,
            combatants=combatant_ids,
        )
        session.status = "combat"
        return session.combat

    def end_combat(self, session_id: str):
        session = self.sessions[session_id]
        session.combat = CombatState(active=False)
        session.status = "exploring"

    def advance_turn(self, session_id: str) -> Optional[CombatTurn]:
        session = self.sessions.get(session_id)
        if not session or not session.combat.active:
            return None
        combat = session.combat
        next_idx = (combat.current_turn_index + 1) % len(combat.initiative_order)
        if next_idx == 0:
            combat.round += 1
        combat.current_turn_index = next_idx
        return combat.initiative_order[next_idx]

    def roll_dice(self, dice_str: str) -> dict:
        """Roll dice notation like '2d6+4'. Returns {rolls, modifier, total}."""
        import re
        match = re.match(r'(\d+)d(\d+)([+-]\d+)?', dice_str.replace(' ', ''))
        if not match:
            return {"rolls": [1], "modifier": 0, "total": 1}
        count = int(match.group(1))
        sides = int(match.group(2))
        modifier = int(match.group(3) or 0)
        rolls = [random.randint(1, sides) for _ in range(count)]
        return {"rolls": rolls, "modifier": modifier, "total": sum(rolls) + modifier}

    # ── Events ─────────────────────────────────────────────────────────

    def log_event(self, session_id: str, source: str, message: str, data: dict = {}) -> dict:
        session = self.sessions.get(session_id)
        if not session:
            return {}
        event = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "source": source,
            "message": message,
            "data": data,
        }
        session.event_log.append(event)
        if len(session.event_log) > 200:
            session.event_log = session.event_log[-200:]
        return event


engine = GameEngine()
