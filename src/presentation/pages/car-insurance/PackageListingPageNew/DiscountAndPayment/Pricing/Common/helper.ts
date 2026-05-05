import { formatSatangToBaht } from 'utils/currency';

function handleAmount(value: string | number) {
  if (value === '0' || value === 0) {
    return '-';
  }

  return formatSatangToBaht(value.toString());
}

function handlePercent(value: number) {
  if (value === 0) {
    return '-';
  }

  return `${value}%`;
}

export { handleAmount, handlePercent };
