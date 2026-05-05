class MapGrid:
    def __init__(self, width, height, terrain_type="stone"):
        self.width = width
        self.height = height
        self.terrain_type = terrain_type
        self.grid = [terrain_type] * (width * height)
        self.fog_of_war = [True] * (width * height)

    def to_dict(self):
        return {
            "width": self.width,
            "height": self.height,
            "grid": self.grid,
            "fog_of_war": self.fog_of_war
        }

    def set_cell(self, x, y, terrain):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.grid[y * self.width + x] = terrain

    def reveal_cell(self, x, y):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.fog_of_war[y * self.width + x] = False
