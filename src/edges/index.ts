import type { Edge, EdgeTypes } from '@xyflow/react';

export const initialEdges: Edge[] = [
  {
    id: 'B->C',
    source: 'B',
    target: 'C',
    animated: true,
    label: undefined
  },
  {
    id: 'C->D',
    source: 'C',
    target: 'D',
    animated: true,
    label: 'Valid'
  },
  {
    id: 'C->E',
    source: 'C',
    target: 'E',
    animated: true,
    label: 'Invalid'
  },
  {
    id: 'D->F',
    source: 'D',
    target: 'F',
    animated: true,
    label: undefined
  }
];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
