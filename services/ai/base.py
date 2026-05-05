from abc import ABC, abstractmethod
from typing import AsyncGenerator
import json


class AIProvider(ABC):
    @abstractmethod
    async def complete(self, prompt: str, system: str = "") -> str:
        pass

    @abstractmethod
    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        pass

    def _parse_json(self, text: str) -> dict | list:
        start = text.find('{')
        arr_start = text.find('[')
        if arr_start >= 0 and (start < 0 or arr_start < start):
            start = arr_start
            end = text.rfind(']') + 1
        else:
            end = text.rfind('}') + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
        return {}

    SYSTEM_GM = """You are a creative game master assistant for ECHO VTT, an original fantasy tabletop RPG.
Use ECHO VTT's own vocabulary: Bindings (abilities), Ether (magic energy), Veil (fog of war),
Echo Scores (stats: Force/Grace/Mind/Presence/Ether/Endurance), Fracture (critical hit), Chronicle (campaign).
Never reference D&D, Dungeons & Dragons, or any trademarked property.
Always respond with valid JSON when instructed to."""

    async def build_chronicle(self, config: dict) -> dict:
        # Build a rich context from all the creative fields
        details = []
        if config.get("geography_description"):
            details.append(f"Geography: {config['geography_description']}")
        if config.get("key_locations"):
            details.append(f"Key Locations: {config['key_locations']}")
        if config.get("cultural_details"):
            details.append(f"Culture: {config['cultural_details']}")
        if config.get("world_secrets"):
            details.append(f"Hidden Secrets (GM only): {config['world_secrets']}")
        if config.get("antagonist_description"):
            details.append(f"Antagonist: {config['antagonist_description']}")
        if config.get("key_npcs"):
            details.append(f"Key NPCs: {config['key_npcs']}")
        if config.get("plot_twists"):
            details.append(f"Plot Twists (GM only): {config['plot_twists']}")
        if config.get("starting_situation"):
            details.append(f"Starting Situation: {config['starting_situation']}")
        if config.get("faction_relationships"):
            details.append(f"Faction Relationships: {config['faction_relationships']}")
        if config.get("player_faction"):
            details.append(f"Player Faction: {config['player_faction']}")
        if config.get("hidden_factions"):
            details.append(f"Hidden Factions (GM only): {config['hidden_factions']}")
        if config.get("political_landscape"):
            details.append(f"Political Landscape: {config['political_landscape']}")
        if config.get("scene_atmosphere"):
            details.append(f"Scene Atmosphere: {config['scene_atmosphere']}")
        if config.get("points_of_interest"):
            details.append(f"Points of Interest: {config['points_of_interest']}")
        if config.get("map_theme"):
            details.append(f"Map Theme: {config['map_theme']}")
        if config.get("enemy_theme"):
            details.append(f"Enemy Theme: {config['enemy_theme']}")
        if config.get("boss_concept"):
            details.append(f"Boss Concept: {config['boss_concept']}")
        if config.get("loot_description"):
            details.append(f"Loot: {config['loot_description']}")
        if config.get("special_rewards"):
            details.append(f"Special Rewards: {config['special_rewards']}")

        extra_context = "\n".join(details)

        prompt = f"""Create a complete chronicle from this config:
{json.dumps(config, indent=2)}

Additional creative details from the GM:
{extra_context}

Respond with a single JSON object containing:
- overview: string (2-3 paragraph world overview visible to players)
- gm_notes: string (private GM notes about hidden story elements, incorporating world_secrets, plot_twists, hidden_factions)
- factions: array of {{name, description, alignment ("ally"|"enemy"|"neutral"), visible_to_players}}
- opening_hook: string (vivid opening narration, 3-4 sentences, second person)
- bestiary: array of up to 8 enemies, each: {{name, description, hp, ac, attack_bonus, damage_dice, xp_reward, enemy_class ("brute"|"caster"|"assassin"|"tank"|"healer"|"swarm"|"artillery"|"boss"), movement_speed, attack_range, challenge_rating, resistances: [], vulnerabilities: [], abilities: [{{name, description, range}}], loot_table: [{{name, drop_chance}}], sprite_key ("shade"|"guard"|"cultist"|"mage"|"wolf"|"orc"|"boss"|"spider"|"golem")}}
- starting_scene: {{name, description, terrain_type ("stone"|"wood"|"grass"|"ice"|"lava"), width, height}}
- map_layout: {{rooms: [{{name, x, y, width, height, terrain, description}}], corridors: [{{from_room, to_room}}], objects: [{{name, type ("door"|"chest"|"hazard"|"prop"), x, y, passable, interactable, description}}]}}"""
        result = await self.complete(prompt, self.SYSTEM_GM)
        return self._parse_json(result)

    async def generate_encounter(self, context: str, difficulty: str, count: int) -> dict:
        prompt = f"""Generate a combat encounter:
Context: {context}
Difficulty: {difficulty}
Number of enemies: {count}

Return JSON with key "enemies", each having:
name, description, hp, ac, attack_bonus, damage_dice, xp_reward,
enemy_class (one of: brute, caster, assassin, tank, healer, swarm, artillery, boss),
movement_speed (cells per turn, 4-8),
attack_range (cells, 1 for melee, 4-8 for ranged),
challenge_rating (1-20),
resistances: [],
vulnerabilities: [],
abilities: [{{name, description, range (cells)}}],
loot_table: [{{name, drop_chance (0.0-1.0)}}],
sprite_key (one of: shade, guard, cultist, mage, wolf, orc, boss, spider, golem)"""
        result = await self.complete(prompt, self.SYSTEM_GM)
        return self._parse_json(result)

    async def generate_narration(self, context: str, event: str) -> str:
        system = f"{self.SYSTEM_GM}\nWrite vivid atmospheric narration in second person. 2-3 sentences. Sensory details."
        prompt = f"World context: {context}\nEvent to narrate: {event}"
        return await self.complete(prompt, system)

    async def generate_npc(self, context: str, role: str) -> dict:
        prompt = f"""Create an NPC:
Context: {context}
Role: {role}
Return JSON: {{name, description, personality, voice, hp, is_hostile, movement_speed, attack_range}}"""
        result = await self.complete(prompt, self.SYSTEM_GM)
        return self._parse_json(result)

    async def generate_map_layout(self, config: dict) -> dict:
        """Generate an intelligent map layout from world/scene configuration."""
        prompt = f"""Generate a tactical map layout for a tabletop RPG scene.

Scene config:
{json.dumps(config, indent=2)}

Respond with a JSON object:
{{
  "width": int (16-32),
  "height": int (12-24),
  "base_terrain": string ("stone"|"grass"|"wood"|"ice"|"lava"|"sand"|"dirt"),
  "rooms": [
    {{
      "name": string,
      "x": int, "y": int,
      "width": int (3-10),
      "height": int (3-8),
      "terrain": string,
      "description": string
    }}
  ],
  "corridors": [
    {{
      "from_room": int (index),
      "to_room": int (index),
      "width": int (1-3)
    }}
  ],
  "terrain_patches": [
    {{
      "terrain": string,
      "x": int, "y": int,
      "width": int, "height": int
    }}
  ],
  "objects": [
    {{
      "name": string,
      "type": "door"|"chest"|"hazard"|"prop",
      "x": int, "y": int,
      "passable": bool,
      "interactable": bool,
      "description": string
    }}
  ],
  "spawn_points": {{
    "players": [{{x: int, y: int}}],
    "enemies": [{{x: int, y: int}}]
  }}
}}

Make the layout interesting with varied terrain, chokepoints, cover positions, and tactical depth.
Include at least 2-4 rooms connected by corridors.
Place objects like doors, chests, and environmental hazards thoughtfully."""
        result = await self.complete(prompt, self.SYSTEM_GM)
        return self._parse_json(result)

    async def generate_bestiary(self, config: dict, count: int = 8) -> list:
        """Generate a full bestiary for a chronicle."""
        prompt = f"""Generate a bestiary of {count} unique enemies for this world:
{json.dumps(config, indent=2)}

Include a mix of enemy classes: at least 1 boss, 2 brutes/tanks, 2 casters/artillery, 2 assassins/swarm, 1 healer.
Scale difficulty from challenge_rating 1 (easy) to 10+ (boss).

Return a JSON array, each enemy having:
{{
  "name": string,
  "description": string (2-3 sentences, vivid and atmospheric),
  "enemy_class": "brute"|"caster"|"assassin"|"tank"|"healer"|"swarm"|"artillery"|"boss",
  "hp": int,
  "max_hp": int,
  "ac": int,
  "attack_bonus": int,
  "damage_dice": string,
  "xp_reward": int,
  "movement_speed": int (cells per turn),
  "attack_range": int (cells, 1=melee),
  "challenge_rating": int (1-20),
  "resistances": [string],
  "vulnerabilities": [string],
  "abilities": [{{
    "name": string,
    "description": string,
    "dice": string,
    "range": int,
    "cooldown": int,
    "targeting": "single"|"aoe"|"self"
  }}],
  "loot_table": [{{
    "name": string,
    "description": string,
    "drop_chance": float (0.0-1.0)
  }}],
  "sprite_key": "shade"|"guard"|"cultist"|"mage"|"wolf"|"orc"|"boss"|"spider"|"golem"
}}"""
        result = await self.complete(prompt, self.SYSTEM_GM)
        parsed = self._parse_json(result)
        if isinstance(parsed, list):
            return parsed
        return parsed.get("bestiary", parsed.get("enemies", []))
