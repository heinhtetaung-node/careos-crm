// eslint-disable-next-line import/prefer-default-export
export const insertInterval = (array: any[], interval: number, item: any) => {
  const newArray = array.slice();
  const step = interval + 1;
  let pos = interval;
  while (pos < newArray.length) {
    newArray.splice(pos, 0, item);
    pos += step;
  }
  return newArray;
};

export const isObjectEmpty = (obj: object): boolean =>
  Object.keys(obj).length === 0;
