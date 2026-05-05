export const formatThaiId = (value: string) => {
  if (!value) {
    return '';
  }
  const regex = /^(\d{1})(\d{0,4})(\d{0,5})(\d{0,2})(\d{0,1})/;
  const match = value.match(regex);
  if (!match) return value;
  return [match[1], match[2], match[3], match[4], match[5]]
    .filter(Boolean)
    .join('-');
};
