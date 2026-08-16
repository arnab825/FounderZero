import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("autonomous_co_founder.ws")

router = APIRouter(tags=["websockets"])

# Active WebSocket connections grouped by project_id
active_connections: Dict[str, Set[WebSocket]] = {}


async def broadcast_telemetry(project_id: str, message: dict):
    """Broadcasts a telemetry message to all connected clients for a project."""
    if project_id in active_connections:
        dead_connections = set()
        for ws in active_connections[project_id]:
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending telemetry to ws: {e}")
                dead_connections.add(ws)

        for ws in dead_connections:
            active_connections[project_id].discard(ws)


@router.websocket("/ws/agent/{project_id}")
async def agent_websocket_endpoint(websocket: WebSocket, project_id: str):
    """WebSocket endpoint for clients to stream live agent execution logs and telemetry."""
    await websocket.accept()

    if project_id not in active_connections:
        active_connections[project_id] = set()
    active_connections[project_id].add(websocket)

    # Send initial connection confirmation
    await websocket.send_json({
        "type": "status",
        "node": "system",
        "message": f"Connected to real-time agent telemetry stream for project: {project_id}"
    })

    try:
        while True:
            # Keep-alive / incoming client messages
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                if payload.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except Exception:
                pass
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from telemetry stream for {project_id}")
    finally:
        if project_id in active_connections:
            active_connections[project_id].discard(websocket)
            if not active_connections[project_id]:
                del active_connections[project_id]
