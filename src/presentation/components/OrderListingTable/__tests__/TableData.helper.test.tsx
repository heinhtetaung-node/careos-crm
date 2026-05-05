import { TableCell } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import React from 'react';

import { Addons } from 'shared/types/addons';

import { getAddonsTextByPackage, Order } from '../helper';
import { TableCellContent } from '../index.styles';
import StatusTag from '../StatusTag';
import {
  showCell,
  showStatusTag,
  showArrow,
  showIsChecked,
} from '../TableData';
import TextStatus from '../TextStatus';

test('Test showStatusTag run well in case 1st', () => {
  const input = {
    products: [{ isCancelled: true }],
  };
  expect(showStatusTag(input)).toEqual(<StatusTag text="text.cancelled" />);
});

test('Test showStatusTag run well in case 2nd', () => {
  const input = null;
  expect(showStatusTag(input)).toEqual('');
});

test('Test showIsChecked run well in case 1st', () => {
  const listCheckBox = ['a', 'b'];
  const order = { id: 'c' };
  expect(showIsChecked(listCheckBox, order.id)).toBeFalsy();
});

test('Test showIsChecked run well in case 2nd', () => {
  const listCheckBox = ['a', 'b'];
  const order = { id: 'b' };
  expect(showIsChecked(listCheckBox, order.id)).toBeTruthy();
});

test('Test showIsChecked run well for selecting order and policies', () => {
  const listCheckBox = ['orders/xyz/items/a', 'orders/mc/items/b'];
  const order = { id: 'xyz' };
  expect(showIsChecked(listCheckBox, order.id, 1, true)).toBeTruthy();
});

test('Test showCell run well in case 1st', () => {
  const input = {
    order: {
      approvalStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
      customer: 'Puitest E. Sricherng',
      documentsStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
      id: 'orders/8025f39c-9e6b-4912-8a45-979031a70178',
      orderId: 'O158',
      products: [],
      qcStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
      submissionStatus: {
        label: 'Unassigned',
        status: 'warning',
        type: 'text',
      },
      discount: 10,
      insuranceCompany: 'Allianz C.P.',
    } as unknown as Order,
    column: {
      id: 'leadSource',
      label: 'text.leadSource',
    },
  };

  const result = null;
  expect(showCell(input)).not.toEqual(result);
});

test('Test showCell run well in case 2nd', () => {
  const input = {
    order: {
      approvalStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
      customer: 'Puitest E. Sricherng',
      documentsStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
      id: 'orders/8025f39c-9e6b-4912-8a45-979031a70178',
      orderId: 'O158',
      products: [{ isCancelled: false }],
      qcStatus: undefined,
      submissionStatus: {
        label: 'Unassigned',
        status: 'warning',
        type: 'text',
      },
    } as unknown as Order,
    column: {
      id: 'orderId',
      label: 'text.orderId',
    },
  };

  const result = (
    <TableCell
      style={{ maxWidth: 'fit-content' }}
      key={input.column.id}
      align={undefined}
    >
      <TableCellContent>
        {input.order.orderId}
        {showStatusTag(input.order)}
      </TableCellContent>
    </TableCell>
  );
  expect(JSON.stringify(showCell(input))).toEqual(JSON.stringify(result));
});

test('Test showCell displays submission status', () => {
  const input = {
    order: {
      approvalStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
      customer: 'Puitest E. Sricherng',
      documentsStatus: { label: 'Unassigned', status: 'warning', type: 'text' },
      id: 'orders/8025f39c-9e6b-4912-8a45-979031a70178',
      orderId: 'O158',
      products: [{ isCancelled: false, productType: 'mandatory' }],
      qcStatus: undefined,
      submissionStatus: {
        label: 'Unassigned',
        status: 'warning',
        type: 'text',
      },
    } as unknown as Order,
    column: {
      id: 'submissionStatus',
      label: 'text.submissionStatus',
    },
  };

  const result = (
    <TableCell
      data-testid="order-listing-table-column"
      style={{ maxWidth: 'fit-content' }}
      key={input.column.id}
    >
      <TextStatus
        status="warning"
        label="Unassigned"
        type="text"
        tableType="order"
      />
    </TableCell>
  );
  expect(JSON.stringify(showCell(input))).toEqual(JSON.stringify(result));
});

test('Test showArrow run well with truthy open input', () => {
  expect(showArrow(true)).toEqual(<KeyboardArrowDownIcon color="primary" />);
});

test('Test showArrow run well with falsy open input', () => {
  expect(showArrow(false)).toEqual(<KeyboardArrowRightIcon color="primary" />);
});

test('Shoud getAddonsTextByPackage return correct translation', () => {
  expect(getAddonsTextByPackage(Addons.CAR_REPLACEMENT)).toEqual(
    'order.addOns.carReplacement'
  );
  expect(getAddonsTextByPackage(Addons.ASSET)).toEqual(
    'order.addOns.carAssetCoverage'
  );
  expect(getAddonsTextByPackage(Addons.ROADSIDE_ASSISTANCE)).toEqual(
    'order.addOns.roadSideAssistance'
  );
  expect(getAddonsTextByPackage('packages/1362845')).toEqual('');
});
