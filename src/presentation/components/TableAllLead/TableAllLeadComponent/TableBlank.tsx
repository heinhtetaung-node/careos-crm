import { TableCell, TableRow } from '@material-ui/core';
import React from 'react';

import { getString } from 'presentation/theme/localization';

import { Column } from '../TableAllLead.helper';

interface IProp {
  configTable: Column[];
}

const TableBlank: React.FC<IProp> = ({ configTable }) => {
  return (
    <TableRow>
      <TableCell className="first-column-placeholder" />
      {configTable.map((item, index) => {
        if (index === 5) {
          return (
            <TableCell key={index.toString()}>
              {getString('text.noData')}
            </TableCell>
          );
        }
        return <TableCell key={index.toString()} />;
      })}
    </TableRow>
  );
};

export default TableBlank;
