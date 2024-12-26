import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { initialNodes,  } from './nodes';
import { initialEdges, edgeTypes } from './edges';

import Sidebar from './components/Sidebar.tsx';
import CustomNode from './components/CustomNode.tsx';
import MermaidNode from './components/MermaidNode.tsx';
import { PositionLoggerNode } from './nodes/PositionLoggerNode.tsx';

const nodeTypes = {
  'position-logger': PositionLoggerNode,
  custom: CustomNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const handleNodeNameChange = useCallback((nodeId: string, newName: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, label: newName } } : node
        )
      );
    }, [setNodes]);

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
          newNode = {
            id: String(Date.now()),
            type: 'custom',
            position,
            data: { label: `${type} node`, onNameChange: handleNodeNameChange },
          };
        
  
        setNodes((nds) => nds.concat(newNode));
      },
      [setNodes]
    );

    const onNodesDelete = useCallback(
      (deleted) => {
        setEdges(
          deleted.reduce((acc, node) => {
            const incomers = getIncomers(node, nodes, edges);
            const outgoers = getOutgoers(node, nodes, edges);
            const connectedEdges = getConnectedEdges([node], edges);
   
            const remainingEdges = acc.filter(
              (edge) => !connectedEdges.includes(edge),
            );
   
            const createdEdges = incomers.flatMap(({ id: source }) =>
              outgoers.map(({ id: target }) => ({
                id: `${source}->${target}`,
                source,
                target,
              })),
            );
   
            return [...remainingEdges, ...createdEdges];
          }, edges),
        );
      },
      [nodes, edges],
    );

  return (
    <div className="flex h-screen">
      <Sidebar nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges}/>
      <div className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete}
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
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div >
  );
}
