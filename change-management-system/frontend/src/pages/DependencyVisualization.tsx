import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
  Panel,
  Handle,
  Position,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitBranch,
  Plus,
  Trash2,
  Info,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useChangesStore } from '../store/changesStore';
import axios from 'axios';

interface ProjectCard {
  id: string;
  title: string;
  description?: string;
  requestNumber?: string;
  status?: string;
}

// Custom Node Component - Simple Change Card with Connection Handles
const CustomNode = ({ data, id }: any) => {
  const borderColor = data.groupColor || 'border-gray-300';
  const bgColor = data.groupColor
    ? data.groupColor.replace('border-', 'bg-').replace('500', '50')
    : 'bg-white';
  const handleColor = data.groupColor
    ? data.groupColor.replace('border-', 'bg-')
    : 'bg-blue-500';

  return (
    <div className={`group px-6 py-4 rounded-xl border-2 ${borderColor} ${bgColor} dark:bg-gray-800 shadow-lg min-w-[220px] hover:shadow-xl transition-shadow relative`}>
      {/* Connection handles - these allow dragging connections */}
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${handleColor}`} />
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${handleColor}`} />

      <div className="font-bold text-base text-gray-900 dark:text-white mb-2">
        {data.title}
      </div>
      {data.requestNumber && (
        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
          {data.requestNumber}
        </div>
      )}
      {data.description && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {data.description}
        </div>
      )}
      {data.status && (
        <div className="mt-2">
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
            {data.status}
          </span>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export const DependencyVisualization: React.FC = () => {
  const { changes, fetchChanges, isLoading } = useChangesStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [showHelp, setShowHelp] = useState(true);

  // Save diagram state to backend
  const saveDiagramState = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/diagram/state`,
        { nodes, edges },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Diagram saved successfully!');
    } catch (error) {
      console.error('Failed to save diagram:', error);
      toast.error('Failed to save diagram');
    }
  }, [nodes, edges]);

  // Load diagram state from backend
  const loadDiagramState = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/diagram/state`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data) {
        const { nodes: savedNodes, edges: savedEdges } = response.data.data;

        if (savedNodes && savedNodes.length > 0) {
          setNodes(savedNodes);
        }
        if (savedEdges && savedEdges.length > 0) {
          setEdges(savedEdges);
        }
      }
    } catch (error) {
      console.error('Failed to load diagram state:', error);
    }
  }, [setNodes, setEdges]);

  // Fetch changes from database on mount
  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  // Load saved diagram state on mount
  useEffect(() => {
    loadDiagramState();
  }, [loadDiagramState]);

  // Convert changes to nodes when they load
  useEffect(() => {
    if (changes.length > 0) {
      const changeNodes: Node[] = changes.map((change, index) => ({
        id: change.id.toString(),
        type: 'custom',
        position: {
          x: 100 + (index % 4) * 300, // Arrange in grid
          y: 100 + Math.floor(index / 4) * 200,
        },
        data: {
          id: change.id.toString(),
          title: change.title || 'Untitled',
          description: change.description,
          requestNumber: change.requestNumber,
          status: change.status,
        },
      }));
      setNodes(changeNodes);
    }
  }, [changes, setNodes]);

  // Color palette for connected groups
  const groupColors = [
    'border-blue-500',
    'border-green-500',
    'border-purple-500',
    'border-orange-500',
    'border-pink-500',
    'border-yellow-500',
    'border-red-500',
    'border-indigo-500',
    'border-teal-500',
    'border-cyan-500',
  ];

  // Function to find connected components (groups) using Union-Find algorithm
  const findConnectedGroups = useCallback((nodeList: Node[], edgeList: Edge[]) => {
    const parent: { [key: string]: string } = {};

    // Initialize each node as its own parent
    nodeList.forEach(node => {
      parent[node.id] = node.id;
    });

    // Find function with path compression
    const find = (id: string): string => {
      if (parent[id] !== id) {
        parent[id] = find(parent[id]);
      }
      return parent[id];
    };

    // Union function
    const union = (id1: string, id2: string) => {
      const root1 = find(id1);
      const root2 = find(id2);
      if (root1 !== root2) {
        parent[root2] = root1;
      }
    };

    // Connect all nodes that have edges between them
    edgeList.forEach(edge => {
      if (edge.source && edge.target) {
        union(edge.source, edge.target);
      }
    });

    // Group nodes by their root parent
    const groups: { [key: string]: string[] } = {};
    nodeList.forEach(node => {
      const root = find(node.id);
      if (!groups[root]) {
        groups[root] = [];
      }
      groups[root].push(node.id);
    });

    return groups;
  }, []);

  // Update node colors when edges change
  useEffect(() => {
    if (nodes.length === 0 || edges.length === 0) {
      // Reset colors if no edges
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, groupColor: 'border-gray-300' },
        }))
      );
      return;
    }

    const groups = findConnectedGroups(nodes, edges);
    const groupIds = Object.keys(groups).filter(key => groups[key].length > 1); // Only color groups with 2+ nodes

    // Assign colors to groups
    const nodeColorMap: { [key: string]: string } = {};
    groupIds.forEach((groupId, index) => {
      const color = groupColors[index % groupColors.length];
      groups[groupId].forEach(nodeId => {
        nodeColorMap[nodeId] = color;
      });
    });

    // Update nodes with their group colors
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          groupColor: nodeColorMap[node.id] || 'border-gray-300'
        },
      }))
    );
  }, [edges, findConnectedGroups, setNodes, nodes.length]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        label: 'blocks',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Dependency link added');
    },
    [setEdges]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      toast.success(`Removed ${deletedEdges.length} connection(s)`);
    },
    []
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-blue-600" />
              Change Planning Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Visualise and plan change request dependencies - drag cards to arrange, connect them to show blockers
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Loading changes...
              </div>
            )}
            <button
              onClick={saveDiagramState}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Save size={20} />
              Save Diagram
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />

          {/* Instructions Panel */}
          <Panel position="top-left" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
            <div className="p-4">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center justify-between font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  How to Use
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {showHelp ? '▼' : '▶'}
                </span>
              </button>
              {showHelp && (
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Drag cards</strong> to arrange your change flow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Connect cards</strong> by dragging from the blue dot at the bottom of one card to the blue dot at the top of another</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Delete connections</strong> by clicking a line and pressing Delete/Backspace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Changes load</strong> automatically from your change requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Connected changes</strong> share the same color for easy identification</span>
                  </li>
                </ul>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default DependencyVisualization;
