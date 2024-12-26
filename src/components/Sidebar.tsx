import React, { useState } from 'react';
import parseMermaid from '../utils/mermaidParser';
import { request } from 'express';
import { ChevronDown, ChevronRight } from 'lucide-react';
import nodes from '../data/nodes_with_urls.json';
// import dotenv from 'dotenv';

// dotenv.config();

type NodeCategory = {
  name: string;
  items: { type: string; label: string }[];
};

const nodeCategories: NodeCategory[] = [
  {
    name: 'Default Nodes',
    items: nodes,
  },
  {
    name: 'Mermaid Charts',
    items: [
      { type: 'external', label: 'AI image' },
      { type: 'external', label: 'AI speech' },
    ],
  },
];


type SidebarProps = {
  selectedNode: any | null;
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

  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
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
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        Output Node
      </div>
      {nodeCategories.map((category) => (
        <div key={category.name} className="mb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={() => toggleCategory(category.name)}
          >
            <span>{category.name}</span>
            {openCategories[category.name] ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
          {openCategories[category.name] && (
            <div className="mt-2 ml-2 space-y-2 max-h-[60vh] overflow-y-auto">
              {category.items.map((item) => (
                <div
                  key={item.type}
                  className="bg-white p-2 rounded cursor-move shadow-sm hover:shadow-md transition-shadow duration-200"
                  onDragStart={(event) => onDragStart(event, item.type)}
                  draggable
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
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