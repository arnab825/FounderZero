import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RotateCw
} from 'lucide-react';
import { api, ProjectData } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useAgentWebSocket } from '../hooks/useAgentWebSocket';
import { TerminalLog } from '../components/TerminalLog';
import { BusinessRoadmap } from '../components/BusinessRoadmap';
import { CodePreview } from '../components/CodePreview';
import { DeploymentBadge } from '../components/DeploymentBadge';

interface ProjectViewProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ projectId, onBack }) => {
  const { getIdToken } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'all' | 'preview' | 'business' | 'terminal'>('all');
  const [isRerunning, setIsRerunning] = useState(false);

  const {
    logs,
    currentNode,
    isConnected,
    isFinished,
    artifacts,
    clearLogs,
  } = useAgentWebSocket(projectId);

  const fetchProjectDetails = async () => {
    try {
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error("Failed to load project details:", err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Automatically sync full database state as nodes finish or workflow completes
  useEffect(() => {
    if (isFinished || currentNode === 'completed' || currentNode === 'deployment') {
      fetchProjectDetails();
    }
  }, [isFinished, currentNode]);

  const handleRerun = async () => {
    try {
      setIsRerunning(true);
      clearLogs();
      const token = await getIdToken();
      await api.rerunProject(projectId, token);
    } catch (err) {
      console.error("Failed to rerun agent workflow:", err);
    } finally {
      setIsRerunning(false);
    }
  };

  // Merge live streaming artifacts with persisted project data
  const marketResearch = artifacts.marketResearch || project?.market_research;
  const businessPlan = artifacts.businessPlan || project?.business_plan;
  const copywriting = artifacts.copywriting || project?.copywriting;
  const codeArchitect = artifacts.codeArchitect || project?.code_architect;
  const deployment = artifacts.deployment || project?.deployment;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-950 text-slate-100 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-800">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-dark-900 hover:bg-dark-850 text-slate-400 hover:text-slate-200 border border-dark-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white truncate max-w-[280px] sm:max-w-md">
                {codeArchitect?.app_title || project?.idea.slice(0, 40) || 'Autonomous Startup'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-dark-850 text-slate-400 border border-dark-750 font-mono uppercase">
                {project?.industry || 'B2B SaaS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xl mt-0.5">
              {project?.idea}
            </p>
          </div>
        </div>

        {/* Workspace Layout Switcher & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-dark-900 border border-dark-800">
            <button
              onClick={() => setActiveWorkspaceTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeWorkspaceTab === 'all' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Split Workspace
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeWorkspaceTab === 'preview' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full App Canvas
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('business')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeWorkspaceTab === 'business' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Business Plan
            </button>
          </div>

          <button
            onClick={handleRerun}
            disabled={isRerunning}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 text-xs font-semibold border border-dark-750 transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRerunning ? 'animate-spin' : ''}`} />
            <span>{isRerunning ? 'Rerunning...' : 'Rerun Agents'}</span>
          </button>
        </div>
      </div>

      {/* Deployment Banner if deployed */}
      {deployment && <DeploymentBadge deployment={deployment} />}

      {/* Main Workspace Grid */}
      <div className="flex-1 min-h-0">
        {activeWorkspaceTab === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[820px] h-auto">
            {/* Left Column: Live Terminal */}
            <div className="lg:col-span-5 h-[500px] lg:h-full min-h-0">
              <TerminalLog
                logs={logs}
                currentNode={currentNode}
                isFinished={isFinished || project?.status === 'completed'}
                isConnected={isConnected}
              />
            </div>

            {/* Right Column: Full-Height Interactive App Preview */}
            <div className="lg:col-span-7 h-[700px] lg:h-full min-h-0">
              <CodePreview
                codeArchitect={codeArchitect}
                deployment={deployment}
              />
            </div>
          </div>
        )}

        {activeWorkspaceTab === 'preview' && (
          <div className="h-[840px]">
            <CodePreview
              codeArchitect={codeArchitect}
              deployment={deployment}
            />
          </div>
        )}

        {activeWorkspaceTab === 'business' && (
          <div className="h-[840px]">
            <BusinessRoadmap
              marketResearch={marketResearch}
              businessPlan={businessPlan}
              copywriting={copywriting}
            />
          </div>
        )}

        {activeWorkspaceTab === 'terminal' && (
          <div className="h-[840px]">
            <TerminalLog
              logs={logs}
              currentNode={currentNode}
              isFinished={isFinished || project?.status === 'completed'}
              isConnected={isConnected}
            />
          </div>
        )}
      </div>

    </div>
  );
};
