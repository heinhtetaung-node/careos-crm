import { isUndefined } from 'lodash';

export const numberToMoney = (
  amount: number,
  locale = 'th-TH',
  currency: string | undefined = undefined
) => {
  if (!amount) return amount;
  const options: { style?: string; currency?: string } = {};
  if (currency) {
    options.style = 'currency';
    options.currency = currency;
  }

  const formatter = new Intl.NumberFormat(locale, options as any);

  return formatter.format(amount);
};

export function currencyToMoney(amount: number, currencyCode: string = 'THB') {
  const units = Math.trunc(amount);
  const nanos = Math.round((amount - units) * 1e9);

  return {
    currency_code: currencyCode,
    units,
    nanos,
  };
}

export function moneyToCurrency(money: { units: string; nanos: number }) {
  if (!money) return 0;
  if (parseFloat(money?.units) >= 0 && money?.nanos >= 0) {
    return parseFloat(money?.units) + money?.nanos / 1e9;
  }
  return 0;
}

export function satangToBaht(amount: number | string) {
  return Number(amount) / 100;
}

export function bahtToSatang(amount: number | string) {
  return Math.floor(Number(amount) * 100);
}

export const satangToBahtNumber = (
  satang: string | number | bigint,
  rounding: 'ceil' | 'floor' | undefined = undefined
) => {
  const baht = Number(satang) / 100;
  if (rounding === 'ceil') {
    return Math.ceil(baht);
  }
  if (rounding === 'floor') {
    return Math.floor(baht);
  }
  return baht;
};

export function formatSatangToBaht(
  amount: number | string | bigint | undefined,
  options?: { removeSign?: boolean }
) {
  if (isUndefined(amount)) {
    return '0';
  }
  const allowedSign = ['-', '+'];
  const hasSign =
    typeof amount === 'string' && allowedSign.includes(amount.charAt(0));

  if (hasSign) {
    const sign = options?.removeSign ? '' : amount.charAt(0);
    const actualNumber = amount.substring(1);
    const quotient = (BigInt(actualNumber) / BigInt(100)).toLocaleString();
    const remainder = BigInt(actualNumber) % BigInt(100);
    if (remainder) {
      return `${sign}${quotient}.${(remainder < 10 ? '0' : '') + remainder}`;
    }
    return `${sign}${quotient}`;
  }

  const quotient = (BigInt(amount) / BigInt(100)).toLocaleString();
  const remainder = BigInt(amount) % BigInt(100);
  if (remainder) {
    return `${quotient}.${(remainder < 10 ? '0' : '') + remainder}`;
  }

  return quotient;
}

export function formatBahtToSatang(amount: number | string | undefined) {
  if (typeof amount === 'string') {
    const newAmount = amount.replaceAll(',', '');
    const fullAmount = newAmount.split('.');

    if (fullAmount.length === 2) {
      const numerical = fullAmount[0];
      const decimal = fullAmount[1];
      return (BigInt(numerical) * BigInt(100) + BigInt(decimal)).toString();
    }

    return (BigInt(fullAmount[0]) * BigInt(100)).toString();
  }
  if (typeof amount === 'undefined') {
    return undefined;
  }

  return (BigInt(amount) * BigInt(100)).toString();
}
