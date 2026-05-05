import { updateManualOrderList } from '..';

test('check updateManualOrderList run well 1st', () => {
  expect(
    updateManualOrderList({
      data: [],
      listCheckBox: [],
      agentFullName: '',
    })
  ).toEqual([]);
});

test('check updateManualOrderList run well 2nd', () => {
  expect(
    updateManualOrderList({
      data: [
        {
          id: '1',
        },
      ],
      listCheckBox: ['1'],
      agentFullName: 'duynt',
    })
  ).toEqual([
    {
      id: '1',
      assignedTo: 'duynt',
    },
  ]);
});

test('check updateManualOrderList run well 3rd', () => {
  expect(
    updateManualOrderList({
      data: [
        {
          id: '1',
        },
      ],
      listCheckBox: ['0'],
      agentFullName: 'duynt',
    })
  ).toEqual([
    {
      id: '1',
    },
  ]);
});
