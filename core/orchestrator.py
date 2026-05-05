import json
from datetime import datetime

class EchoOrchestrator:
    def __init__(self):
        self.entities = []
        self.events = []
        self.current_map = None

    def process_voice_command(self, cmd_text):
        """
        Simulates parsing a voice command and updating the game state.
        Returns a list of messages/visual prompts.
        """
        cmd_text = cmd_text.lower()
        results = []
        
        if "spawn" in cmd_text:
            entity_name = cmd_text.replace("spawn", "").strip().capitalize()
            if not entity_name:
                entity_name = "Unknown Entity"
            
            new_entity = {
                "name": entity_name,
                "hp": 100,
                "position": [0, 0]
            }
            self.entities.append(new_entity)
            results.append(f"Successfully spawned {entity_name} at [0,0].")
            results.append(f"[VISUAL_PROMPT]: Spawning {entity_name} visual effect.")
            self._log_event("System", f"Spawned {entity_name}")

        elif "attack" in cmd_text:
            target = cmd_text.replace("attack", "").strip().capitalize()
            results.append(f"Attacking {target}...")
            results.append(f"[VISUAL_PROMPT]: Attack animation on {target}.")
            self._log_event("Player", f"Attacked {target}")

        elif "cast" in cmd_text:
            spell = cmd_text.replace("cast", "").strip().capitalize()
            results.append(f"Casting {spell}!")
            results.append(f"[VISUAL_PROMPT]: {spell} particle effects.")
            self._log_event("Player", f"Cast {spell}")

        else:
            results.append(f"Command acknowledged: {cmd_text}")
            self._log_event("System", f"Unknown command: {cmd_text}")

        return results

    def _log_event(self, source, message):
        event = {
            "timestamp": datetime.now().isoformat(),
            "source": source,
            "message": message
        }
        self.events.append(event)

    def get_state(self):
        return {
            "entities": self.entities,
            "events": self.events
        }
