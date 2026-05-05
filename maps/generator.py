import random


class MapGenerator:
    def __init__(self, api_client=None):
        """
        Initializes the MapGenerator. 
        In a full implementation, api_client would connect to an LLM or image gen service.
        """
        self.api_client = api_client
        self.themes = ["stone", "grass", "lava", "ice", "wood", "sand", "dirt"]

    def generate_random_terrain(self, width, height):
        """Generates a random terrain grid."""
        theme = random.choice(self.themes)
        return [theme] * (width * height)

    def generate_visual_prompt(self, action_description):
        """
        Generates a descriptive visual prompt based on an action.
        This would typically be sent to an image generation model.
        """
        return f"A high-quality 2D top-down game asset representing: {action_description}. Style: dark fantasy tabletop."

    def build_grid_from_layout(self, layout: dict) -> list[str]:
        """
        Build a flat terrain grid from an AI-generated map layout.
        Fills rooms, corridors, terrain patches, and marks impassable objects.
        """
        width = layout.get("width", 24)
        height = layout.get("height", 18)
        base = layout.get("base_terrain", "stone")

        # Start with walls everywhere
        grid = ["wall"] * (width * height)

        def set_cell(x, y, terrain):
            if 0 <= x < width and 0 <= y < height:
                grid[y * width + x] = terrain

        def fill_rect(rx, ry, rw, rh, terrain):
            for dy in range(rh):
                for dx in range(rw):
                    set_cell(rx + dx, ry + dy, terrain)

        # Place rooms
        rooms = layout.get("rooms", [])
        for room in rooms:
            rx, ry = room.get("x", 0), room.get("y", 0)
            rw, rh = room.get("width", 4), room.get("height", 4)
            terrain = room.get("terrain", base)
            fill_rect(rx, ry, rw, rh, terrain)

        # Draw corridors between rooms
        corridors = layout.get("corridors", [])
        for corr in corridors:
            from_idx = corr.get("from_room", 0)
            to_idx = corr.get("to_room", 0)
            cw = corr.get("width", 1)

            if from_idx < len(rooms) and to_idx < len(rooms):
                r1 = rooms[from_idx]
                r2 = rooms[to_idx]
                # Center of each room
                cx1 = r1["x"] + r1.get("width", 4) // 2
                cy1 = r1["y"] + r1.get("height", 4) // 2
                cx2 = r2["x"] + r2.get("width", 4) // 2
                cy2 = r2["y"] + r2.get("height", 4) // 2

                # L-shaped corridor: horizontal then vertical
                sx = min(cx1, cx2)
                ex = max(cx1, cx2)
                for x in range(sx, ex + 1):
                    for w in range(cw):
                        set_cell(x, cy1 + w, base)

                sy = min(cy1, cy2)
                ey = max(cy1, cy2)
                for y in range(sy, ey + 1):
                    for w in range(cw):
                        set_cell(cx2 + w, y, base)

        # Apply terrain patches
        for patch in layout.get("terrain_patches", []):
            fill_rect(
                patch.get("x", 0), patch.get("y", 0),
                patch.get("width", 2), patch.get("height", 2),
                patch.get("terrain", "grass"),
            )

        # Place impassable objects
        for obj in layout.get("objects", []):
            if not obj.get("passable", True):
                set_cell(obj.get("x", 0), obj.get("y", 0), "blocked")

        return grid

    def get_passable_cells(self, grid: list[str], width: int, height: int) -> list[list[int]]:
        """Return all passable cell positions."""
        cells = []
        for y in range(height):
            for x in range(width):
                terrain = grid[y * width + x]
                if terrain not in ("wall", "blocked"):
                    cells.append([x, y])
        return cells

    def is_passable(self, grid: list[str], width: int, x: int, y: int) -> bool:
        """Check if a specific cell is passable."""
        if 0 <= x < width and 0 <= y < len(grid) // width:
            return grid[y * width + x] not in ("wall", "blocked")
        return False
