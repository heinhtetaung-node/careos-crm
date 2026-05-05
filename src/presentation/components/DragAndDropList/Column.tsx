import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { getString } from 'presentation/theme/localization';

import { CustomComponentProps, DragAndDropPayload, moveRow } from './helper';

function Column({
  column,
  columnData,
  handleColumnData,
  provided,
  CustomComponent,
}: {
  column: DragAndDropPayload;
  columnData: DragAndDropPayload[];
  handleColumnData: (payload: DragAndDropPayload[]) => void;
  provided: any;
  CustomComponent?: React.FC<CustomComponentProps>;
}) {
  const moveCell = (index: number, columnId: string) => {
    const sourceIndex = columnId === '1' ? 0 : 1;
    const destinationIndex = columnId === '1' ? 1 : 0;
    const { updatedSourceColumn, updatedDestinationColumn } = moveRow(
      columnData,
      index,
      sourceIndex,
      destinationIndex
    );

    const updateadColumnData = columnData.map(
      (_column: DragAndDropPayload, _index: number) => {
        if (_index === sourceIndex) {
          return updatedSourceColumn;
        }
        if (_index === destinationIndex) {
          return updatedDestinationColumn;
        }
        return _column;
      }
    );

    handleColumnData(updateadColumnData);
  };

  return (
    <div
      {...provided.droppableProps}
      ref={provided.innerRef}
      className="flex flex-col w-1/3"
    >
      {column?.rows?.length > 0 ? (
        column?.rows?.map((row, index) => (
          <Draggable key={row.id} index={index} draggableId={row.id}>
            {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
            {(provided: any) => (
              <div className="p-2 border border-muted border-solid table-cell">
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {CustomComponent ? (
                    <CustomComponent
                      index={index}
                      data={row}
                      columnId={column?.columnId}
                      moveCell={moveCell}
                    />
                  ) : (
                    <span className="ml-10 mr-10">{row?.humanId}</span>
                  )}
                </div>
              </div>
            )}
          </Draggable>
        ))
      ) : (
        <div className="text-center flex flex-col items-center justify-center h-full border-0 border-muted border-solid border-s-[1px]">
          <img
            src="/static/rabbitcare-mascot-icon.png"
            alt="RabbitcareMascotIcon"
          />
          <span className="text-center">{getString('text.noData')}</span>
        </div>
      )}
    </div>
  );
}

export default Column;
