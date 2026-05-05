from pydantic import BaseModel, Field
from typing import Optional
import uuid


class EchoScores(BaseModel):
    force: int = 10
    grace: int = 10
    mind: int = 10
    presence: int = 10
    ether: int = 10
    endurance: int = 10


class Binding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    type: str = "active"  # active | passive
    dice: str = ""
    cooldown: int = 0
    current_cooldown: int = 0
    effect: str = ""
    icon: str = "⚡"
    targeting: str = "single"  # single | aoe | self
    range: int = 1             # grid cells — 1=melee, higher=ranged
    aoe_radius: int = 0        # 0=single target, >0=area effect radius


CLASS_BINDINGS: dict[str, list[dict]] = {
    "vanguard": [
        {"name": "Ironslash", "description": "A powerful downward strike", "type": "active", "dice": "2d6+4", "cooldown": 0, "effect": "Melee damage to one target", "icon": "⚔", "targeting": "single", "range": 1, "aoe_radius": 0},
        {"name": "Shieldwall", "description": "Raise your guard and brace for impact", "type": "active", "dice": "", "cooldown": 2, "effect": "+4 AC for 1 turn", "icon": "🛡", "targeting": "self", "range": 0, "aoe_radius": 0},
        {"name": "War Cry", "description": "A battle shout that draws enemy attention", "type": "active", "dice": "", "cooldown": 3, "effect": "Taunt enemies in 3-cell radius for 1 turn", "icon": "📯", "targeting": "aoe", "range": 0, "aoe_radius": 3},
        {"name": "Stalwart", "description": "Reduce all incoming damage through grit", "type": "passive", "dice": "", "cooldown": 0, "effect": "Reduce damage taken by 2", "icon": "💪", "targeting": "self", "range": 0, "aoe_radius": 0},
    ],
    "pathfinder": [
        {"name": "Twin Fang", "description": "Two rapid precision strikes in quick succession", "type": "active", "dice": "2×1d8+3", "cooldown": 0, "effect": "Two attacks on single target", "icon": "🏹", "targeting": "single", "range": 7, "aoe_radius": 0},
        {"name": "Eagle Eye", "description": "Reveal a hidden area", "type": "active", "dice": "", "cooldown": 2, "effect": "Remove Veil in 4-cell radius", "icon": "👁", "targeting": "aoe", "range": 8, "aoe_radius": 4},
        {"name": "Smoke Veil", "description": "Throw a blinding smoke bomb", "type": "active", "dice": "", "cooldown": 3, "effect": "Blind enemies in 3-cell radius for 2 turns", "icon": "🌫", "targeting": "aoe", "range": 5, "aoe_radius": 3},
        {"name": "Fleet-footed", "description": "Move with exceptional speed through any terrain", "type": "passive", "dice": "", "cooldown": 0, "effect": "Ignore difficult terrain, +2 movement speed", "icon": "👤", "targeting": "self", "range": 0, "aoe_radius": 0},
    ],
    "arcanist": [
        {"name": "Ether Bolt", "description": "A lance of raw arcane energy", "type": "active", "dice": "2d8+5", "cooldown": 0, "effect": "Ranged ether damage", "icon": "⚡", "targeting": "single", "range": 6, "aoe_radius": 0},
        {"name": "Veil Rend", "description": "Tear through magical barriers in a cone", "type": "active", "dice": "3d6+4", "cooldown": 3, "effect": "AOE ether damage in 4-cell cone", "icon": "🌀", "targeting": "aoe", "range": 5, "aoe_radius": 4},
        {"name": "Nullfield", "description": "Suppress enemy ether use", "type": "active", "dice": "", "cooldown": 4, "effect": "Target cannot use abilities for 2 turns", "icon": "🔮", "targeting": "single", "range": 5, "aoe_radius": 0},
        {"name": "Ether Shell", "description": "Crystallized ether deflects incoming damage", "type": "passive", "dice": "", "cooldown": 0, "effect": "Block 1d4 damage per hit", "icon": "🛡", "targeting": "self", "range": 0, "aoe_radius": 0},
    ],
    "warden": [
        {"name": "Root Strike", "description": "Strike and bind the target in place", "type": "active", "dice": "1d10+3", "cooldown": 0, "effect": "Damage and immobilize for 1 turn", "icon": "🌿", "targeting": "single", "range": 2, "aoe_radius": 0},
        {"name": "Verdant Mend", "description": "Channel natural energy to heal an ally", "type": "active", "dice": "2d6+3", "cooldown": 2, "effect": "Restore HP to target ally", "icon": "💚", "targeting": "single", "range": 4, "aoe_radius": 0},
        {"name": "Thornwall", "description": "Surround yourself with razor-sharp vines", "type": "active", "dice": "1d4", "cooldown": 3, "effect": "Attackers within 2 cells take 1d4 damage", "icon": "🌵", "targeting": "self", "range": 0, "aoe_radius": 2},
        {"name": "Nature's Sight", "description": "Commune with the land to sense hidden threats", "type": "passive", "dice": "", "cooldown": 0, "effect": "Detect hidden enemies within 5 cells", "icon": "🌍", "targeting": "self", "range": 0, "aoe_radius": 5},
    ],
    "specter": [
        {"name": "Shadow Strike", "description": "Attack from the shadows for extra damage", "type": "active", "dice": "2d8+4", "cooldown": 0, "effect": "Bonus damage when attacking from stealth", "icon": "🗡", "targeting": "single", "range": 1, "aoe_radius": 0},
        {"name": "Vanish", "description": "Melt into the shadows", "type": "active", "dice": "", "cooldown": 2, "effect": "Enter stealth for 2 turns", "icon": "🌑", "targeting": "self", "range": 0, "aoe_radius": 0},
        {"name": "Venomous Edge", "description": "Apply a slow-acting poison", "type": "active", "dice": "1d6", "cooldown": 3, "effect": "Target takes 1d6 poison each turn for 3 turns", "icon": "☠", "targeting": "single", "range": 2, "aoe_radius": 0},
        {"name": "Slippery", "description": "Slip out of holds with practiced ease", "type": "passive", "dice": "", "cooldown": 0, "effect": "Advantage on escaping grapples", "icon": "🪄", "targeting": "self", "range": 0, "aoe_radius": 0},
    ],
    "herald": [
        {"name": "Inspiring Word", "description": "Bolster an ally with a shout of encouragement", "type": "active", "dice": "1d6", "cooldown": 0, "effect": "Ally gains 1d6 temp HP and +2 to next roll", "icon": "🎵", "targeting": "single", "range": 4, "aoe_radius": 0},
        {"name": "Dissonant Pulse", "description": "A wave of disorienting arcane sound", "type": "active", "dice": "2d6+2", "cooldown": 2, "effect": "AOE sonic damage + stun 1 turn", "icon": "📢", "targeting": "aoe", "range": 0, "aoe_radius": 3},
        {"name": "Rallying Cry", "description": "Restore the will to fight", "type": "active", "dice": "2d4+3", "cooldown": 4, "effect": "Heal all allies within 4 cells", "icon": "🔔", "targeting": "aoe", "range": 0, "aoe_radius": 4},
        {"name": "Resonance", "description": "Your presence amplifies allies' power", "type": "passive", "dice": "", "cooldown": 0, "effect": "Allies within 3 cells deal +1 damage", "icon": "✨", "targeting": "self", "range": 0, "aoe_radius": 3},
    ],
    "ironwright": [
        {"name": "Arcane Bolt", "description": "Fire a bolt of mechanized energy", "type": "active", "dice": "2d6+3", "cooldown": 0, "effect": "Ranged arcane damage", "icon": "🔧", "targeting": "single", "range": 5, "aoe_radius": 0},
        {"name": "Deploy Construct", "description": "Summon a mechanical companion", "type": "active", "dice": "", "cooldown": 4, "effect": "Summon a construct within 3 cells", "icon": "🤖", "targeting": "self", "range": 3, "aoe_radius": 0},
        {"name": "Overcharge", "description": "Push your arcane tools beyond their limits", "type": "active", "dice": "3d8+5", "cooldown": 5, "effect": "Massive damage but construct is destroyed", "icon": "⚙", "targeting": "single", "range": 4, "aoe_radius": 0},
        {"name": "Jury Rig", "description": "Improvise repairs in the field", "type": "passive", "dice": "", "cooldown": 0, "effect": "Restore 1d4 HP to yourself or construct within 2 cells once per combat", "icon": "🔩", "targeting": "self", "range": 2, "aoe_radius": 0},
    ],
}


class Character(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    player_id: str
    class_name: str = "vanguard"
    origin: str = "coastal"
    ether_affinity: str = "fire"
    level: int = 1
    xp: int = 0
    hp: int = 40
    max_hp: int = 40
    ether_points: int = 8
    max_ether: int = 8
    echo_scores: EchoScores = Field(default_factory=EchoScores)
    bindings: list[Binding] = []
    inventory: list[dict] = []
    portrait_url: str = ""
    appearance_prompt: str = ""
    color: str = "#7c5cbf"
    movement_speed: int = 6  # grid cells per turn


CLASS_COLORS = {
    "vanguard": "#c0392b",
    "pathfinder": "#27ae60",
    "arcanist": "#7c5cbf",
    "warden": "#2ecc71",
    "specter": "#8e44ad",
    "herald": "#f39c12",
    "ironwright": "#3498db",
}

# Default movement speeds per class
CLASS_MOVEMENT = {
    "vanguard": 5,      # Heavy armor, slow
    "pathfinder": 8,    # Scout, fast
    "arcanist": 5,      # Squishy caster
    "warden": 6,        # Standard
    "specter": 7,       # Quick rogue
    "herald": 6,        # Standard
    "ironwright": 5,    # Weighted down by gear
}


class CharacterClass(BaseModel):
    name: str
    description: str
    primary_stat: str = "force"
    role: str = "dps"
    movement_speed: int = 6


CLASSES: dict[str, CharacterClass] = {
    "vanguard":   CharacterClass(name="Vanguard",   description="Front-line warrior with heavy armor and crowd control.", primary_stat="force", role="tank", movement_speed=5),
    "pathfinder": CharacterClass(name="Pathfinder", description="Scout and ranger excelling at mobility and precision.", primary_stat="grace", role="dps", movement_speed=8),
    "arcanist":   CharacterClass(name="Arcanist",   description="Master of ether manipulation and long-range devastation.", primary_stat="ether", role="dps", movement_speed=5),
    "warden":     CharacterClass(name="Warden",     description="Nature-bonded protector who heals and controls terrain.", primary_stat="endurance", role="support", movement_speed=6),
    "specter":    CharacterClass(name="Specter",    description="Shadow operative who strikes from stealth for massive damage.", primary_stat="grace", role="dps", movement_speed=7),
    "herald":     CharacterClass(name="Herald",     description="Voice of inspiration who buffs allies and disrupts enemies.", primary_stat="presence", role="support", movement_speed=6),
    "ironwright": CharacterClass(name="Ironwright", description="Inventor who deploys arcane constructs in battle.", primary_stat="mind", role="dps", movement_speed=5),
}


class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    display_name: str
    email: str = ""
    password_hash: str = ""
    character: Optional[Character] = None
    is_guest: bool = False
