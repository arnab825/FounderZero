import logging
from typing import Dict, Any, Callable
from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.nodes.market_research import market_research_node
from agents.nodes.business_planner import business_planner_node
from agents.nodes.copywriter import copywriter_node
from agents.nodes.code_architect import code_architect_node
from agents.nodes.deployment import deployment_node
from firebase import get_db

logger = logging.getLogger("autonomous_co_founder.workflow")


def build_agent_graph():
    """Builds and compiles the LangGraph StateGraph for the Autonomous Co-Founder."""
    graph = StateGraph(AgentState)

    # Register Nodes with unique node names (to prevent collision with state key names)
    graph.add_node("node_market_research", market_research_node)
    graph.add_node("node_business_planner", business_planner_node)
    graph.add_node("node_copywriter", copywriter_node)
    graph.add_node("node_code_architect", code_architect_node)
    graph.add_node("node_deployment", deployment_node)

    # Set Entry Point
    graph.set_entry_point("node_market_research")

    # Define Workflow Edges
    graph.add_edge("node_market_research", "node_business_planner")
    graph.add_edge("node_business_planner", "node_copywriter")
    graph.add_edge("node_copywriter", "node_code_architect")
    graph.add_edge("node_code_architect", "node_deployment")
    graph.add_edge("node_deployment", END)

    return graph.compile()


# Pre-compiled workflow app
agent_graph_app = build_agent_graph()


async def run_agent_workflow(
    project_id: str,
    user_id: str,
    idea: str,
    industry: str = "Technology",
    preferred_platform: str = "local_sandbox",
    stream_emitter: Callable[[Dict[str, Any]], Any] = None
) -> AgentState:
    """Executes the full multi-agent workflow, saves milestones to Firestore, and emits live telemetry."""
    db = get_db()
    project_ref = db.collection("projects").document(project_id)

    initial_state: AgentState = {
        "project_id": project_id,
        "user_id": user_id,
        "idea": idea,
        "industry": industry,
        "preferred_platform": preferred_platform,
        "current_node": "initializing",
        "logs": [],
        "stream_emitter": stream_emitter
    }

    if stream_emitter:
        await stream_emitter({
            "type": "status",
            "node": "system",
            "message": f"🚀 Launching Autonomous Co-Founder Engine for project {project_id}..."
        })

    # Update project status in DB
    project_ref.update({
        "status": "running",
        "current_node": "market_research"
    })

    try:
        final_state = await agent_graph_app.ainvoke(initial_state)

        # Convert outputs for Firestore serialization
        doc_update = {
            "status": "completed",
            "current_node": "completed",
            "market_research": final_state.get("market_research").model_dump() if final_state.get("market_research") else None,
            "business_plan": final_state.get("business_plan").model_dump() if final_state.get("business_plan") else None,
            "copywriting": final_state.get("copywriting").model_dump() if final_state.get("copywriting") else None,
            "code_architect": final_state.get("code_architect").model_dump() if final_state.get("code_architect") else None,
            "deployment": final_state.get("deployment").model_dump() if final_state.get("deployment") else None,
        }
        try:
            project_ref.update(doc_update)
        except Exception as db_err:
            logger.warning(f"Failed to update final document in Firestore: {db_err}")

        if stream_emitter:
            await stream_emitter({
                "type": "status",
                "node": "system",
                "message": "🏆 Autonomous Co-Founder workflow completed all stages successfully!",
                "data": {
                    "live_url": doc_update["deployment"]["live_url"] if doc_update.get("deployment") else None
                }
            })

        return final_state

    except Exception as e:
        logger.error(f"Workflow execution failed: {e}", exc_info=True)
        project_ref.update({
            "status": "failed",
            "error": str(e)
        })
        if stream_emitter:
            await stream_emitter({
                "type": "error",
                "node": "system",
                "message": f"Workflow failed: {str(e)}"
            })
        raise
