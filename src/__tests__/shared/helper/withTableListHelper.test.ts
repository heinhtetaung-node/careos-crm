import { defineState } from 'presentation/HOCs/WithTableListHelper';

const tableType = 'teams';
const result = 'teamsReducer';

test('Valid define State', () => {
  expect(defineState(tableType)).toEqual(result);
});
