interface Node {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
  type: string;
  parentId?: string;
  extent?: string;
  style?: { width: number; height: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  label?: string;
}

interface MermaidParseResult {
  nodes: Node[];
  edges: Edge[];
}

interface NodeWithLevel {
  id: string;
  level: number;
  children: Set<string>;
  parent?: string;
}

export default function parseMermaid(code: string): MermaidParseResult {
  const lines = code.split('\n').map(line => line.trim()).filter(line => line);
  const nodes = new Map<string, Node>();
  const edges: Edge[] = [];
  const nodeRelations = new Map<string, NodeWithLevel>();
  let currentSubgraph: string | null = null;

  const getBaseName = (name: string) => name.split(/[\(\[\{]/)[0].trim();

  const calculateNodePositions = () => {
    // First, calculate levels for all nodes
    const processedNodes = new Set<string>();
    const queue: string[] = [];

    // Find root nodes (nodes with no parents in edges)
    const childNodes = new Set(edges.map(edge => edge.target));
    const rootNodes = Array.from(nodes.keys()).filter(
      nodeId => !childNodes.has(nodeId) && nodes.get(nodeId)?.type !== 'group'
    );

    // Initialize root nodes with level 0
    rootNodes.forEach(rootId => {
      nodeRelations.set(rootId, {
        id: rootId,
        level: 0,
        children: new Set()
      });
      queue.push(rootId);
    });

    // BFS to assign levels and track parent-child relationships
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (processedNodes.has(currentId)) continue;
      processedNodes.add(currentId);

      const currentNode = nodeRelations.get(currentId)!;
      const currentLevel = currentNode.level;

      // Find children through edges
      edges
        .filter(edge => edge.source === currentId)
        .forEach(edge => {
          const childId = edge.target;
          currentNode.children.add(childId);
          
          if (!nodeRelations.has(childId)) {
            nodeRelations.set(childId, {
              id: childId,
              level: currentLevel + 1,
              children: new Set(),
              parent: currentId
            });
          }
          queue.push(childId);
        });
    }

    // Calculate positions based on levels
    const LEVEL_HEIGHT = 150;
    const NODE_WIDTH = 200;
    const SUBGRAPH_PADDING = 40; // Padding inside subgraphs
    const levelWidths = new Map<number, number>();

    // Count nodes at each level
    nodeRelations.forEach((node) => {
      levelWidths.set(
        node.level,
        (levelWidths.get(node.level) || 0) + 1
      );
    });

    // Position nodes
    nodeRelations.forEach((nodeRelation, nodeId) => {
      const node = nodes.get(nodeId);
      if (!node) return;

      const levelWidth = levelWidths.get(nodeRelation.level) || 1;
      const nodesAtLevel = Array.from(nodeRelations.values())
        .filter(n => n.level === nodeRelation.level)
        .sort((a, b) => a.id.localeCompare(b.id));
      
      const nodeIndex = nodesAtLevel.findIndex(n => n.id === nodeId);
      
      // Calculate x position to center nodes at each level
      const totalWidth = (levelWidth - 1) * NODE_WIDTH;
      const startX = -totalWidth / 2;
      
      node.position = {
        x: startX + (nodeIndex * NODE_WIDTH),
        y: nodeRelation.level * LEVEL_HEIGHT
      };
    });

    // Calculate subgraph dimensions based on contained nodes
    const calculateSubgraphDimensions = (subgraphId: string) => {
      const childNodes = Array.from(nodes.values())
        .filter(n => n.parentId === subgraphId);
      
      if (childNodes.length === 0) {
        return {
          x: 0,
          y: 0,
          width: NODE_WIDTH + 2 * SUBGRAPH_PADDING,
          height: LEVEL_HEIGHT + 2 * SUBGRAPH_PADDING
        };
      }

      const childPositions = childNodes.map(n => n.position);
      const minX = Math.min(...childPositions.map(p => p.x));
      const maxX = Math.max(...childPositions.map(p => p.x));
      const minY = Math.min(...childPositions.map(p => p.y));
      const maxY = Math.max(...childPositions.map(p => p.y));

      // Calculate dimensions with padding
      return {
        x: minX - SUBGRAPH_PADDING,
        y: minY - SUBGRAPH_PADDING,
        width: maxX - minX + NODE_WIDTH + 2 * SUBGRAPH_PADDING,
        height: maxY - minY + LEVEL_HEIGHT + 2 * SUBGRAPH_PADDING
      };
    };

    // Position and size subgraphs
    nodes.forEach((node) => {
      if (node.type === 'group') {
        const dimensions = calculateSubgraphDimensions(node.id);
        
        node.position = {
          x: dimensions.x,
          y: dimensions.y
        };
        
        node.style = {
          width: dimensions.width,
          height: dimensions.height
        };
      }
    });
  };

  const getNodeId = (label: string, parentId: string | null = null): string => {
    const baseName = getBaseName(label);
    if (!nodes.has(baseName)) {
      const id = baseName;
      nodes.set(baseName, {
        id,
        type: 'custom',
        position: { x: 0, y: 0 }, // Initial position, will be updated later
        data: { label: baseName },
        ...(parentId && {
          parentId,
          extent: 'parent'
        })
      });
    }
    return nodes.get(baseName)!.id;
  };

  const handleEdge = (source: string, target: string, label?: string) => {
    const sourceId = getNodeId(source, currentSubgraph);
    const targetId = getNodeId(target, currentSubgraph);

    edges.push({
      id: `${sourceId}->${targetId}`,
      source: sourceId,
      target: targetId,
      animated: true,
      label: label || undefined
    });
  };

  // Parse the Mermaid code
  lines.forEach(line => {
    // Handle subgraph
    const subgraphMatch = line.match(/subgraph\s+([^\n]+)/);
    if (subgraphMatch) {
      const [, title] = subgraphMatch;
      currentSubgraph = title.trim();
      nodes.set(currentSubgraph, {
        id: currentSubgraph,
        type: 'group',
        data: { label: title },
        position: { x: 0, y: 0 }, // Initial position, will be calculated later
        style: {
          width: 0,  // Initial width, will be calculated later
          height: 0, // Initial height, will be calculated later
        }
      });
      return;
    }

    if (line === 'end') {
      currentSubgraph = null;
      return;
    }

    // Handle node definitions
    const nodeMatch = line.match(/([^[\s]+)[\[\(\{](.*?)[\]\)\}]/);
    if (nodeMatch) {
      const [, id, label] = nodeMatch;
      const baseName = getBaseName(id);
      getNodeId(baseName, currentSubgraph);
      nodes.get(baseName)!.data.label = label || baseName;
      if (currentSubgraph) {
        nodes.get(baseName)!.parentId = currentSubgraph;
        nodes.get(baseName)!.extent = 'parent';
      }
    }

    // Handle text edges (A -- text --> B)
    const textEdgeMatch = line.match(/([^-\s]+)\s*--\s*([^->\s]+)\s*-->\s*([^-\s]+)/);
    if (textEdgeMatch) {
      const [, source, label, target] = textEdgeMatch;
      handleEdge(source, target, label);
      return;
    }

    // Handle standard edges (A-->B or A-->|text|B)
    const arrowMatch = line.match(/([^-|>\s]+)\s*--?>(?:\|([^|]+)\|)?\s*([^-|>\s]+)/);
    if (arrowMatch) {
      const [, source, label, target] = arrowMatch;
      handleEdge(source, target, label);
    }
  });

  // Calculate final positions
  calculateNodePositions();

  return {
    nodes: Array.from(nodes.values()),
    edges
  };
}