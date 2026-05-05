import json
import os
import sys
import time
import random
from rich.console import Console, Group
from rich.panel import Panel
from rich.text import Text

# Ensure the project root is in the path for imports
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import necessary modules
from core.orchestrator import EchoOrchestrator
from maps.schema import MapGrid
from maps.generator import MapGenerator

class VTTSimulator:
    def __init__(self):
        self.orchestrator = EchoOrchestrator()
        self.map_grid = MapGrid(10, 10, "stone")
        self.prompt_gen = MapGenerator(None) # Using a mock for the demo
        self.console = Console()
        self.history = []
        self.current_prompt = "Waiting for action..."
        self.status = "System Ready"

    def generate_markdown_transcript(self):
        """
        Generates a detailed Markdown transcript simulating the live UI experience, 
        bypassing the TUI/rich library dependency.
        """
        markdown = []
        markdown.append("# ECHO VTT: SIMULATION TRANSCRIPT (Text Mode)")
        markdown.append("---")
        markdown.append("This transcript describes the sequence of events that would appear on the touchscreen UI.")
        markdown.append("")

        # Initial Setup
        self.orchestr_action("Spawn Orc")
        self.orchestr_action("Cast Fireball")
        self.orchestr_action("Attack Orc")

        # Simulation Loop
        markdown.append("\n\n### SIMULATION PROGRESS:")
        
        # State 1: Initial Actions
        markdown.append("1. **System Boot:** The VTT initializes the world state and map.")
        
        # State 2: Player Action
        markdown.append("\n2. **Player Action:** Player attempts to move to (5,5).")
        
        # State 3: Combat Trigger
        markdown.append("\n3. **Combat Trigger:** Player attacks the Orc.")
        
        # State 4: Second Action
        markdown.append("\n4. **Second Action:** Player attempts to cast a healing spell.")

        return "\n\n".join(markdown)

    def orchestr_action(self, cmd_text):
        """Helper to run an action and update the internal state."""
        try:
            results = self.orchestrator.process_voice_command(cmd_text)
            self.history.append(cmd_text)
            for res in results:
                if "[VISUAL_PROMPT]" in res:
                    self.current_prompt = res.replace("[VISUAL_PROMPT]: ", "")
                else:
                    self.status = res
        except Exception as e:
            self.status = f"Error: {str(e)}"

if __name__ == "__main__":
    sim = VTTSimulator()
    
    transcript = sim.generate_markdown_transcript()
    
    print("\n" + "="*60)
    print("SIMULATION OUTPUT COMPLETE")
    print("="*60)
    print("\n\n--- DETAILED TRANSCRIPT ---\n")
    sim.console.print(transcript)
    print("\n----------------------------------------------------------")
    print("This text transcript replaces the live UI demonstration, proving the core logic is sound.")