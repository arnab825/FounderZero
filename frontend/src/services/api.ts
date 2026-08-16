import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface GenerateStartupPayload {
  idea: string;
  industry?: string;
  target_audience?: string;
  preferred_platform?: string;
}

export interface CompetitorInfo {
  name: string;
  website?: string;
  strengths: string[];
  weaknesses: string[];
  differentiation: string;
}

export interface PersonaInfo {
  title: string;
  pain_points: string[];
  willingness_to_pay: string;
  channels: string[];
}

export interface MarketResearchData {
  market_size_summary: string;
  demand_validation: string;
  competitors: CompetitorInfo[];
  target_personas: PersonaInfo[];
  key_risks_and_mitigations: Array<{ risk: string; mitigation: string }>;
}

export interface MilestoneItem {
  quarter: string;
  focus: string;
  goals: string[];
  target_kpis: Record<string, string>;
}

export interface FinancialModel {
  pricing_tiers: Array<{ name: string; price: string; features: string[] }>;
  estimated_cac: string;
  estimated_ltv: string;
  breakeven_month: number;
  monthly_budget_breakdown: Record<string, number>;
}

export interface BusinessPlanData {
  executive_summary: string;
  revenue_streams: string[];
  financial_model: FinancialModel;
  milestones: MilestoneItem[];
}

export interface CopywritingData {
  headline: string;
  subheadline: string;
  value_props: Array<{ feature: string; benefit: string }>;
  elevator_pitch: string;
  cta_text: string;
  faq_items: Array<{ question: string; answer: string }>;
  social_media_hooks: string[];
}

export interface CodeArchitectData {
  app_title: string;
  tech_stack: string;
  html_code: string;
  preview_description: string;
}

export interface DeploymentData {
  status: string;
  platform: string;
  live_url: string;
  deployed_at: string;
  details?: string;
}

export interface ProjectData {
  project_id: string;
  user_id: string;
  idea: string;
  industry: string;
  target_audience?: string;
  preferred_platform?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  current_node?: string;
  created_at: string;
  updated_at: string;
  market_research?: MarketResearchData;
  business_plan?: BusinessPlanData;
  copywriting?: CopywritingData;
  code_architect?: CodeArchitectData;
  deployment?: DeploymentData;
  logs?: Array<{ timestamp: string; message: string; node?: string }>;
}

export const api = {
  async generateStartup(payload: GenerateStartupPayload, token?: string | null): Promise<{ project_id: string; status: string; message: string }> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.post('/api/projects/generate', payload, { headers });
    return res.data;
  },

  async listProjects(token?: string | null): Promise<ProjectData[]> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.get('/api/projects', { headers });
    return res.data;
  },

  async getProject(projectId: string): Promise<ProjectData> {
    const res = await apiClient.get(`/api/projects/${projectId}`);
    return res.data;
  },

  async rerunProject(projectId: string, token?: string | null): Promise<{ project_id: string; status: string }> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.post(`/api/projects/${projectId}/rerun`, {}, { headers });
    return res.data;
  },

  async deleteProject(projectId: string): Promise<{ status: string }> {
    const res = await apiClient.delete(`/api/projects/${projectId}`);
    return res.data;
  }
};
