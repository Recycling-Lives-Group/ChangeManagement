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
} from 'lucide-react';
import { toast } from 'sonner';
import { useChangesStore } from '../store/changesStore';

interface ProjectCard {
  id: string;
  title: string;
  description?: string;
  requestNumber?: string;
  status?: string;
}

// Custom Node Component - Simple Change Card with Connection Handles
const CustomNode = ({ data, id }: any) => {
  return (
    <div className="group px-6 py-4 rounded-xl border-2 border-blue-500 bg-white dark:bg-gray-800 shadow-lg min-w-[220px] hover:shadow-xl transition-shadow relative">
      {/* Connection handles - these allow dragging connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />

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

  // Fetch changes from database on mount
  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

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
          {isLoading && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading changes...
            </div>
          )}
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
          <Panel position="top-left" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              How to Use
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
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
            </ul>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default DependencyVisualization;
