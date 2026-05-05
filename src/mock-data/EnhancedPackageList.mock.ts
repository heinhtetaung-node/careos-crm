export const COLUMN_DEFINITIONS = [
  { id: 'package-name', className: 'w-[250px]' },
  { id: 'insurance-type', className: 'w-[140px]' },
  { id: 'repair-type', className: 'w-[100px]' },
  { id: 'sub-model', className: 'w-[200px]' },
  { id: 'coverage', className: 'w-[150px]' },
  { id: 'deductible', className: 'w-[80px]' },
  { id: 'price', className: 'w-[150px]' },
] as const;

export const skeletonRows = [
  'sk-0',
  'sk-1',
  'sk-2',
  'sk-3',
  'sk-4',
  'sk-5',
  'sk-6',
  'sk-7',
  'sk-8',
];

export const COLUMN_CLASSES = COLUMN_DEFINITIONS.map(
  (column) => column.className
) as readonly string[];
