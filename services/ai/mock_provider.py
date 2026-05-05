import asyncio
import json
import random
from typing import AsyncGenerator
from services.ai.base import AIProvider


MOCK_CHRONICLE = {
    "overview": "The realm of Ashenveil was once a land of ancient magic and forgotten empires. Three centuries have passed since the Sundering — a catastrophic event that tore the Veil between worlds and left the land scarred with ether storms and wandering spirits. Now, four factions vie for control of the Echo Shards, crystallized fragments of the original Veil that grant enormous power to those who can harness them.\n\nYou find yourself in Duskport, a crumbling coastal city where desperate merchants, displaced refugees, and shadowy power brokers converge. The harbor smells of brine and ozone. Word has reached the city that an Echo Shard has surfaced in the ruins of Ironmere fortress three days ride to the east.\n\nWhoever reaches it first will reshape the balance of power in Ashenveil forever.",
    "gm_notes": "The Shard in Ironmere is a trap set by the Veilborn Cult. The true prize is a map hidden beneath the fortress in a sealed vault. The antagonist, Malgrave the Sundered, is not a villain — he is a desperate man trying to close the Veil before it consumes everything. The Cult's true leader is Lyria, who currently poses as a Free Harbor merchant.",
    "factions": [
        {"name": "The Iron Covenant", "description": "A mercenary order that maintains uneasy peace through martial law. They are corrupt but necessary.", "alignment": "neutral", "visible_to_players": True},
        {"name": "The Veilborn Cult", "description": "Fanatics who worship the Sundering and seek to widen the tear between worlds. They are the primary threat.", "alignment": "enemy", "visible_to_players": False},
        {"name": "The Free Harbor", "description": "A coalition of merchants and smugglers who value profit above all. They can be bought, but they stay bought.", "alignment": "ally", "visible_to_players": True},
    ],
    "opening_hook": "The salt-crusted inn falls silent as a cloaked figure slams a sealed document onto the table before you. The wax bears the iron fist sigil of the Covenant. The figure's voice is a rasp: 'Three of our scouts went into Ironmere. None came back. Word is there's a Shard somewhere in those ruins — and you're not the only ones being hired to find it.' Gold coins spill across the table. 'Don't take too long.'",
    "bestiary": [
        {"name": "Veil Shade", "description": "A spirit warped by ether corruption, barely holding physical form. It flickers between visibility, leaving trails of cold mist.", "hp": 18, "max_hp": 18, "ac": 13, "attack_bonus": 4, "damage_dice": "1d8+2", "xp_reward": 100, "enemy_class": "assassin", "movement_speed": 7, "attack_range": 1, "challenge_rating": 2, "resistances": ["necrotic"], "vulnerabilities": ["radiant"], "abilities": [{"name": "Veil Step", "description": "Teleport up to 4 cells as a bonus action", "range": 4}], "loot_table": [{"name": "Ether Wisp", "drop_chance": 0.3}], "sprite_key": "shade"},
        {"name": "Ironmere Guard", "description": "A former soldier now under Veilborn thrall, eyes glowing faint violet. Still fights with trained discipline, shield locked and sword ready.", "hp": 26, "max_hp": 26, "ac": 15, "attack_bonus": 5, "damage_dice": "1d8+3", "xp_reward": 150, "enemy_class": "tank", "movement_speed": 4, "attack_range": 1, "challenge_rating": 3, "resistances": [], "vulnerabilities": ["ether"], "abilities": [{"name": "Shield Lock", "description": "+2 AC until next turn", "range": 0}], "loot_table": [{"name": "Iron Shield", "drop_chance": 0.2}], "sprite_key": "guard"},
        {"name": "Veilborn Cultist", "description": "A fanatical zealot armed with ether-charged blades. Their eyes burn with violet fire and they chant in an ancient tongue.", "hp": 16, "max_hp": 16, "ac": 12, "attack_bonus": 3, "damage_dice": "1d6+2", "xp_reward": 100, "enemy_class": "swarm", "movement_speed": 6, "attack_range": 1, "challenge_rating": 1, "resistances": [], "vulnerabilities": [], "abilities": [{"name": "Ether Surge", "description": "Extra 1d6 ether damage on hit once per rest", "range": 1}], "loot_table": [{"name": "Cultist Dagger", "drop_chance": 0.4}], "sprite_key": "cultist"},
        {"name": "Cult Arcanist", "description": "A powerful spellcaster who has traded sanity for power. Arcane symbols crawl across their skin like living tattoos.", "hp": 32, "max_hp": 32, "ac": 11, "attack_bonus": 6, "damage_dice": "2d6+4", "xp_reward": 300, "enemy_class": "caster", "movement_speed": 5, "attack_range": 6, "challenge_rating": 5, "resistances": ["ether"], "vulnerabilities": ["physical"], "abilities": [{"name": "Veil Rend", "description": "2d8 ether damage in a 3-cell cone", "range": 5}, {"name": "Ether Shield", "description": "Absorb next 10 damage", "range": 0}], "loot_table": [{"name": "Tome of Whispers", "drop_chance": 0.15}], "sprite_key": "mage"},
        {"name": "Malgrave the Sundered", "description": "Once a hero of the realm, now a desperate man consumed by the Veil's corruption. His right arm phases in and out of reality. He fights not out of malice but out of tragic necessity.", "hp": 85, "max_hp": 85, "ac": 16, "attack_bonus": 8, "damage_dice": "2d10+5", "xp_reward": 800, "enemy_class": "boss", "movement_speed": 5, "attack_range": 2, "challenge_rating": 10, "resistances": ["necrotic", "ether"], "vulnerabilities": ["radiant"], "abilities": [{"name": "Veil Slam", "description": "3d8 damage in 2-cell radius around self", "range": 0}, {"name": "Phase Shift", "description": "Become untargetable for 1 turn", "range": 0}, {"name": "Sundering Strike", "description": "4d6+5 damage to single target, ignore AC", "range": 2}], "loot_table": [{"name": "Shard Fragment", "drop_chance": 1.0}, {"name": "Malgrave's Blade", "drop_chance": 0.5}], "sprite_key": "boss"},
    ],
    "starting_scene": {"name": "Duskport — The Rusted Anchor Inn", "description": "A weathered coastal inn, walls thick with decades of salt and smoke. The floorboards groan with every step.", "terrain_type": "wood", "width": 20, "height": 15},
    "map_layout": {
        "rooms": [
            {"name": "Common Room", "x": 2, "y": 2, "width": 8, "height": 6, "terrain": "wood", "description": "The main hall of the inn, scattered with rough tables and stools."},
            {"name": "Kitchen", "x": 12, "y": 2, "width": 5, "height": 4, "terrain": "stone", "description": "A smoky kitchen with a roaring fireplace and iron pots."},
            {"name": "Private Room", "x": 12, "y": 8, "width": 5, "height": 5, "terrain": "wood", "description": "A small private meeting room with a locked chest."},
            {"name": "Cellar Stairs", "x": 2, "y": 10, "width": 4, "height": 3, "terrain": "stone", "description": "Narrow stairs descending into darkness."},
        ],
        "corridors": [
            {"from_room": 0, "to_room": 1, "width": 2},
            {"from_room": 1, "to_room": 2, "width": 1},
            {"from_room": 0, "to_room": 3, "width": 2},
        ],
        "objects": [
            {"name": "Front Door", "type": "door", "x": 2, "y": 5, "passable": True, "interactable": True, "description": "A heavy oak door leading to the street."},
            {"name": "Locked Chest", "type": "chest", "x": 15, "y": 10, "passable": False, "interactable": True, "description": "A reinforced chest with a complex lock."},
            {"name": "Fireplace", "type": "hazard", "x": 14, "y": 3, "passable": False, "interactable": False, "description": "A roaring fire — stepping too close burns."},
            {"name": "Barrel Stack", "type": "prop", "x": 4, "y": 11, "passable": False, "interactable": False, "description": "Stacked ale barrels blocking the path."},
        ],
        "spawn_points": {
            "players": [{"x": 5, "y": 4}, {"x": 6, "y": 4}, {"x": 5, "y": 5}, {"x": 6, "y": 5}],
            "enemies": [{"x": 14, "y": 9}, {"x": 15, "y": 9}, {"x": 3, "y": 11}],
        },
    },
}

MOCK_ENCOUNTERS = [
    {"enemies": [
        {"name": "Veil Shade", "description": "A wisp of corrupted spirit energy", "hp": 18, "max_hp": 18, "ac": 13, "attack_bonus": 4, "damage_dice": "1d8+2", "xp_reward": 100, "enemy_class": "assassin", "movement_speed": 7, "attack_range": 1, "challenge_rating": 2, "resistances": [], "vulnerabilities": [], "abilities": [{"name": "Veil Step", "description": "Teleport 4 cells", "range": 4}], "loot_table": [], "sprite_key": "shade"},
        {"name": "Veil Shade", "description": "A wisp of corrupted spirit energy", "hp": 18, "max_hp": 18, "ac": 13, "attack_bonus": 4, "damage_dice": "1d8+2", "xp_reward": 100, "enemy_class": "assassin", "movement_speed": 7, "attack_range": 1, "challenge_rating": 2, "resistances": [], "vulnerabilities": [], "abilities": [], "loot_table": [], "sprite_key": "shade"},
    ]},
    {"enemies": [
        {"name": "Cultist", "description": "A fanatical zealot", "hp": 16, "max_hp": 16, "ac": 12, "attack_bonus": 3, "damage_dice": "1d6+2", "xp_reward": 100, "enemy_class": "swarm", "movement_speed": 6, "attack_range": 1, "challenge_rating": 1, "resistances": [], "vulnerabilities": [], "abilities": [], "loot_table": [], "sprite_key": "cultist"},
        {"name": "Cultist", "description": "A fanatical zealot", "hp": 16, "max_hp": 16, "ac": 12, "attack_bonus": 3, "damage_dice": "1d6+2", "xp_reward": 100, "enemy_class": "swarm", "movement_speed": 6, "attack_range": 1, "challenge_rating": 1, "resistances": [], "vulnerabilities": [], "abilities": [], "loot_table": [], "sprite_key": "cultist"},
        {"name": "Cult Arcanist", "description": "A mage gone wrong", "hp": 30, "max_hp": 30, "ac": 11, "attack_bonus": 6, "damage_dice": "2d6+4", "xp_reward": 300, "enemy_class": "caster", "movement_speed": 5, "attack_range": 6, "challenge_rating": 5, "resistances": [], "vulnerabilities": [], "abilities": [{"name": "Veil Rend", "description": "AOE cone damage", "range": 5}], "loot_table": [], "sprite_key": "mage"},
    ]},
]

MOCK_NARRATIONS = [
    "The shadows part as your footsteps echo through ancient corridors. The air tastes of ozone and old stone, heavy with the weight of forgotten centuries.",
    "A cold wind cuts through the ruins as torchlight flickers against weathered walls. Something stirs in the darkness ahead, patient, watching.",
    "The ground trembles beneath your boots as ether energy crackles at the edges of your vision. The Veil grows thin here, and the world feels somehow less solid.",
    "Silence falls like a blade. Even the insects have gone quiet. Your instincts scream that you are not alone in this place.",
    "The chamber beyond reeks of ether — that sharp, electric scent that raises the hairs on your arms and sets your teeth on edge. Someone has been working powerful Bindings here, and recently.",
]

MOCK_MAP_LAYOUT = {
    "width": 24,
    "height": 18,
    "base_terrain": "stone",
    "rooms": [
        {"name": "Entry Hall", "x": 1, "y": 6, "width": 6, "height": 6, "terrain": "stone", "description": "A crumbling entry hall with collapsed pillars."},
        {"name": "Guard Room", "x": 9, "y": 2, "width": 5, "height": 4, "terrain": "stone", "description": "An abandoned guard station with rusted weapons."},
        {"name": "Main Chamber", "x": 9, "y": 8, "width": 7, "height": 6, "terrain": "stone", "description": "A vast chamber with an altar at the center."},
        {"name": "Treasury", "x": 18, "y": 8, "width": 5, "height": 5, "terrain": "stone", "description": "A locked vault room with scattered coins."},
        {"name": "Crypt", "x": 9, "y": 14, "width": 5, "height": 3, "terrain": "stone", "description": "Ancient burial niches line the walls."},
    ],
    "corridors": [
        {"from_room": 0, "to_room": 1, "width": 2},
        {"from_room": 0, "to_room": 2, "width": 2},
        {"from_room": 1, "to_room": 2, "width": 1},
        {"from_room": 2, "to_room": 3, "width": 2},
        {"from_room": 2, "to_room": 4, "width": 1},
    ],
    "terrain_patches": [
        {"terrain": "lava", "x": 11, "y": 10, "width": 2, "height": 2},
        {"terrain": "grass", "x": 19, "y": 9, "width": 3, "height": 3},
    ],
    "objects": [
        {"name": "Iron Door", "type": "door", "x": 7, "y": 8, "passable": True, "interactable": True, "description": "A heavy iron door, slightly ajar."},
        {"name": "Sealed Vault", "type": "door", "x": 17, "y": 10, "passable": False, "interactable": True, "description": "A magically sealed vault door. Requires a key."},
        {"name": "Treasure Chest", "type": "chest", "x": 20, "y": 10, "passable": False, "interactable": True, "description": "A heavy chest with ornate engravings."},
        {"name": "Spike Trap", "type": "hazard", "x": 10, "y": 9, "passable": True, "interactable": False, "description": "Hidden pressure plate triggers iron spikes."},
        {"name": "Collapsed Pillar", "type": "prop", "x": 3, "y": 8, "passable": False, "interactable": False, "description": "A massive stone pillar blocking part of the room."},
    ],
    "spawn_points": {
        "players": [{"x": 2, "y": 8}, {"x": 3, "y": 7}, {"x": 2, "y": 9}, {"x": 3, "y": 9}],
        "enemies": [{"x": 11, "y": 3}, {"x": 12, "y": 3}, {"x": 12, "y": 10}, {"x": 19, "y": 10}],
    },
}

MOCK_BESTIARY = [
    {"name": "Tunnel Crawler", "description": "A skittering insectoid predator that lurks in dark passages. Its chitinous shell gleams with ether residue.", "enemy_class": "swarm", "hp": 12, "max_hp": 12, "ac": 11, "attack_bonus": 2, "damage_dice": "1d4+1", "xp_reward": 40, "movement_speed": 7, "attack_range": 1, "challenge_rating": 1, "resistances": [], "vulnerabilities": ["fire"], "abilities": [{"name": "Pack Tactics", "description": "+2 attack when adjacent to ally", "dice": "", "range": 1, "cooldown": 0, "targeting": "single"}], "loot_table": [{"name": "Chitin Shard", "description": "Crafting material", "drop_chance": 0.5}], "sprite_key": "spider"},
    {"name": "Ether Wraith", "description": "A spectral entity born from concentrated ether leaks. It phases through walls and strikes with freezing ethereal claws.", "enemy_class": "assassin", "hp": 22, "max_hp": 22, "ac": 14, "attack_bonus": 5, "damage_dice": "2d6+3", "xp_reward": 150, "movement_speed": 8, "attack_range": 1, "challenge_rating": 3, "resistances": ["physical"], "vulnerabilities": ["radiant"], "abilities": [{"name": "Phase Walk", "description": "Move through walls, max 3 cells", "dice": "", "range": 3, "cooldown": 2, "targeting": "self"}, {"name": "Chilling Touch", "description": "Target loses 1 movement speed for 2 turns", "dice": "1d6", "range": 1, "cooldown": 0, "targeting": "single"}], "loot_table": [{"name": "Ether Essence", "description": "Alchemical ingredient", "drop_chance": 0.3}], "sprite_key": "shade"},
    {"name": "Stone Sentinel", "description": "An animated construct of ancient stone, covered in fading runes. It guards its post with relentless, mechanical precision.", "enemy_class": "tank", "hp": 45, "max_hp": 45, "ac": 17, "attack_bonus": 4, "damage_dice": "1d10+4", "xp_reward": 250, "movement_speed": 3, "attack_range": 1, "challenge_rating": 5, "resistances": ["physical", "poison"], "vulnerabilities": ["ether"], "abilities": [{"name": "Fortify", "description": "+3 AC until next turn, cannot move", "dice": "", "range": 0, "cooldown": 2, "targeting": "self"}], "loot_table": [{"name": "Rune Stone", "description": "Enchanting material", "drop_chance": 0.2}], "sprite_key": "golem"},
    {"name": "Veilborn Zealot", "description": "A fanatical cultist whose body has been partially consumed by Veil energy. They attack with desperate, suicidal fervor.", "enemy_class": "brute", "hp": 28, "max_hp": 28, "ac": 12, "attack_bonus": 5, "damage_dice": "2d6+3", "xp_reward": 120, "movement_speed": 5, "attack_range": 1, "challenge_rating": 3, "resistances": [], "vulnerabilities": [], "abilities": [{"name": "Reckless Strike", "description": "+4 damage but -2 AC until next turn", "dice": "2d6+7", "range": 1, "cooldown": 0, "targeting": "single"}], "loot_table": [{"name": "Cult Amulet", "description": "Dark ether focus", "drop_chance": 0.25}], "sprite_key": "cultist"},
]


class MockProvider(AIProvider):
    async def complete(self, prompt: str, system: str = "") -> str:
        await asyncio.sleep(0.4)
        p = prompt.lower()
        if "chronicle" in p or "create a complete" in p:
            return json.dumps(MOCK_CHRONICLE)
        if "encounter" in p or "combat encounter" in p:
            return json.dumps(random.choice(MOCK_ENCOUNTERS))
        if "bestiary" in p and "generate" in p:
            return json.dumps(MOCK_BESTIARY)
        if "map layout" in p or "tactical map" in p:
            return json.dumps(MOCK_MAP_LAYOUT)
        if "npc" in p:
            return json.dumps({"name": "Mira Ashford", "description": "A scarred merchant with knowing eyes and a wry smile", "personality": "Cautious but fair, weighs every word", "voice": "Clipped and direct, uses maritime slang", "hp": 20, "is_hostile": False, "movement_speed": 5, "attack_range": 1})
        if "narrat" in p or "event" in p:
            return random.choice(MOCK_NARRATIONS)
        if "portrait" in p:
            return "A dramatic fantasy portrait of a warrior standing in golden torchlight, painterly style, dark fantasy aesthetic, high detail"
        return random.choice(MOCK_NARRATIONS)

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        result = await self.complete(prompt, system)
        for word in result.split():
            yield word + " "
            await asyncio.sleep(0.04)

    async def generate_narration(self, context: str, event: str) -> str:
        await asyncio.sleep(0.3)
        return random.choice(MOCK_NARRATIONS)
