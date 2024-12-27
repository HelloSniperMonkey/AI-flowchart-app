import { useCallback , useEffect , useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type OnEdgesDelete,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  Edge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import Sidebar from './components/Sidebar.tsx';
import CustomNode from './components/CustomNode.tsx';
import { PositionLoggerNode } from './nodes/PositionLoggerNode.tsx';

const nodeTypes = {
  'position-logger': PositionLoggerNode,
  custom: CustomNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((currentEdges) => {
        const targetEdges = currentEdges.filter((edge) => edge.target === params.target);
        const newEdgeNumber = targetEdges.length + 1; // increment based on existing edges
        const newEdge: Edge = {
          ...params,
          label: `Edge ${newEdgeNumber}`,
          animated: true,  // Show data flow animation
          data: { transferEnabled: true }
        };
        return addEdge(newEdge, currentEdges);
      });
    },
    [setEdges]
  );

  const handleNodeClick = useCallback((nodeId: string, nodeType: string, nodeData: any) => {
    setSelectedNode({ id: nodeId, type: nodeType, data: nodeData });
  }, []);

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
          x: 0,
          y: 0,
        };
  
        let newNode;
          newNode = {
            id: String(Date.now()),
            type: 'custom',
            position,
            data: { 
              label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`, 
              onNameChange: handleNodeNameChange,
              onNodeClick: handleNodeClick,
            },
          };
        
  
        setNodes((nds) => nds.concat(newNode));
      },
      [setNodes, handleNodeNameChange, handleNodeClick]
    );

    const onEdgesDelete: OnEdgesDelete = useCallback(
      (edgesToDelete) => {
        setEdges((currentEdges) => {
          // Remove the deleted edges
          let updatedEdges = currentEdges.filter(
            (e) => !edgesToDelete.find((deleted) => deleted.id === e.id)
          );
  
          // Group remaining edges by their target, then renumber
          const edgesByTarget: Record<string, Edge[]> = {};
          for (const e of updatedEdges) {
            edgesByTarget[e.target] = edgesByTarget[e.target] || [];
            edgesByTarget[e.target].push(e);
          }
  
          // Renumber edges in each group
          for (const target in edgesByTarget) {
            edgesByTarget[target].forEach((edge, index) => {
              edge.label = `${index + 1}`;
            });
          }
  
          return [...updatedEdges];
        });
      },
      [setEdges]
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

    const onPaneClick = useCallback(() => {
      setSelectedNode(null);
    }, []);

    const onEdgeDoubleClick = useCallback(
      (event: React.MouseEvent<Element, MouseEvent>, edge: Edge) => {
        event.stopPropagation();
        const newLabel = prompt('Enter new label:', edge.label);
        if (newLabel !== null && newLabel !== edge.label) {
          setEdges((eds) =>
            eds.map((e) => (e.id === edge.id ? { ...e, label: newLabel } : e))
          );
        }
      },
      [setEdges]
    );

    const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode?.type === 'ainode' || sourceNode?.type === 'external') {
        // Transfer data from source to target
        setNodes(nodes.map(node => {
          if (node.id === targetNode?.id) {
            return {
              ...node,
              data: {
                ...node.data,
                input: sourceNode.data?.result || '',  // Use source node's result as input
                previousNode: sourceNode.id
              }
            };
          }
          return node;
        }));
      }
    };

    useEffect(() => {
      // Initialize with a single node
      const initialNode: Node = {
        id: '1',
        type: 'custom',
        data: { 
          label: 'Input Node', 
          onNameChange: handleNodeNameChange,
          onNodeClick: handleNodeClick,
        },
        position: { x: 250, y: 5 },
      };
      setNodes([initialNode]);
    }, [setNodes, handleNodeNameChange, handleNodeClick]);
  

  return (
    <div className="flex h-screen">
      <Sidebar nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} selectedNode={selectedNode}/>
      <div className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onPaneClick={onPaneClick}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onEdgeClick={handleEdgeClick}
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
