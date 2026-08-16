from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# --- Agent Output Schemas ---

class CompetitorInfo(BaseModel):
    name: str = Field(..., description="Name of competitor")
    website: Optional[str] = Field(None, description="Website or domain")
    strengths: List[str] = Field(default_factory=list, description="Key competitor strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Key competitor weaknesses or gaps")
    differentiation: str = Field(..., description="How our startup differentiates")


class PersonaInfo(BaseModel):
    title: str = Field(..., description="Target persona title e.g. Early-stage Founder")
    pain_points: List[str] = Field(default_factory=list, description="Primary pain points")
    willingness_to_pay: str = Field(..., description="Estimated willingness to pay & pricing model")
    channels: List[str] = Field(default_factory=list, description="Where to acquire this persona")


class MarketResearchOutput(BaseModel):
    market_size_summary: str = Field(..., description="TAM/SAM/SOM or market demand summary")
    demand_validation: str = Field(..., description="Demand trends and why now")
    competitors: List[CompetitorInfo] = Field(default_factory=list, description="List of direct and indirect competitors")
    target_personas: List[PersonaInfo] = Field(default_factory=list, description="Target customer profiles")
    key_risks_and_mitigations: List[Dict[str, str]] = Field(default_factory=list, description="Identified risks and mitigation strategies")


class MilestoneItem(BaseModel):
    quarter: str = Field(..., description="Quarter e.g. Q1, Q2, Q3, Q4")
    focus: str = Field(..., description="Core operational focus")
    goals: List[str] = Field(default_factory=list, description="Key milestones to achieve")
    target_kpis: Dict[str, str] = Field(default_factory=dict, description="Key target KPIs (e.g. MRR, Users)")


class FinancialModel(BaseModel):
    pricing_tiers: List[Dict[str, Any]] = Field(default_factory=list, description="Pricing plans and features")
    estimated_cac: str = Field(..., description="Estimated Customer Acquisition Cost")
    estimated_ltv: str = Field(..., description="Estimated Lifetime Value")
    breakeven_month: int = Field(default=6, description="Estimated month to reach break-even")
    monthly_budget_breakdown: Dict[str, int] = Field(default_factory=dict, description="Estimated initial monthly burn breakdown")


class BusinessPlanOutput(BaseModel):
    executive_summary: str = Field(..., description="One-paragraph business plan summary")
    revenue_streams: List[str] = Field(default_factory=list, description="Monetization models")
    financial_model: FinancialModel = Field(..., description="Financial projections & unit economics")
    milestones: List[MilestoneItem] = Field(default_factory=list, description="12-Month milestone roadmap")


class CopywritingOutput(BaseModel):
    headline: str = Field(..., description="Hero section headline")
    subheadline: str = Field(..., description="Hero subheadline")
    value_props: List[Dict[str, str]] = Field(default_factory=list, description="Feature and benefit pairs")
    elevator_pitch: str = Field(..., description="30-second elevator pitch")
    cta_text: str = Field(..., description="Primary Call to Action button text")
    faq_items: List[Dict[str, str]] = Field(default_factory=list, description="Frequently asked questions & answers")
    social_media_hooks: List[str] = Field(default_factory=list, description="Viral launch post templates for X/LinkedIn")


class CodeArchitectOutput(BaseModel):
    app_title: str = Field(..., description="Generated web application title")
    tech_stack: str = Field(default="HTML5, Tailwind CSS, Vanilla JS", description="Frontend technology used")
    html_code: str = Field(..., description="Complete self-contained HTML/Tailwind/JS code ready to run in browser")
    preview_description: str = Field(..., description="Summary of interactive features implemented in the code")


class DeploymentOutput(BaseModel):
    status: str = Field(default="deployed", description="Deployment status: pending, deploying, deployed, failed")
    platform: str = Field(default="local_sandbox", description="Platform deployed to: firebase, vercel, local_sandbox")
    live_url: str = Field(..., description="Live accessible web preview URL")
    deployed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="ISO timestamp")
    details: Optional[str] = None


# --- Project Request & Response Schemas ---

class GenerateStartupRequest(BaseModel):
    idea: str = Field(..., min_length=5, description="Startup idea or problem statement")
    industry: Optional[str] = Field("General Tech", description="Target industry or vertical")
    target_audience: Optional[str] = Field(None, description="Optional target audience hint")
    preferred_platform: Optional[str] = Field("local_sandbox", description="Deployment platform: local_sandbox, firebase, vercel")


class ProjectDocument(BaseModel):
    project_id: str
    user_id: str
    idea: str
    industry: str
    status: str = "pending"  # pending, running, completed, failed
    current_node: Optional[str] = None
    created_at: str
    updated_at: str
    market_research: Optional[MarketResearchOutput] = None
    business_plan: Optional[BusinessPlanOutput] = None
    copywriting: Optional[CopywritingOutput] = None
    code_architect: Optional[CodeArchitectOutput] = None
    deployment: Optional[DeploymentOutput] = None
    logs: List[Dict[str, Any]] = Field(default_factory=list)


class WebSocketMessage(BaseModel):
    type: str  # log, node_start, node_end, token, artifact, status, error
    node: Optional[str] = None
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
