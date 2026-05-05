export interface DragAndDropPayload {
  columnId: '1' | '2';
  rows: Record<string, any>[];
}

export interface CustomComponentProps {
  index: number;
  data: Record<string, string>;
  columnId: '1' | '2';
  moveCell: (index: number, columnId: string) => void;
}

export const moveRow = (
  columnData: DragAndDropPayload[],
  index: number,
  sourceColumnIndex: number,
  destinationColumnIndex: number
) => {
  const sourceColumn = columnData[sourceColumnIndex] || [];
  const destinationColumn = columnData[destinationColumnIndex] || [];

  const sourceRow = Array.from(sourceColumn.rows);
  const removed = sourceRow[index];

  const destinationRow = Array.from(destinationColumn.rows);

  const updatedSourceColumn = {
    ...sourceColumn,
    rows: sourceRow.filter((row, _index) => _index !== index),
  };
  const updatedDestinationColumn = {
    ...destinationColumn,
    rows: [...destinationRow, removed],
  };

  return { updatedSourceColumn, updatedDestinationColumn };
};
