export const numberToMoney = (amount: number, locale = 'th-TH') => {
  const formatter = new Intl.NumberFormat(locale);
  return formatter.format(amount);
};

export const moneyToNumber = (moneyString: string) =>
  parseInt(moneyString.replace(/,/g, ''), 10);
