import React, { useState, useCallback } from 'react';

import DetailViewTextField from '../DetailViewTextField';
import { DetailViewTextFieldProps } from '../DetailViewTextField/DetailViewTextField';

function reverseString(raw: string): string {
  return raw.split('').reverse().join('');
}

export function formatLicensePlate(raw: string): string {
  if (Number.isInteger(+raw)) {
    return `${raw.slice(0, 2)} ${raw.slice(2)}`;
  }
  const reversedValue = reverseString(raw);
  const firstCharIdx = reversedValue.search(/\D/);
  const serialNumber = reversedValue.slice(0, firstCharIdx);
  const seriesLetters = reversedValue.slice(firstCharIdx);

  return reverseString(`${serialNumber} ${seriesLetters}`);
}

export function normalizedLicensePlate(value: string) {
  let province = '';
  let licensePlate = value?.replace('-', '');
  const address = licensePlate?.split(' ');

  const isProvinceIncluded =
    Array.isArray(address) &&
    address.length > 1 &&
    !Number.isInteger(+address[address.length - 1]);

  if (isProvinceIncluded) {
    licensePlate = address.slice(0, -1).join('');
    province = address[address.length - 1];
  }

  if (licensePlate && !licensePlate?.includes(' ')) {
    return isProvinceIncluded
      ? `${formatLicensePlate(licensePlate)} ${province}`
      : formatLicensePlate(licensePlate);
  }
  return isProvinceIncluded ? `${licensePlate} ${province}` : licensePlate;
}

export default function LicensePlate({
  value,
  ...textFieldProps
}: DetailViewTextFieldProps) {
  const [licensePlate, setLicensePlate] = useState(() =>
    normalizedLicensePlate(value)
  );

  const handleChange = useCallback((val: string) => {
    if (val.length === 2 && Number.isInteger(+val)) {
      setLicensePlate(`${val} `);
      return;
    }
    if (
      !val.includes(' ') &&
      val.length > 1 &&
      Number.isInteger(+val[val.length - 1])
    ) {
      const result = formatLicensePlate(val);
      setLicensePlate(result);
      return;
    }

    setLicensePlate(val);
  }, []);

  return (
    <DetailViewTextField
      {...textFieldProps}
      handleInputChange={handleChange}
      value={licensePlate}
    />
  );
}
