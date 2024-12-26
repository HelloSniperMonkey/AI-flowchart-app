import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

const handleStyleT = { 
  width: 10, 
  height: 10, 
  background: '#ee0000',
  border: '1px solid #fff',
  borderRadius: '50%',
  zIndex: 1,
};

const handleStyle = { 
  width: 10, 
  height: 10, 
  background: '#1a192b',
  border: '1px solid #fff',
  borderRadius: '50%',
  zIndex: 1,
};

const CustomNode = ({ data, isConnectable, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState(data.label);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(event.target.value);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditing(false);
      data.onNameChange(id, nodeName);
    }
  }, [id, nodeName, data]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    data.onNameChange(id, nodeName);
  }, [id, nodeName, data]);

  return (
    <div 
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400"
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="t"
        style={{ ...handleStyleT, top: -5, left: '50%' }}
        isConnectable={isConnectable}
      />
      {/* <Handle
        type="target"
        position={Position.Right}
        id="r"
        style={{ ...handleStyle, right: -5, top: '50%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="b"
        style={{ ...handleStyle, bottom: -5, left: '50%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="l"
        style={{ ...handleStyle, left: -5, top: '50%' }}
        isConnectable={isConnectable}
      /> */}
      {isEditing ? (
        <input
          type="text"
          value={nodeName}
          onChange={handleNameChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="font-bold w-full text-center bg-transparent outline-none"
          autoFocus
        />
      ) : (
        <div className="font-bold text-center">{nodeName}</div>
      )}
      {/* <Handle
        type="source"
        position={Position.Top}
        id="t"
        style={{ ...handleStyle, top: -5, left: '50%' }}
        isConnectable={isConnectable}
      /> */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ ...handleStyle, bottom: -5, left: '50%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="r"
        style={{ ...handleStyle, right: -5, top: '50%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="l"
        style={{ ...handleStyle, left: -5, top: '50%' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(CustomNode);

