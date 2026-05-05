// eslint-disable-next-line import/prefer-default-export
export const insertInterval = (
  array: (React.JSX.Element | string | number | boolean)[],
  interval: number,
  item: React.JSX.Element | string | number | boolean
) => {
  const newArray = array.slice();
  const step = interval + 1;
  let pos = interval;
  while (pos < newArray.length) {
    newArray.splice(pos, 0, item);
    pos += step;
  }
  return newArray;
};
