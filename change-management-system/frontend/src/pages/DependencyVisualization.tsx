import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitBranch,
  Circle,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';

interface ChangeNode {
  id: string;
  title: string;
  type: 'emergency' | 'major' | 'minor' | 'standard';
  status: 'new' | 'in-review' | 'approved' | 'scheduled' | 'implementing' | 'completed' | 'blocked';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

// Custom Node Component
const CustomNode = ({ data }: any) => {
  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 border-blue-500 text-blue-900',
      'in-review': 'bg-yellow-100 border-yellow-500 text-yellow-900',
      approved: 'bg-green-100 border-green-500 text-green-900',
      scheduled: 'bg-purple-100 border-purple-500 text-purple-900',
      implementing: 'bg-orange-100 border-orange-500 text-orange-900',
      completed: 'bg-gray-100 border-gray-500 text-gray-900',
      blocked: 'bg-red-100 border-red-500 text-red-900',
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4" />;
      case 'implementing':
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] ${getStatusColor(data.status)}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {getStatusIcon(data.status)}
        <div className="font-semibold text-sm">{data.id}</div>
      </div>
      <div className="text-xs font-medium mb-2">{data.title}</div>
      <div className="flex gap-1">
        <span className="px-2 py-0.5 bg-white bg-opacity-70 rounded text-xs font-semibold">
          {data.type}
        </span>
        <span className="px-2 py-0.5 bg-white bg-opacity-70 rounded text-xs font-semibold">
          {data.riskLevel}
        </span>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Sample data for the dependency graph
const sampleNodes: ChangeNode[] = [
  {
    id: 'CR-2025-001',
    title: 'Database Schema Update',
    type: 'major',
    status: 'completed',
    riskLevel: 'high',
  },
  {
    id: 'CR-2025-002',
    title: 'API Gateway Configuration',
    type: 'major',
    status: 'implementing',
    riskLevel: 'medium',
  },
  {
    id: 'CR-2025-003',
    title: 'Authentication Service Update',
    type: 'major',
    status: 'scheduled',
    riskLevel: 'high',
  },
  {
    id: 'CR-2025-004',
    title: 'Frontend UI Components',
    type: 'minor',
    status: 'in-review',
    riskLevel: 'low',
  },
  {
    id: 'CR-2025-005',
    title: 'Payment Integration',
    type: 'major',
    status: 'approved',
    riskLevel: 'medium',
  },
  {
    id: 'CR-2025-006',
    title: 'Email Notification System',
    type: 'standard',
    status: 'new',
    riskLevel: 'low',
  },
  {
    id: 'CR-2025-007',
    title: 'Analytics Dashboard',
    type: 'minor',
    status: 'blocked',
    riskLevel: 'low',
  },
  {
    id: 'CR-2025-008',
    title: 'Security Audit Implementation',
    type: 'emergency',
    status: 'implementing',
    riskLevel: 'critical',
  },
];

const initialNodes: Node[] = sampleNodes.map((node, index) => ({
  id: node.id,
  type: 'custom',
  position: {
    x: (index % 3) * 300 + 100,
    y: Math.floor(index / 3) * 200 + 100,
  },
  data: node,
}));

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'CR-2025-001',
    target: 'CR-2025-002',
    type: 'smoothstep',
    animated: true,
    label: 'requires',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e1-3',
    source: 'CR-2025-001',
    target: 'CR-2025-003',
    type: 'smoothstep',
    animated: true,
    label: 'requires',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e2-4',
    source: 'CR-2025-002',
    target: 'CR-2025-004',
    type: 'smoothstep',
    label: 'enables',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e3-5',
    source: 'CR-2025-003',
    target: 'CR-2025-005',
    type: 'smoothstep',
    label: 'enables',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e2-6',
    source: 'CR-2025-002',
    target: 'CR-2025-006',
    type: 'smoothstep',
    label: 'enables',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e4-7',
    source: 'CR-2025-004',
    target: 'CR-2025-007',
    type: 'smoothstep',
    label: 'blocked by',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#ef4444' },
  },
  {
    id: 'e8-3',
    source: 'CR-2025-008',
    target: 'CR-2025-003',
    type: 'smoothstep',
    animated: true,
    label: 'critical',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#dc2626', strokeWidth: 2 },
  },
];

export const DependencyVisualization: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<ChangeNode | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: any, node: Node) => {
    const nodeData = sampleNodes.find((n) => n.id === node.id);
    if (nodeData) {
      setSelectedNode(nodeData);
    }
  }, []);

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    sampleNodes.forEach((node) => {
      counts[node.status] = (counts[node.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-8 h-8" />
              Change Dependency Visualization
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visual representation of change request dependencies and relationships
            </p>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showLegend ? 'Hide' : 'Show'} Legend
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Flow Diagram */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls />
          </ReactFlow>

          {/* Legend Overlay */}
          {showLegend && (
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Status Legend
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100"></div>
                  <span className="text-gray-700 dark:text-gray-300">New ({statusCounts.new || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-yellow-500 bg-yellow-100"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    In Review ({statusCounts['in-review'] || 0})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-100"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Approved ({statusCounts.approved || 0})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-100"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Scheduled ({statusCounts.scheduled || 0})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-orange-500 bg-orange-100"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Implementing ({statusCounts.implementing || 0})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-gray-500 bg-gray-100"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Completed ({statusCounts.completed || 0})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-100"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Blocked ({statusCounts.blocked || 0})
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                  Edge Types
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-gray-700"></div>
                    <span className="text-gray-700 dark:text-gray-300">Regular dependency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-blue-500 animate-pulse"></div>
                    <span className="text-gray-700 dark:text-gray-300">Active/In-progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">Critical/Blocking</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        {selectedNode && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedNode.id}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedNode.title}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNode.type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedNode.status.replace('-', ' ')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedNode.riskLevel === 'critical'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : selectedNode.riskLevel === 'high'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : selectedNode.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {selectedNode.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Dependencies
                </h3>
                <div className="space-y-2">
                  {initialEdges
                    .filter((edge) => edge.target === selectedNode.id)
                    .map((edge) => {
                      const sourceNode = sampleNodes.find((n) => n.id === edge.source);
                      return (
                        <div
                          key={edge.id}
                          className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {edge.source}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {sourceNode?.title}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {edge.label || 'depends on'}
                          </p>
                        </div>
                      );
                    })}
                  {initialEdges.filter((edge) => edge.target === selectedNode.id).length ===
                    0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No dependencies
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Dependent Changes
                </h3>
                <div className="space-y-2">
                  {initialEdges
                    .filter((edge) => edge.source === selectedNode.id)
                    .map((edge) => {
                      const targetNode = sampleNodes.find((n) => n.id === edge.target);
                      return (
                        <div
                          key={edge.id}
                          className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {edge.target}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {targetNode?.title}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {edge.label || 'blocks'}
                          </p>
                        </div>
                      );
                    })}
                  {initialEdges.filter((edge) => edge.source === selectedNode.id).length ===
                    0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No dependent changes
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DependencyVisualization;
