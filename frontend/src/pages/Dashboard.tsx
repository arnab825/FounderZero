import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Globe, 
  Zap, 
  Layers, 
  Clock, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api, ProjectData } from '../services/api';

interface DashboardProps {
  onSelectProject: (projectId: string) => void;
}

const PRESET_IDEAS = [
  {
    title: "AI B2B Cold Outreach Engine",
    industry: "B2B SaaS",
    prompt: "An autonomous agent that analyzes LinkedIn profiles and generates hyper-personalized video & email pitches with automated follow-ups."
  },
  {
    title: "Micro-SaaS Newsletter Monetizer",
    industry: "Creator Economy",
    prompt: "A platform that automatically turns Substack and Beehiiv newsletter archives into interactive paid AI courses and micro-tools."
  },
  {
    title: "Instant API Mock Server & Test Suite",
    industry: "Developer Tools",
    prompt: "A developer tool that ingests OpenAPI specs or database schemas and generates mock REST/GraphQL APIs with realistic synthetic seed data."
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectProject }) => {
  const { user, getIdToken } = useAuth();
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('B2B SaaS');
  const [preferredPlatform, setPreferredPlatform] = useState('local_sandbox');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const token = await getIdToken();
      const list = await api.listProjects(token);
      setProjects(list);
    } catch (err) {
      console.warn("Could not fetch projects list:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const token = await getIdToken();
      const res = await api.generateStartup(
        {
          idea: idea.trim(),
          industry,
          preferred_platform: preferredPlatform,
        },
        token
      );

      if (res.project_id) {
        onSelectProject(res.project_id);
      }
    } catch (err) {
      console.error("Failed to generate startup:", err);
      alert("Failed to start agent workflow. Please check your backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.project_id !== projectId));
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-glow-gradient pointer-events-none z-0" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel text-xs font-semibold text-primary-300 border border-primary-500/20">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span>Autonomous Multi-Agent Swarm • LangGraph + Gemini</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              From Idea to Live Startup
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-accent-purple to-accent-cyan bg-clip-text text-transparent">
              In Under 60 Seconds
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Market research, financial modeling, copywriting, frontend code synthesis, and live cloud deployment orchestrated end-to-end.
          </p>
        </div>

        {/* Startup Generation Form Card */}
        <div className="max-w-3xl mx-auto rounded-3xl glass-panel p-6 sm:p-8 border border-dark-800 shadow-2xl relative">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                <span>Describe your startup idea or problem statement</span>
                <span className="text-slate-500 lowercase font-normal">be as descriptive or raw as you like</span>
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. An autonomous AI co-founder that takes a sentence and builds your full business model, copy, landing page, and live deployment..."
                rows={4}
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-dark-900/90 border border-dark-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm leading-relaxed resize-none"
              />
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Industry Vertical</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="B2B SaaS">B2B SaaS</option>
                  <option value="Developer Tools">Developer Tools</option>
                  <option value="Creator Economy">Creator Economy</option>
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech">HealthTech & Wellness</option>
                  <option value="E-Commerce">E-Commerce & Retail</option>
                  <option value="AI Consumer Tech">AI Consumer Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Deployment Target</label>
                <select
                  value={preferredPlatform}
                  onChange={(e) => setPreferredPlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="local_sandbox">⚡ Instant Sandboxed Preview</option>
                  <option value="vercel">▲ Vercel Edge API</option>
                  <option value="firebase">🔥 Firebase Spark Hosting</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!idea.trim() || isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-cyan text-white font-bold text-sm sm:text-base shadow-xl shadow-primary-600/30 hover:opacity-95 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Launching LangGraph Multi-Agent Swarm...</span>
                </>
              ) : (
                <>
                  <span>Launch Autonomous Co-Founder</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Preset Starters */}
          <div className="mt-6 pt-5 border-t border-dark-800/80">
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Or try an instant idea preset:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_IDEAS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIdea(preset.prompt);
                    setIndustry(preset.industry);
                  }}
                  className="text-left p-3 rounded-xl bg-dark-900/60 hover:bg-dark-850 border border-dark-800 hover:border-primary-500/40 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-300 group-hover:text-primary-300 transition-colors truncate">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{preset.industry}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Generated Startups Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-400" />
                <span>Your Startup Portfolio</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore previously synthesized multi-agent startup artifacts.</p>
            </div>
          </div>

          {loadingProjects ? (
            <div className="py-12 text-center text-slate-500">
              <Sparkles className="w-6 h-6 mx-auto mb-2 animate-spin text-primary-500" />
              <p className="text-xs">Loading startup projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel text-center text-slate-500 space-y-2">
              <Bot className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No startup projects generated yet.</p>
              <p className="text-xs text-slate-500">Enter an idea above to launch your first autonomous multi-agent run!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => {
                const title = proj.copywriting?.headline || proj.code_architect?.app_title || proj.idea.slice(0, 35) + '...';
                const isComplete = proj.status === 'completed';

                return (
                  <div
                    key={proj.project_id}
                    onClick={() => onSelectProject(proj.project_id)}
                    className="p-5 rounded-2xl glass-panel glass-panel-hover border border-dark-800 cursor-pointer flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-dark-850 text-slate-400 border border-dark-750 font-mono">
                          {proj.industry}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isComplete
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-primary-500/10 text-primary-400 border border-primary-500/20 animate-pulse'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                            <span>{proj.status}</span>
                          </span>

                          <button
                            onClick={(e) => handleDelete(proj.project_id, e)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-dark-800 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-100 text-base leading-snug group-hover:text-primary-300 transition-colors line-clamp-2 mb-2">
                        {title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {proj.idea}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-dark-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                      </span>

                      {proj.deployment?.live_url && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Deployed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800/80 py-6 px-4 text-center text-xs text-slate-600 relative z-10">
        <p>© 2026 FounderZero • Built with LangGraph, FastAPI, Firebase & Google Gemini.</p>
      </footer>
    </div>
  );
};
