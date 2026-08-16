import logging
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, Header
from firebase import get_db, verify_firebase_token
from schemas import GenerateStartupRequest, ProjectDocument
from agents.workflow import run_agent_workflow
from routes.ws import broadcast_telemetry

logger = logging.getLogger("autonomous_co_founder.projects")
_local_projects_backup = {}

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _extract_user_id(authorization: Optional[str]) -> str:
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        decoded = verify_firebase_token(token)
        if decoded and "uid" in decoded:
            return decoded["uid"]
    return "demo-founder-1"


@router.post("/generate", response_model=dict)
async def generate_startup(
    request: GenerateStartupRequest,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None)
):
    """Creates a new startup project and spawns the LangGraph multi-agent execution pipeline in the background."""
    user_id = _extract_user_id(authorization)
    project_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    project_data = {
        "project_id": project_id,
        "user_id": user_id,
        "idea": request.idea,
        "industry": request.industry or "General Tech",
        "target_audience": request.target_audience,
        "preferred_platform": request.preferred_platform or "local_sandbox",
        "status": "pending",
        "current_node": "initializing",
        "created_at": now,
        "updated_at": now,
        "market_research": None,
        "business_plan": None,
        "copywriting": None,
        "code_architect": None,
        "deployment": None,
        "logs": []
    }

    db = get_db()
    db.collection("projects").document(project_id).set(project_data)

    # Define streaming emitter that sends telemetry over WebSocket
    async def emitter(msg: dict):
        await broadcast_telemetry(project_id, msg)

    # Launch multi-agent workflow
    background_tasks.add_task(
        run_agent_workflow,
        project_id=project_id,
        user_id=user_id,
        idea=request.idea,
        industry=request.industry or "General Tech",
        preferred_platform=request.preferred_platform or "local_sandbox",
        stream_emitter=emitter
    )

    return {
        "project_id": project_id,
        "status": "pending",
        "message": "Autonomous Co-Founder pipeline started."
    }


@router.get("", response_model=List[dict])
async def list_projects(authorization: Optional[str] = Header(None)):
    """Fetches all startup projects for the authenticated user."""
    user_id = _extract_user_id(authorization)
    db = get_db()
    
    projects = []
    try:
        for doc in db.collection("projects").stream():
            data = doc.to_dict()
            if data.get("user_id") == user_id or user_id == "demo-founder-1":
                projects.append(data)
    except Exception as e:
        logger.warning(f"Error fetching from remote Firestore: {e}. Using local store fallback.")
        # Fallback in-memory list
        return []

    # Sort newest first
    projects.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return projects


@router.get("/{project_id}")
async def get_project(project_id: str):
    """Retrieves a specific project document by ID with all generated artifacts."""
    db = get_db()
    doc = db.collection("projects").document(project_id).get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Project not found")

    return doc.to_dict()


@router.post("/{project_id}/rerun")
async def rerun_project(
    project_id: str,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None)
):
    """Re-executes the multi-agent generation workflow for an existing project."""
    db = get_db()
    doc = db.collection("projects").document(project_id).get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Project not found")

    data = doc.to_dict()
    user_id = _extract_user_id(authorization)

    async def emitter(msg: dict):
        await broadcast_telemetry(project_id, msg)

    background_tasks.add_task(
        run_agent_workflow,
        project_id=project_id,
        user_id=user_id,
        idea=data.get("idea", ""),
        industry=data.get("industry", "General Tech"),
        preferred_platform=data.get("preferred_platform", "local_sandbox"),
        stream_emitter=emitter
    )

    return {"project_id": project_id, "status": "rerun_started"}


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """Deletes a project."""
    db = get_db()
    db.collection("projects").document(project_id).delete()
    return {"status": "deleted", "project_id": project_id}
