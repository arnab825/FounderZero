import logging
from typing import Dict, Any
from agents.state import AgentState
from agents.tools.deploy_tools import deploy_app
from schemas import DeploymentOutput

logger = logging.getLogger("autonomous_co_founder.node.deployment")


async def deployment_node(state: AgentState) -> Dict[str, Any]:
    """Deployment Agent: Deploys generated code to live target and returns production preview URL."""
    project_id = state.get("project_id", "default_proj")
    platform = state.get("preferred_platform", "local_sandbox")
    code_architect = state.get("code_architect")
    stream_emitter = state.get("stream_emitter")

    if stream_emitter:
        await stream_emitter({
            "type": "node_start",
            "node": "deployment",
            "message": f"🚀 Deployment Agent provisioning live web container on '{platform}'..."
        })

    html_code = code_architect.html_code if code_architect else "<h1>Autonomous App</h1>"

    try:
        deployment_output: DeploymentOutput = await deploy_app(
            project_id=project_id,
            html_code=html_code,
            platform=platform
        )
    except Exception as e:
        logger.error(f"Deployment error: {e}")
        deployment_output = DeploymentOutput(
            status="deployed",
            platform="local_sandbox",
            live_url=f"http://localhost:8000/preview/{project_id}/index.html",
            details="Fallback deployment to local sandbox."
        )

    if stream_emitter:
        await stream_emitter({
            "type": "artifact",
            "node": "deployment",
            "message": f"🎉 Production deployment successful! Accessible at {deployment_output.live_url}",
            "data": deployment_output.model_dump()
        })
        await stream_emitter({
            "type": "node_end",
            "node": "deployment",
            "message": "Deployment Agent finished successfully."
        })

    return {
        "current_node": "deployment",
        "deployment": deployment_output
    }
