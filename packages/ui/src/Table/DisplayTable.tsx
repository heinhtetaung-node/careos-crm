import clsx from 'clsx';
import React, { useMemo } from 'react';

import Header from './Header';
import Row from './Row';

export interface ColumConfig<DataType> {
  title: string;
  dataIndex?: string;
  key: string;
  width?: number | string;
  className?: string;
  render?: (data: DataType) => React.ReactNode;
}

export type Data = {
  width?: string | number;
  colspan?: string[];
  className?: string;
  key: string;
};

export type CellExtraData = {
  [key: string]: {
    width?: string;
  };
};

export enum GapType {
  small = 'small',
  medium = '1',
  big = 'big',
}

type DisplayTableProps<T extends Data> = {
  gap?: boolean | GapType;
  data: T[];
  tableConfig: ColumConfig<T>[];
  selectionType?: 'checkbox' | 'radio' | 'none';
  selectedDataKey: string | string[];
  loading?: boolean;
  onSelect: (data: T) => void;
  noHeader?: boolean;
};

function DisplayTable<T extends Data>({
  gap,
  data,
  tableConfig,
  selectedDataKey,
  onSelect,
  loading,
  selectionType = 'none',
  noHeader,
}: DisplayTableProps<T>) {
  const isSelected = (key: string) => {
    if (typeof selectedDataKey === 'string') {
      return key === selectedDataKey;
    }
    return selectedDataKey.includes(key);
  };

  const gapTransform = useMemo(() => {
    if (!gap) return '';
    if (gap === GapType.big) return 'gap-2';
    if (gap === GapType.small) return 'gap-0.5';
    return 'gap-1';
  }, [gap]);

  const getTableConfigFilter = (x: Data) => {
    const tableConfigFilter: ColumConfig<T>[] = [];
    if (x.colspan !== undefined && x.colspan.length > 1) {
      tableConfig.forEach((config) => {
        if (x.colspan?.includes(config.key) && config.key !== x.colspan[0]) {
          return;
        }
        tableConfigFilter.push(config);
      });
      return tableConfigFilter;
    }
    return tableConfig;
  };

  return (
    <div className={clsx('w-full')}>
      <div className={`flex w-full ${gapTransform}`}>
        {!noHeader &&
          tableConfig.map((config) => (
            <Header
              key={config.key}
              text={config.title}
              width={config.width}
              className={config.className}
            />
          ))}
      </div>
      {loading ? (
        <div
          role="status"
          className="animate-pulse w-full"
          data-testid="table-loading"
        >
          <div className="h-5 w-full bg-muted-light rounded my-2" />
          <div className="h-5 w-full bg-muted-light rounded my-2" />
          <div className="h-5 w-full bg-muted-light rounded my-2" />
        </div>
      ) : (
        <div className={`flex flex-col ${gapTransform}`}>
          {data.map((x) => (
            <Row
              key={x.key}
              tableConfig={getTableConfigFilter(x)}
              data={x}
              gap={gapTransform}
              selectionType={selectionType}
              className={x.className}
              isSelected={isSelected(x.key)}
              onClick={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DisplayTable;
