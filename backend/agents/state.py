from typing import TypedDict, List, Dict, Any, Optional
from schemas import (
    MarketResearchOutput,
    BusinessPlanOutput,
    CopywritingOutput,
    CodeArchitectOutput,
    DeploymentOutput,
)


class AgentState(TypedDict, total=False):
    project_id: str
    user_id: str
    idea: str
    industry: str
    target_audience: Optional[str]
    preferred_platform: str

    # Workflow Execution Stage
    current_node: str
    logs: List[Dict[str, Any]]
    error: Optional[str]

    # Agent Node Artifacts
    market_research: Optional[MarketResearchOutput]
    business_plan: Optional[BusinessPlanOutput]
    copywriting: Optional[CopywritingOutput]
    code_architect: Optional[CodeArchitectOutput]
    deployment: Optional[DeploymentOutput]

    # WebSocket Dispatcher Hook (in-memory callable for live telemetry)
    stream_emitter: Optional[Any]
