import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import { AppNode } from './types';

export const initialNodes = [
  {
    id: 'Discord Gateway',
    type: 'group',
    data: { label: 'Discord Gateway' },
    position: { x: 200, y: 0 },
    style: { width: 1000, height: 500 }
  },
  {
    id: 'C',
    type: 'custom',
    position: { x: 100, y: 60 },
    data: { label: 'Authentication (Discord API)' },
    parentId: 'Discord Gateway'
  },
  {
    id: 'B',
    position: { x: 100, y: 120 },
    data: { label: 'B' }, //This node isn't defined, remove or give it a label.
    parentId: 'Discord Gateway'
  },
  {
    id: 'D',
    position: { x: 100, y: 180 },
    data: { label: 'API Token Verification' },
    parentId: 'Discord Gateway'
  },
  {
    id: 'E',
    position: { x: 300, y: 120 },
    data: { label: 'Error Response (Unauthorized)' },
    parentId: 'Discord Gateway'
  },
  {
    id: 'F',
    position: { x: 200, y: 180 },
    data: { label: 'Request Routing' },
    parentId: 'Discord Gateway'
  },
];