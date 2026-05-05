// eslint-disable-next-line import/prefer-default-export
export const removeZeroPadding = (value: string) =>
  value.replace(/^0+(?!\.|$)/, '');
