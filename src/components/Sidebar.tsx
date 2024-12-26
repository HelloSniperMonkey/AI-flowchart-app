import React from 'react';
import parseMermaid from '../utils/mermaidParser';
import { request } from 'express';
// import dotenv from 'dotenv';

// dotenv.config();

type SidebarProps = {
  nodes: NodeType[];
  edges: EdgeType[];
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;
  setEdges: React.Dispatch<React.SetStateAction<EdgeType[]>>;
};

const Sidebar: React.FC<SidebarProps> = ({ nodes, edges, setNodes, setEdges }) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const graphGenerate = async () => {

    const code = document.getElementById('mermaid-code') as HTMLTextAreaElement;
    const apiUrl = 'http://localhost:5001/api/process';
    // if (!apiUrl) {
    //   console.error("BACKEND_API is not defined");
    //   return;
    // }
    // console.log(process.env.BACKEND_API);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: code.value }),
    });
    const graph = response.json().then((data) => {
      console.log(data.result)
      const graphData = data.result;
      const result = parseMermaid(graphData);
      console.log(result.nodes, result.edges);
      const genNodes = result.nodes;
      const genEdges = result.edges;
      setNodes((nodes) => [...nodes, ...genNodes]);
      setEdges((edges) => [...edges, ...genEdges]);
    }).catch((error) => {
      console.error("Error:", error);
    });
  }
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-4">Add Node</h2>
      <div
        className="bg-white p-2 mb-2 rounded cursor-move"
        onDragStart={(event) => onDragStart(event, 'input')}
        draggable
      >
        Input Node
      </div>
      <div
        className="bg-white p-2 mb-2 rounded cursor-move"
        onDragStart={(event) => onDragStart(event, 'default')}
        draggable
      >
        Default Node
      </div>
      <div
        className="bg-white p-2 mb-2 rounded cursor-move"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        Output Node
      </div>
      <div
        className="bg-white p-2 mb-2 rounded cursor-move"
      >
        <textarea className='bg-lime-100' id='mermaid-code'></textarea>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={graphGenerate}>
          generate graph
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;