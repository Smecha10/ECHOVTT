from pydantic import BaseModel, Field
import uuid


class StatusEffect(BaseModel):
    name: str
    duration: int
    description: str = ""


class Entity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str = "enemy"  # player | npc | enemy
    hp: int = 20
    max_hp: int = 20
    position: list[int] = [0, 0]
    status_effects: list[StatusEffect] = []
    initiative: int = 0
    sprite_key: str = "default"
    is_alive: bool = True
    ac: int = 12
    attack_bonus: int = 3
    damage_dice: str = "1d6"
    xp_reward: int = 50
    abilities: list[dict] = []
    personality: str = ""
    player_id: str = ""
    class_name: str = ""
    color: str = "#7c5cbf"

    # ── Distance & Movement ────────────────────────────────────────
    movement_speed: int = 6          # grid cells per turn
    attack_range: int = 1            # default melee range (cells)

    # ── Enemy Class & Advanced Stats ───────────────────────────────
    enemy_class: str = ""            # Brute | Caster | Assassin | Tank | Healer | Swarm | Artillery | Boss
    challenge_rating: int = 1       # 1-20 CR scale
    resistances: list[str] = []     # e.g. ["fire", "poison"]
    vulnerabilities: list[str] = [] # e.g. ["ice", "radiant"]
    loot_table: list[dict] = []     # [{"name": "Iron Sword", "drop_chance": 0.3}]
