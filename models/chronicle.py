from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Faction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    alignment: str = "neutral"  # ally | enemy | neutral
    visible_to_players: bool = True


class SceneObject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: list[int] = [0, 0]
    type: str = "prop"  # prop | door | chest | hazard
    passable: bool = True
    interactable: bool = False
    description: str = ""


class Scene(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    width: int = 24
    height: int = 18
    terrain_type: str = "stone"
    grid: list[str] = []
    objects: list[SceneObject] = []
    fog_of_war: list[bool] = []

    def model_post_init(self, __context) -> None:
        if not self.grid:
            self.grid = [self.terrain_type] * (self.width * self.height)
        if not self.fog_of_war:
            self.fog_of_war = [True] * (self.width * self.height)


class ChronicleConfig(BaseModel):
    # ── Step 1: World ──────────────────────────────────────────────
    tone: list[str] = []
    setting_era: str = ""
    geography_style: str = ""
    magic_style: str = ""
    free_text: str = ""
    geography_description: str = ""       # "Describe the landscape..."
    key_locations: str = ""               # "Name 2-3 important places..."
    cultural_details: str = ""            # "What makes this world's people unique?"
    world_secrets: str = ""               # GM-only hidden truths

    # ── Step 2: Story ──────────────────────────────────────────────
    central_conflict: str = ""
    campaign_length: int = 6
    player_agency: float = 0.7
    antagonist_description: str = ""      # "Describe the main villain or threat"
    key_npcs: str = ""                    # "Important characters the players will meet"
    plot_twists: str = ""                 # GM-only surprise elements
    starting_situation: str = ""          # "Where do the players begin and why?"
    stakes: list[str] = []               # Personal, Regional, World-ending, Cosmic

    # ── Step 3: Factions ───────────────────────────────────────────
    num_factions: int = 3
    faction_naming_style: list[str] = []  # Real-world, Invented, Symbolic, Militaristic
    faction_relationships: str = ""       # "How do factions interact?"
    player_faction: str = ""              # "Is there a faction players belong to?"
    hidden_factions: str = ""             # Secret organizations
    political_landscape: str = ""         # "Who holds power and how?"

    # ── Step 4: Scenes & Exploration ───────────────────────────────
    combat_frequency: float = 0.5
    starting_location: list[str] = []     # Tavern, City Gate, Wilderness, etc.
    scene_atmosphere: str = ""            # "Describe the mood of the opening scene"
    environmental_hazards: list[str] = [] # Traps, Weather, Cursed Areas, etc.
    points_of_interest: str = ""          # "Notable features, hidden passages..."
    exploration_style: list[str] = []     # Linear, Open World, Branching, Hub-based
    map_theme: str = ""                   # "Describe the visual style of the map"

    # ── Step 5: Bestiary & Rewards ─────────────────────────────────
    enemy_variety: float = 0.5
    difficulty_curve: str = "gradual"
    loot_style: str = "moderate"
    enemy_theme: str = ""                 # "What kind of creatures inhabit this world?"
    boss_concept: str = ""                # "Describe the ultimate enemy encounter"
    minion_types: list[str] = []          # Undead, Beasts, Humanoid, etc.
    loot_description: str = ""            # "What kind of treasures exist?"
    special_rewards: str = ""             # "Unique items, legendary weapons..."
    enemy_tactics: list[str] = []         # Swarm, Tactical, Ambush, etc.


class Chronicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    gm_id: str
    join_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    status: str = "draft"  # draft | active | paused | archived
    config: ChronicleConfig = Field(default_factory=ChronicleConfig)
    overview: str = ""
    gm_notes: str = ""
    opening_hook: str = ""
    factions: list[Faction] = []
    scenes: list[Scene] = []
    bestiary: list[dict] = []
    max_players: int = 4
    tier: str = "standard"  # standard | epic
    session_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
