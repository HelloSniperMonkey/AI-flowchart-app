import React, { useState, useEffect } from 'react';
import parseMermaid from '../utils/mermaidParser';
import { ChevronDown, ChevronRight } from 'lucide-react';
import nodesdata from '../data/nodes_with_urls.json';
import { usePollinationsImage } from '@pollinations/react';
// import dotenv from 'dotenv';
// dotenv.config();

type NodeCategory = {
  name: string;
  items: { type: string; label: string }[];
};

const nodeCategories: NodeCategory[] = [
  {
    name: 'Mira Flow Nodes',
    items: nodesdata,
  },
  {
    name: 'External Nodes',
    items: [
      { "type": "external", "label": "AI-image", "prompt": "Enter image URL" },
      { "type": "external", "label": "AI-speech", "prompt": "Enter speech" }
  ],
  },
];

const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

type SidebarProps = {
  selectedNode: any | null;
  nodes: NodeType[];
  edges: EdgeType[];
  setNodes: React.Dispatch<React.SetStateAction<NodeType[]>>;
  setEdges: React.Dispatch<React.SetStateAction<EdgeType[]>>;
};

const Sidebar: React.FC<SidebarProps> = ({ selectedNode, nodes, edges, setNodes, setEdges }) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const [apiResult, setApiResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [speechText, setSpeechText] = useState('');
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);

  const [imagePrompt, setImagePrompt] = useState('');
  const imageUrl = usePollinationsImage(imagePrompt, {
    width: 1000,
    height: 1000,
    seed: 0,
    model: 'flux'
  });

  const [autoTrigger, setAutoTrigger] = useState(false);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const graphGenerate = async () => {

    const code = document.getElementById('mermaid-code') as HTMLTextAreaElement;
    const apiUrl = 'https://flow-api.mira.network/v1/flows/flows/bossdad/mermaid-code-generator?version=0.0.2';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "miraauthorization": import.meta.env.VITE_API_KEY
      },
      body: JSON.stringify({ input:{
        input : code.value
      }}),
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

  const transformUrl = (url: string): string => {
    url = url.replace(
      'https://console.mira.network/flows',
      'https://flow-api.mira.network/v1/flows/flows'
    );
    // Split URL by '/'
    const parts = url.split('/');
    
    // Get version from last part
    const version = parts.pop(); // removes x.x.x
    
    // Join remaining parts and add version as query parameter
    return `${parts.join('/')}?Version=${version}`;
  };

  const sendRequest = async () => {
    setLoading(true);
    setApiResult(null);
    const matchingNode = getMatchingNodeData(selectedNode.data.label);
    if (!matchingNode) {
      console.error('No matching node found');
      return;
    }

    const url = matchingNode.url;
    if (!url) {
      console.error('No URL found for node');
      return;
    }
    console.log(import.meta.env.BACKEND_API);
    console.log(transformUrl(url));
    try {
      const response = await fetch(transformUrl(url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'miraauthorization': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({
          input: formValues,
        })
      });
  
      const data = await response.json();
      setApiResult(data.result);

      // Find connected nodes
      const connectedEdges = edges.filter(edge => edge.source === selectedNode.id);
      connectedEdges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode?.data?.label === 'AI-speech Node') {
          setSpeechText(data.result);
          if (autoTrigger) generateSpeech();
        }
        if (targetNode?.data?.label === 'AI-image Node') {
          setImagePrompt(data.result);
        }
      });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Add this function for speech generation
  const generateSpeech = async () => {
    setIsGeneratingSpeech(true);
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLAB_KEY
        },
        body: JSON.stringify({
          text: speechText,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });
  
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  // Add this helper function
  const getMatchingNodeData = (selectedLabel: string) => {
    const firstWord = selectedLabel.split(' ')[0];
    console.log(firstWord.toLowerCase());
    return nodesdata.find(node => node.label.includes(firstWord.toLowerCase()));
  };

  useEffect(() => {
    // If the selected node or its matching data is missing, clear the apiResult
    if (!selectedNode || !getMatchingNodeData(selectedNode.data?.label || '')) {
      setApiResult(null);
    }
  }, [selectedNode]);

  return (
    <aside className="w-64 bg-gray-100 p-4 overflow-y-auto flex flex-col h-full">
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
                  onDragStart={(event) => onDragStart(event, item.label)}
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
        <textarea className='border border-gray-300 rounded px-2 py-1' id='mermaid-code'></textarea>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={graphGenerate}>
          generate graph
        </button>
      </div>
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoTrigger}
            onChange={(e) => setAutoTrigger(e.target.checked)}
          />
          <span>Auto-generate on data receive</span>
        </label>
      </div>
      {selectedNode && (
        <div className="mt-auto">
          <h3 className="text-lg font-semibold mb-2">Node Preview</h3>
          <div className="bg-white p-4 rounded shadow">
            {selectedNode.data?.label === 'AI-speech Node' ? (
              <div className="space-y-2">
                <textarea
                  className="w-full p-2 border rounded"
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  placeholder="Enter text for speech..."
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={generateSpeech}
                  disabled={isGeneratingSpeech}
                >
                  {isGeneratingSpeech ? 'Generating...' : 'Generate Speech'}
                </button>
              </div>
            ) : selectedNode.data?.label === 'AI-image Node' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Enter image prompt..."
                />
                <div className="mt-2">
                  {imagePrompt && !imageUrl && (
                    <LoadingSpinner />
                  )}
                  {imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt="Generated" 
                      className="w-full rounded-lg shadow-lg"
                    />
                  )}
                </div>
              </div>
            ) : selectedNode.data?.label && (() => {
              const matchingNode = getMatchingNodeData(selectedNode.data.label);
              return matchingNode ? (
                <>
                  <p><strong>Type:</strong> {matchingNode.type}</p>
                  <p><strong>Label:</strong> {matchingNode.label}</p>
                  <p><strong>URL:</strong> {matchingNode.url}</p>
                  {Object.entries(matchingNode).map(([key, value]) => {
                    if (!['type', 'label', 'url'].includes(key)) {
                      return (
                        <p key={key}>
                          <strong>{key.replace('_', ' ').charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                          <input
                            className="border border-gray-300 rounded px-2 py-1"
                            type="text"
                            value={formValues[key] ?? value ?? ''}
                            onChange={e => setFormValues(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        </p>
                      );
                    }
                    return null;
                  })}
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={sendRequest}>send</button>
                </>
              ) : (
                <p>No matching node found</p>
              );
            })()}
          </div>
          {selectedNode && getMatchingNodeData(selectedNode.data?.label || '') && (
            <>
              {loading ? (
                <p>Loading...</p>
              ) : apiResult ? (
                <div className="p-2 border mb-2">
                  <strong>Response:</strong> {apiResult}
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;