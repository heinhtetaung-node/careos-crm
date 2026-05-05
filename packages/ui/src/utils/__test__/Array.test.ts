import { insertInterval } from '../Array';

test('should insert item at the fix interval', () => {
  const result = insertInterval([1, 2, 3], 1, 'itm');
  expect(result).toStrictEqual([1, 'itm', 2, 'itm', 3]);
});
