from fastapi import WebSocket
from typing import Optional
import asyncio


class ConnectionManager:
    def __init__(self):
        # session_id -> {player_id: WebSocket}
        self.connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, session_id: str, player_id: str, ws: WebSocket):
        await ws.accept()
        if session_id not in self.connections:
            self.connections[session_id] = {}
        self.connections[session_id][player_id] = ws

    def disconnect(self, session_id: str, player_id: str):
        if session_id in self.connections:
            self.connections[session_id].pop(player_id, None)

    def get_connected_ids(self, session_id: str) -> list[str]:
        return list(self.connections.get(session_id, {}).keys())

    async def send_to(self, session_id: str, player_id: str, msg: dict):
        ws = self.connections.get(session_id, {}).get(player_id)
        if ws:
            try:
                await ws.send_json(msg)
            except Exception:
                self.disconnect(session_id, player_id)

    async def broadcast(self, session_id: str, msg: dict, exclude: Optional[str] = None):
        conns = dict(self.connections.get(session_id, {}))
        tasks = [
            ws.send_json(msg)
            for pid, ws in conns.items()
            if pid != exclude
        ]
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            # Clean up dead connections
            pids = [pid for pid in conns if pid != exclude]
            for pid, result in zip(pids, results):
                if isinstance(result, Exception):
                    self.disconnect(session_id, pid)


manager = ConnectionManager()
