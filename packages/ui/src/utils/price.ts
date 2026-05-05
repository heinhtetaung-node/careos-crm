// eslint-disable-next-line import/prefer-default-export
export const getFormattedPrice = (price: number | string) => {
  return price?.toLocaleString();
};
