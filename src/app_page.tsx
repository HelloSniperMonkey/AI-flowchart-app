'use client'

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from './components/Sidebar.tsx';
import CustomNode from './components/CustomNode.tsx';
import MermaidNode from './components/MermaidNode.tsx';

const nodeTypes = {
  custom: CustomNode,
  mermaid: MermaidNode,
};

export default function FlowchartApp() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleNodeNameChange = useCallback((nodeId: string, newName: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label: newName } } : node
      )
    );
  }, [setNodes]);

  const onConnect = useCallback((params: Connection | Edge) => {
    const sourceHandle = params.sourceHandle as string;
    const targetHandle = params.targetHandle as string;
    
    const getPosition = (handle: string) => {
      switch(handle) {
        case 't': return 'top';
        case 'r': return 'right';
        case 'b': return 'bottom';
        case 'l': return 'left';
        default: return 'top';
      }
    };

    const sourcePosition = getPosition(sourceHandle);
    const targetPosition = getPosition(targetHandle);

    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: {
        strokeWidth: 2,
        stroke: '#FF0072',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#FF0072',
      },
    }, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      let newNode;
      if (type === 'mermaid') {
        newNode = {
          id: String(Date.now()),
          type: 'mermaid',
          position,
          data: { 
            chart: `graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server1]
    B --> D[Server2]`
          },
        };
      } else {
        newNode = {
          id: String(Date.now()),
          type: 'custom',
          position,
          data: { label: `${type} node`, onNameChange: handleNodeNameChange },
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, handleNodeNameChange]
  );

  React.useEffect(() => {
    // Initialize with a single node
    const initialNode: Node = {
      id: '1',
      type: 'custom',
      data: { label: 'Input Node', onNameChange: handleNodeNameChange },
      position: { x: 250, y: 5 },
    };
    setNodes([initialNode]);
  }, [setNodes, handleNodeNameChange]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          style={{ background: '#fff' }}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} color="#ccc"/>
        </ReactFlow>
      </div>
    </div>
  );
}

