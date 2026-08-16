import { useState, useEffect, useRef, useCallback } from 'react';
import { MarketResearchData, BusinessPlanData, CopywritingData, CodeArchitectData, DeploymentData } from '../services/api';

export interface TelemetryLog {
  id: string;
  timestamp: string;
  node?: string;
  type: 'log' | 'node_start' | 'node_end' | 'token' | 'artifact' | 'status' | 'error';
  message: string;
  data?: any;
}

export interface LiveAgentArtifacts {
  marketResearch?: MarketResearchData;
  businessPlan?: BusinessPlanData;
  copywriting?: CopywritingData;
  codeArchitect?: CodeArchitectData;
  deployment?: DeploymentData;
}

export function useAgentWebSocket(projectId?: string | null) {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [currentNode, setCurrentNode] = useState<string>('idle');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [artifacts, setArtifacts] = useState<LiveAgentArtifacts>({});
  const wsRef = useRef<WebSocket | null>(null);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setArtifacts({});
    setIsFinished(false);
    setCurrentNode('idle');
  }, []);

  useEffect(() => {
    if (!projectId) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use configured WS URL or current host
    const wsBase = import.meta.env.VITE_WS_URL 
      ? import.meta.env.VITE_WS_URL.replace('http', 'ws') 
      : `${protocol}//${window.location.host}`;
    
    const wsUrl = `${wsBase}/ws/agent/${projectId}`;
    console.log(`Connecting to agent telemetry WebSocket: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const logItem: TelemetryLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: payload.timestamp || new Date().toLocaleTimeString(),
          node: payload.node,
          type: payload.type || 'log',
          message: payload.message || '',
          data: payload.data,
        };

        setLogs((prev) => [...prev, logItem]);

        if (payload.node && payload.node !== 'system') {
          setCurrentNode(payload.node);
        }

        // Capture live artifacts
        if (payload.type === 'artifact' && payload.data) {
          if (payload.node === 'market_research') {
            setArtifacts((prev) => ({ ...prev, marketResearch: payload.data }));
          } else if (payload.node === 'business_planner') {
            setArtifacts((prev) => ({ ...prev, businessPlan: payload.data }));
          } else if (payload.node === 'copywriter') {
            setArtifacts((prev) => ({ ...prev, copywriting: payload.data }));
          } else if (payload.node === 'code_architect') {
            setArtifacts((prev) => ({ ...prev, codeArchitect: payload.data }));
          } else if (payload.node === 'deployment') {
            setArtifacts((prev) => ({ ...prev, deployment: payload.data }));
            setIsFinished(true);
            setCurrentNode('completed');
          }
        }

        if (payload.message && payload.message.includes('completed all stages')) {
          setIsFinished(true);
          setCurrentNode('completed');
        }
      } catch (err) {
        console.error('Error parsing WebSocket telemetry:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.warn('WebSocket telemetry connection note:', err);
      setIsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  return {
    logs,
    currentNode,
    isConnected,
    isFinished,
    artifacts,
    clearLogs,
    setArtifacts
  };
}
