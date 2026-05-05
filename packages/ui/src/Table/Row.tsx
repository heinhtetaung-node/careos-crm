import clsx from 'clsx';
import _get from 'lodash/get';
import React from 'react';

import Cell from './Cell';
import { CellExtraData, ColumConfig, Data } from './DisplayTable';
import { twMerge } from 'tailwind-merge';

interface RowProps<T extends Data> {
  gap?: string;
  tableConfig: ColumConfig<T>[];
  data: T;
  isSelected: boolean;
  onClick: (data: T) => void;
  selectionType?: 'none' | 'checkbox' | 'radio';
  className?: string;
}

function Row<T extends Data>({
  gap,
  tableConfig,
  data,
  isSelected,
  onClick,
  selectionType = 'none',
  className,
}: RowProps<T>) {
  const getWidth = (config: ColumConfig<T>): string => {
    const dynamicData = data as CellExtraData;
    if (dynamicData[config.key]?.width)
      return dynamicData[config.key]?.width as string;
    return config.width as string;
  };

  return (
    <div
      className={`flex cursor-pointer ${gap}`}
      onClickCapture={() => onClick(data)}
      data-testid="display-table-row"
    >
      {tableConfig.map((config, i) => (
        <Cell
          key={config.key}
          content={
            config.render
              ? config.render(data)
              : (_get(data, config.dataIndex ?? '', null) as React.ReactNode)
          }
          width={getWidth(config)}
          selectionType={i === 0 ? selectionType : 'none'}
          className={twMerge(
            clsx({
              'border-solid border-0 border-l-2 border-success':
                i === 0 && isSelected,
            }),
            className
          )}
          isSelected={isSelected}
        />
      ))}
    </div>
  );
}

export default Row;
