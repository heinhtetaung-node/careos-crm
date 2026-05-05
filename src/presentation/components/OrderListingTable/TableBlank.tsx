import { TableCell, TableRow } from '@material-ui/core';
import React from 'react';

import { Column } from './helper';

type IProp = {
  columnSettings: Column[];
};

function TableBlank({ columnSettings }: IProp) {
  return (
    <TableRow data-testid="table-blank">
      <TableCell className="first-column-placeholder" />
      {columnSettings.map((item: Column) => {
        return <TableCell key={item.id} />;
      })}
    </TableRow>
  );
}

export default TableBlank;
