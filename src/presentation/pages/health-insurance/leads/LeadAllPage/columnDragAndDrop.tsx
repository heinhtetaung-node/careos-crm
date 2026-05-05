import React, { useCallback, useEffect, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@alphafounders/ui';
import { ChevronLeftOutlined, ChevronRightOutlined } from '@material-ui/icons';
import { camelCase, startCase } from 'lodash';
import { getString } from 'presentation/theme/localization';
import { Column } from 'presentation/hooks/useTableList';

interface SortableItemProps {
  id: string;
  label?: string | React.JSX.Element;
  selectedItem: Column | null;
  handleSelect: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  label,
  selectedItem,
  handleSelect,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: 'white',
    border: `2px solid ${selectedItem?.id === id ? '#005098' : 'white'}`,
    cursor: 'pointer',
    pointerEvents: 'auto',
  };

  const handleClick = useCallback(() => {
    handleSelect(id);
  }, [handleSelect, id]);

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      onPointerUp={handleClick}
      {...attributes}
      {...listeners}
      className="p-2 py-4 bg-gray-200 rounded shadow-lg mb-1"
    >
      {label}
    </div>
  );
};

interface DragAndSortProps {
  columns: Column[];
  activeColumns: Column[];
  handleSetActiveColumns: (cols: Column[]) => void;
}

const DragAndSort: React.FC<DragAndSortProps> = ({
  columns,
  activeColumns,
  handleSetActiveColumns,
}) => {
  const [availableColumns, setAvailableColumns] = useState(columns);
  const [selectedColumns, setSelectedColumns] =
    useState<Column[]>(activeColumns);
  const [selectedItem, setSelectedItem] = useState<Column | null>(null);

  const handleSelect = (id: string) => {
    setSelectedItem((prev) =>
      prev?.id === id
        ? null
        : availableColumns.find((col) => col.id === id) ||
          selectedColumns.find((col) => col.id === id) ||
          null
    );
  };

  const handleMoveRight = () => {
    if (selectedItem && availableColumns.includes(selectedItem)) {
      setAvailableColumns((prev) => prev.filter((col) => col !== selectedItem));
      setSelectedColumns((prev) => [...prev, selectedItem]);
      setSelectedItem(null);
    }
  };

  const handleMoveLeft = () => {
    if (selectedItem && selectedColumns.includes(selectedItem)) {
      setSelectedColumns((prev) => prev.filter((col) => col !== selectedItem));
      setAvailableColumns((prev) => [selectedItem, ...prev]);
      setSelectedItem(null);
    }
  };

  const handleSortEnd = ({ active, over }: any) => {
    if (!over || active.id === over.id) return;

    setSelectedColumns((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };
  useEffect(() => {
    handleSetActiveColumns(selectedColumns);
  }, [selectedColumns]);

  return (
    <div className="flex space-x-6 items-center">
      {/* All Columns Section */}
      <div className="flex-1">
        <h3 className="mb-4 font-bold">
          {getString('healthLead.settingAllColumns')}
        </h3>
        <div className="p-2 h-[280px] max-h-[300px] overflow-y-auto bg-slate-100">
          {availableColumns.map((col) => (
            <SortableItem
              key={col.id}
              id={col.id}
              label={col?.label}
              selectedItem={selectedItem}
              handleSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Move Buttons Section */}
      <div className="flex flex-col justify-center space-y-2">
        <Button
          onClick={handleMoveRight}
          className={`p-2 ${selectedItem && availableColumns.includes(selectedItem) ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!selectedItem || !availableColumns.includes(selectedItem)}
          icon={<ChevronRightOutlined />}
          text=""
          rounded
        />
        <Button
          onClick={handleMoveLeft}
          className={`p-2 ${selectedItem && selectedColumns.includes(selectedItem) ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!selectedItem || !selectedColumns.includes(selectedItem)}
          icon={<ChevronLeftOutlined />}
          text=""
          rounded
        />
      </div>

      {/* Active Columns Section */}
      <div className="flex-1">
        <h3 className="mb-4 font-bold">
          {getString('healthLead.settingActiveColumns')}
        </h3>
        <div className="p-2 h-[280px] max-h-[300px] overflow-y-auto overflow-x-hidden bg-slate-100">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleSortEnd}
          >
            <SortableContext
              id="active"
              items={selectedColumns}
              strategy={verticalListSortingStrategy}
            >
              {selectedColumns.map((col) => (
                <SortableItem
                  key={col.id}
                  id={col.id}
                  label={col?.label}
                  selectedItem={selectedItem}
                  handleSelect={handleSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default DragAndSort;
