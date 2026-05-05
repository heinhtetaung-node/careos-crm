export const findArrayOfString = (finds: string[], stringToFind: string) =>
  finds.some((find) => stringToFind.includes(find));

export default findArrayOfString;
