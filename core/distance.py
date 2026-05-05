"""
ECHO VTT — Distance & Pathfinding Utilities

All positions are [x, y] grid coordinates.
Distance is measured in grid cells.
Movement uses Chebyshev distance (diagonal = 1 cell).
"""

import heapq
import math
from typing import Callable, Optional


def grid_distance(pos_a: list[int], pos_b: list[int]) -> int:
    """
    Chebyshev distance — the standard grid movement cost.
    Diagonal movement costs 1 cell (same as horizontal/vertical).
    """
    return max(abs(pos_a[0] - pos_b[0]), abs(pos_a[1] - pos_b[1]))


def euclidean_distance(pos_a: list[int], pos_b: list[int]) -> float:
    """Euclidean distance for circular range checks (abilities, AOE)."""
    return math.sqrt((pos_a[0] - pos_b[0]) ** 2 + (pos_a[1] - pos_b[1]) ** 2)


def manhattan_distance(pos_a: list[int], pos_b: list[int]) -> int:
    """Manhattan distance — no diagonal movement."""
    return abs(pos_a[0] - pos_b[0]) + abs(pos_a[1] - pos_b[1])


def is_in_range(
    attacker_pos: list[int],
    target_pos: list[int],
    ability_range: int,
    use_euclidean: bool = False,
) -> bool:
    """Check if a target is within ability range of the attacker."""
    if use_euclidean:
        return euclidean_distance(attacker_pos, target_pos) <= ability_range
    return grid_distance(attacker_pos, target_pos) <= ability_range


def cells_in_range(
    origin: list[int],
    max_range: int,
    grid_width: int,
    grid_height: int,
    use_euclidean: bool = False,
) -> list[list[int]]:
    """Return all grid cells within range of an origin point."""
    cells = []
    for x in range(max(0, origin[0] - max_range), min(grid_width, origin[0] + max_range + 1)):
        for y in range(max(0, origin[1] - max_range), min(grid_height, origin[1] + max_range + 1)):
            pos = [x, y]
            if use_euclidean:
                if euclidean_distance(origin, pos) <= max_range:
                    cells.append(pos)
            else:
                if grid_distance(origin, pos) <= max_range:
                    cells.append(pos)
    return cells


def _neighbors(pos: list[int], grid_width: int, grid_height: int) -> list[list[int]]:
    """Get all 8-directional neighbors of a cell."""
    result = []
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            nx, ny = pos[0] + dx, pos[1] + dy
            if 0 <= nx < grid_width and 0 <= ny < grid_height:
                result.append([nx, ny])
    return result


def find_path(
    start: list[int],
    end: list[int],
    grid_width: int,
    grid_height: int,
    is_passable: Callable[[int, int], bool],
) -> Optional[list[list[int]]]:
    """
    A* pathfinding on the grid.
    Returns a list of [x,y] positions from start to end (inclusive),
    or None if no path exists.
    """
    start_t = tuple(start)
    end_t = tuple(end)

    if not is_passable(end[0], end[1]):
        return None

    open_set = [(0, start_t)]
    came_from: dict[tuple, tuple] = {}
    g_score: dict[tuple, float] = {start_t: 0}
    f_score: dict[tuple, float] = {start_t: grid_distance(start, end)}

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == end_t:
            # Reconstruct path
            path = []
            while current in came_from:
                path.append(list(current))
                current = came_from[current]
            path.append(list(current))
            path.reverse()
            return path

        for neighbor in _neighbors(list(current), grid_width, grid_height):
            nt = tuple(neighbor)
            if not is_passable(neighbor[0], neighbor[1]):
                continue

            # Diagonal movement costs 1 (Chebyshev)
            tentative_g = g_score[current] + 1

            if tentative_g < g_score.get(nt, float("inf")):
                came_from[nt] = current
                g_score[nt] = tentative_g
                f_score[nt] = tentative_g + grid_distance(neighbor, end)
                heapq.heappush(open_set, (f_score[nt], nt))

    return None


def path_distance(
    start: list[int],
    end: list[int],
    grid_width: int,
    grid_height: int,
    is_passable: Callable[[int, int], bool],
) -> Optional[int]:
    """
    Get the movement cost to reach end from start, accounting for obstacles.
    Returns None if no path exists.
    """
    path = find_path(start, end, grid_width, grid_height, is_passable)
    if path is None:
        return None
    return len(path) - 1  # Subtract 1 because path includes the start cell


def reachable_cells(
    origin: list[int],
    movement_speed: int,
    grid_width: int,
    grid_height: int,
    is_passable: Callable[[int, int], bool],
    occupied_positions: list[list[int]] | None = None,
) -> list[list[int]]:
    """
    Get all cells reachable within movement_speed steps using BFS.
    Respects obstacles and optionally avoids occupied cells.
    More accurate than cells_in_range because it accounts for walls.
    """
    occupied = set()
    if occupied_positions:
        occupied = {tuple(p) for p in occupied_positions}

    visited: dict[tuple, int] = {tuple(origin): 0}
    queue = [(tuple(origin), 0)]
    result = []

    while queue:
        current, cost = queue.pop(0)
        if cost > 0:  # Don't include the origin cell
            result.append(list(current))

        if cost >= movement_speed:
            continue

        for neighbor in _neighbors(list(current), grid_width, grid_height):
            nt = tuple(neighbor)
            new_cost = cost + 1
            if nt not in visited and is_passable(neighbor[0], neighbor[1]) and nt not in occupied:
                visited[nt] = new_cost
                queue.append((nt, new_cost))

    return result


def entities_in_range(
    origin: list[int],
    ability_range: int,
    entities: list[dict],
    include_dead: bool = False,
) -> list[dict]:
    """
    Filter entities to only those within ability range of the origin.
    Useful for targeting validation.
    """
    result = []
    for entity in entities:
        if not include_dead and not entity.get("is_alive", True):
            continue
        pos = entity.get("position", [0, 0])
        if grid_distance(origin, pos) <= ability_range:
            result.append(entity)
    return result
