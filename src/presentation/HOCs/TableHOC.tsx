/* eslint-disable react/destructuring-assignment */
import { TableCell } from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';

import { getString } from 'presentation/theme/localization';

import {
  IColumn,
  renewalColumns,
  newColumns,
  retainerColumns,
  overflowColumns,
} from './TableHOC.helper';

import { capitalizeFirstLetter } from '../../shared/helper/utilities';

interface ITableType {
  tableType: string;
}

interface ITableComponentType {
  table: any;
  tableTitle: string;
  tableType?: string;
  tableRenderRows: any;
}

function table(Component: React.ComponentType<any>, tableType: ITableType) {
  function WrappedComponent(props: ITableComponentType) {
    const [columns, setColumns] = useState<IColumn[]>([]);
    useEffect(() => {
      if (tableType.tableType === 'overflow') {
        setColumns(overflowColumns);
      }
      if (props.tableType === 'renewal') {
        setColumns(renewalColumns);
      }
      if (props.tableType === 'new') {
        setColumns(newColumns);
      }
      if (props.tableType === 'retainer') {
        setColumns(retainerColumns);
      }
    }, [props.tableType]);
    const renderColumns = () => {
      return columns.map((item: IColumn) => {
        if (tableType.tableType === 'overflow') {
          return (
            <Fragment key={item.title}>
              <TableCell>
                {getString(`text.${item.localisationKey}`, {
                  role: item.role,
                })}
              </TableCell>
            </Fragment>
          );
        }
        return (
          <Fragment key={item.title}>
            <TableCell className="table-cell">
              {capitalizeFirstLetter(getString(item.title))}
            </TableCell>
          </Fragment>
        );
      });
    };
    return <Component {...props} columns={renderColumns()} />;
  }
  return WrappedComponent;
}
export default table;
