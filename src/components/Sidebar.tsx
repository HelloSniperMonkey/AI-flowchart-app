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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Convert this text to a mermaid diagram and only return the mermaid code: ${code.value}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const graphData = data.candidates[0].content.parts[0].text;
      const result = parseMermaid(graphData);

      const genNodes = result.nodes;
      const genEdges = result.edges;
      setNodes((nodes) => [...nodes, ...genNodes]);
      setEdges((edges) => [...edges, ...genEdges]);
    } catch (error) {
      console.error("Error:", error);
    }
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

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: formValues.input || 'Please provide input'
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      setApiResult(result);

      // Find connected nodes
      const connectedEdges = edges.filter(edge => edge.source === selectedNode.id);
      connectedEdges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode?.data?.label === 'AI-speech Node') {
          setSpeechText(result);
          if (autoTrigger) generateSpeech();
        }
        if (targetNode?.data?.label === 'AI-image Node') {
          setImagePrompt(result);
        }
        if (targetNode?.data?.type === 'ainode') {
          console.log('Setting data for node:', targetNode.data.label);
          Object.entries(targetNode.data).forEach(([key, value]) => {
            if (!['type', 'label', 'url'].includes(key)) {
              setFormValues(prev => ({ ...prev, [key]: result }));
            }
          });
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
    setErrorMessage(null); // Reset error message
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

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail && errorData.detail.status === 'missing_permissions') {
          setErrorMessage('The API key you used is missing the permission text_to_speech to execute this operation.');
        } else {
          setErrorMessage('An error occurred while generating speech.');
        }
        throw new Error('Error generating speech');
      }

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

  const copyToClipboard = () => {
    if (apiResult) {
      navigator.clipboard.writeText(apiResult).then(() => {
        console.log('Copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

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
                {errorMessage && <div className="error-message">{errorMessage}</div>}
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
                  <button onClick={copyToClipboard} className='bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600'>
                    Copy to Clipboard
                  </button>
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