import { Column } from 'presentation/components/OrderListingTable/helper';

import sortParams, { handleReset, modifyQueryWithFilter } from './table.helper';

const mockSetState = jest.fn();
const columnSettings = [
  {
    id: 'orderId',
    minWidth: 100,
    label: 'leadDetailFields.orderId',
  },
  {
    id: 'earliestPolicyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
    sortingField: 'attributes.earliestPolicyStartDate',
    sorting: 'none',
  },
];

const ascColumnSettings = [
  columnSettings[0],
  {
    id: 'earliestPolicyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
    sortingField: 'attributes.earliestPolicyStartDate',
    sorting: 'asc',
  },
];

test('Should sorting asc with columnId', () => {
  const sorting = sortParams(
    'earliestPolicyStartDate',
    mockSetState,
    columnSettings as Column[]
  );

  expect(sorting).toBe('order_by=attributes.earliestPolicyStartDate');
});

test('Should sorting asc without columnId', () => {
  const sorting = sortParams(
    undefined,
    mockSetState,
    columnSettings as Column[]
  );
  expect(sorting).toBe('');
});

test('Should sorting desc with columnId', () => {
  const sorting = sortParams(
    'earliestPolicyStartDate',
    mockSetState,
    ascColumnSettings as Column[]
  );

  expect(sorting).toBe('order_by=attributes.earliestPolicyStartDate desc');
});

test('handleReset function behaviour', () => {
  const columns = [
    {
      id: 'policyStartDate',
      minWidth: 120,
      label: 'tableListing.policyStartDate',
      sortingField: 'attributes.earliestPolicyStartDate',
      sorting: 'desc',
    },
  ];
  const mockSetColumnSetting = jest.fn((fn: (val: any) => any) => {
    fn(columns);
  });
  const mockSetCurrentPage = jest.fn();
  const refetch = jest.fn();

  handleReset({
    setColumnsSetting: mockSetColumnSetting as any,
    setCurrentPage: mockSetCurrentPage,
    refetch,
    productType: 'car-insurance',
  });

  expect(refetch).toHaveBeenCalledWith({
    params:
      'product=car-insurance&page_size=15&order_by=attributes.earliestPolicyStartDate desc',
    assignedTo: '',
  });
  refetch.mockClear();

  handleReset({
    setColumnsSetting: mockSetColumnSetting as any,
    setCurrentPage: mockSetCurrentPage,
    refetch,
    assignedTo: 'qcAgent',
    productType: 'car-insurance',
  });
  expect(refetch).toHaveBeenCalledWith({
    params:
      'product=car-insurance&page_size=15&order_by=attributes.earliestPolicyStartDate desc',
    assignedTo: 'qcAgent',
  });

  expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
});

test('modifyQueryWithFilter function behaviour', () => {
  const payload = {
    setColumnsSetting: jest.fn(),
    setCurrentPage: jest.fn(),
    refetch: jest.fn(),
    productType: '',
  };
  expect(modifyQueryWithFilter(payload, [''], true)).toMatchObject({
    ...payload,
    filters: [''],
  });
  expect(modifyQueryWithFilter(payload, [''], false)).toMatchObject(payload);
});
