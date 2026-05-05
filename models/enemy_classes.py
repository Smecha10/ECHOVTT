"""
ECHO VTT — Enemy Class Archetypes

Defines enemy class templates that modify base stats when generating enemies.
Similar to player classes but for monsters/NPCs.
"""

from pydantic import BaseModel


class EnemyClass(BaseModel):
    name: str
    description: str
    hp_multiplier: float = 1.0
    ac_modifier: int = 0
    attack_modifier: int = 0
    damage_dice: str = "1d6"
    movement_speed: int = 6
    attack_range: int = 1
    xp_multiplier: float = 1.0
    typical_abilities: list[str] = []
    sprite_keys: list[str] = []


ENEMY_CLASSES: dict[str, EnemyClass] = {
    "brute": EnemyClass(
        name="Brute",
        description="Heavy melee combatant with high HP and devastating close-range attacks.",
        hp_multiplier=1.5,
        ac_modifier=-1,
        attack_modifier=2,
        damage_dice="2d6+3",
        movement_speed=4,
        attack_range=1,
        xp_multiplier=1.2,
        typical_abilities=["Slam", "Reckless Attack", "Grapple"],
        sprite_keys=["orc", "golem", "boss"],
    ),
    "caster": EnemyClass(
        name="Caster",
        description="Ranged magical attacker with powerful spells but fragile defenses.",
        hp_multiplier=0.7,
        ac_modifier=-2,
        attack_modifier=3,
        damage_dice="2d8+4",
        movement_speed=5,
        attack_range=6,
        xp_multiplier=1.5,
        typical_abilities=["Ether Bolt", "Veil Rend", "Shield"],
        sprite_keys=["mage", "cultist"],
    ),
    "assassin": EnemyClass(
        name="Assassin",
        description="Fast, stealthy striker that deals massive burst damage from ambush.",
        hp_multiplier=0.8,
        ac_modifier=1,
        attack_modifier=4,
        damage_dice="2d8+3",
        movement_speed=8,
        attack_range=1,
        xp_multiplier=1.4,
        typical_abilities=["Ambush", "Vanish", "Backstab"],
        sprite_keys=["shade", "cultist"],
    ),
    "tank": EnemyClass(
        name="Tank",
        description="Heavily armored defender that absorbs damage and protects allies.",
        hp_multiplier=1.8,
        ac_modifier=3,
        attack_modifier=0,
        damage_dice="1d8+2",
        movement_speed=4,
        attack_range=1,
        xp_multiplier=1.3,
        typical_abilities=["Shield Wall", "Taunt", "Fortify"],
        sprite_keys=["guard", "golem"],
    ),
    "healer": EnemyClass(
        name="Healer",
        description="Support enemy that restores HP to allies and applies buffs.",
        hp_multiplier=0.9,
        ac_modifier=0,
        attack_modifier=1,
        damage_dice="1d6+1",
        movement_speed=5,
        attack_range=4,
        xp_multiplier=1.6,
        typical_abilities=["Mend", "Barrier", "Purify"],
        sprite_keys=["cultist", "mage"],
    ),
    "swarm": EnemyClass(
        name="Swarm",
        description="Weak individually but dangerous in numbers. Low HP, fast, overwhelm with attacks.",
        hp_multiplier=0.4,
        ac_modifier=-2,
        attack_modifier=1,
        damage_dice="1d4+1",
        movement_speed=7,
        attack_range=1,
        xp_multiplier=0.4,
        typical_abilities=["Swarm Attack", "Pack Tactics"],
        sprite_keys=["spider", "wolf"],
    ),
    "artillery": EnemyClass(
        name="Artillery",
        description="Long-range attacker that deals consistent damage from far away.",
        hp_multiplier=0.6,
        ac_modifier=-1,
        attack_modifier=3,
        damage_dice="2d6+3",
        movement_speed=4,
        attack_range=8,
        xp_multiplier=1.3,
        typical_abilities=["Snipe", "Volley", "Overwatch"],
        sprite_keys=["guard", "cultist"],
    ),
    "boss": EnemyClass(
        name="Boss",
        description="Powerful unique enemy with multiple abilities, high stats, and legendary actions.",
        hp_multiplier=3.0,
        ac_modifier=2,
        attack_modifier=4,
        damage_dice="2d10+5",
        movement_speed=5,
        attack_range=2,
        xp_multiplier=3.0,
        typical_abilities=["Legendary Action", "Multi-Attack", "Aura of Fear", "Phase Shift"],
        sprite_keys=["boss"],
    ),
}


def apply_enemy_class(base_hp: int, base_ac: int, base_attack: int, enemy_class_name: str) -> dict:
    """Apply enemy class modifiers to base stats and return adjusted values."""
    ec = ENEMY_CLASSES.get(enemy_class_name.lower())
    if not ec:
        return {
            "hp": base_hp, "ac": base_ac, "attack_bonus": base_attack,
            "damage_dice": "1d6", "movement_speed": 6, "attack_range": 1,
            "xp_multiplier": 1.0,
        }
    return {
        "hp": int(base_hp * ec.hp_multiplier),
        "ac": base_ac + ec.ac_modifier,
        "attack_bonus": base_attack + ec.attack_modifier,
        "damage_dice": ec.damage_dice,
        "movement_speed": ec.movement_speed,
        "attack_range": ec.attack_range,
        "xp_multiplier": ec.xp_multiplier,
    }
