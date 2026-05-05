import { TableCell, TableRow } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useMemo } from 'react';

interface IProps {
  row: number;
  column: number;
  testId?: string;
}

export default function SkeletonTableRow({ row, column, testId }: IProps) {
  const renderLoaderTable = useMemo(() => {
    let countRow = 0;
    const loaderTable = [];
    while (countRow < row) {
      let countColumn = 0;
      const tableColumns = [];
      while (countColumn < column) {
        tableColumns.push(
          <TableCell key={countColumn}>
            <Skeleton animation="wave" data-testid={testId} />
          </TableCell>
        );
        countColumn += 1;
      }
      loaderTable.push(<TableRow key={countRow}>{tableColumns}</TableRow>);
      countRow += 1;
    }
    return loaderTable;
  }, [row, column]);

  return <>{renderLoaderTable}</>;
}
