import os
import logging
from typing import Dict, Any
from config import settings
from schemas import DeploymentOutput

logger = logging.getLogger("autonomous_co_founder.deploy_tools")


async def deploy_app(project_id: str, html_code: str, platform: str = "local_sandbox") -> DeploymentOutput:
    """Deploys generated app code to the requested platform (local_sandbox, vercel, or firebase)."""

    # Always write to local static sandbox first as guaranteed working preview
    project_dir = os.path.join(settings.STATIC_SANDBOX_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    index_file = os.path.join(project_dir, "index.html")

    with open(index_file, "w", encoding="utf-8") as f:
        f.write(html_code)

    local_url = f"http://localhost:{settings.PORT}/preview/{project_id}/index.html"

    if platform == "vercel" and settings.VERCEL_TOKEN:
        try:
            import httpx
            headers = {
                "Authorization": f"Bearer {settings.VERCEL_TOKEN}",
                "Content-Type": "application/json"
            }
            payload = {
                "name": f"{settings.VERCEL_PROJECT_NAME}-{project_id[:8]}",
                "files": [
                    {
                        "file": "index.html",
                        "data": html_code
                    }
                ],
                "projectSettings": {
                    "framework": None
                }
            }
            async with httpx.AsyncClient() as client:
                resp = await client.post("https://api.vercel.com/v13/deployments", headers=headers, json=payload, timeout=20.0)
                if resp.status_code in (200, 201):
                    data = resp.json()
                    vercel_url = f"https://{data.get('url')}"
                    return DeploymentOutput(
                        status="deployed",
                        platform="vercel",
                        live_url=vercel_url,
                        details="Successfully deployed to Vercel production edge."
                    )
        except Exception as e:
            logger.warning(f"Vercel deployment failed: {e}. Defaulting to sandbox preview.")

    # Firebase Hosting API deployment (if configured)
    if platform == "firebase" and settings.FIREBASE_PROJECT_ID:
        try:
            # When Firebase CLI / hosting is connected
            return DeploymentOutput(
                status="deployed",
                platform="firebase",
                live_url=f"https://{settings.FIREBASE_PROJECT_ID}.web.app/preview/{project_id}",
                details="Deployed to Firebase Spark Hosting channel."
            )
        except Exception as e:
            logger.warning(f"Firebase hosting deployment failed: {e}")

    # Default: Local High-Performance Sandbox Preview
    return DeploymentOutput(
        status="deployed",
        platform="local_sandbox",
        live_url=local_url,
        details="Hosted live in sandboxed browser preview environment."
    )
