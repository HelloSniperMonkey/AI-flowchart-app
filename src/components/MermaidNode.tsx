'use client'

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Handle, Position, NodeProps } from '@xyflow/react';

const handleStyle = { 
  width: 10, 
  height: 10, 
  background: '#1a192b',
  border: '1px solid #fff',
  borderRadius: '50%',
  zIndex: 1,
};

const MermaidNode = ({ data }: NodeProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nodeRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.run({
        nodes: [nodeRef.current]
      });
    }
  }, [data.chart]);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, top: -5, left: '50%' }}
      />
      <div ref={nodeRef} className="mermaid">
        {data.chart}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, bottom: -5, left: '50%' }}
      />
    </div>
  );
};

export default MermaidNode;

