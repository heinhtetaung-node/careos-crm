import React, { useCallback } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import Column from './Column';
import { CustomComponentProps, DragAndDropPayload, moveRow } from './helper';

function DragAndDropList({
  columnData,
  handleColumnData,
  CustomComponent,
}: {
  columnData: DragAndDropPayload[];
  handleColumnData: (payload: DragAndDropPayload[]) => void;
  CustomComponent?: React.FC<CustomComponentProps>;
}) {
  const onDragEnd = useCallback(
    (result: any) => {
      const { source, destination } = result;

      if (!destination) return;
      if (source.droppableId === destination.droppableId) return;

      const sourceColumnIndex = columnData.findIndex(
        (column: DragAndDropPayload) => column.columnId === source.droppableId
      );
      const destinationColumnIndex = columnData.findIndex(
        (column: DragAndDropPayload) =>
          column.columnId === destination.droppableId
      );

      if (sourceColumnIndex !== destinationColumnIndex) {
        const { updatedSourceColumn, updatedDestinationColumn } = moveRow(
          columnData,
          source.index,
          sourceColumnIndex,
          destinationColumnIndex
        );

        const updatedColumn = columnData.map(
          (column: DragAndDropPayload, index: number) => {
            if (index === sourceColumnIndex) {
              return updatedSourceColumn;
            }
            if (index === destinationColumnIndex) {
              return updatedDestinationColumn;
            }
            return column;
          }
        );

        handleColumnData(updatedColumn);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnData]
  );
  return (
    <div data-testid="drag-and-drop-main">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex w-full justify-end">
          {columnData.map((column) => (
            <Droppable key={column.columnId} droppableId={column.columnId}>
              {(provided: any) => (
                <Column
                  key={column.columnId}
                  column={column}
                  columnData={columnData}
                  handleColumnData={handleColumnData}
                  CustomComponent={CustomComponent}
                  provided={provided}
                />
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default DragAndDropList;
