import sys
import os
import pytest

# Add the project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.orchestrator import EchoOrchestrator
from maps.schema import MapGrid
from maps.generator import MapGenerator

def test_orchestrator_spawn():
    orc = EchoOrchestrator()
    results = orc.process_voice_command("Spawn Dragon")
    assert any("Dragon" in res for res in results)
    assert len(orc.entities) == 1
    assert orc.entities[0]["name"] == "Dragon"

def test_orchestrator_attack():
    orc = EchoOrchestrator()
    results = orc.process_voice_command("Attack Dragon")
    assert any("Attacking Dragon" in res for res in results)
    assert len(orc.events) == 1
    assert orc.events[0]["message"] == "Attacked Dragon"

def test_map_grid_init():
    grid = MapGrid(5, 5, "grass")
    data = grid.to_dict()
    assert data["width"] == 5
    assert data["height"] == 5
    assert all(t == "grass" for t in data["grid"])
    assert len(data["grid"]) == 25

def test_map_generator_terrain():
    gen = MapGenerator()
    terrain = gen.generate_random_terrain(10, 10)
    assert len(terrain) == 100
    assert terrain[0] in gen.themes
