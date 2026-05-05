import _get from 'lodash/get';
import _omit from 'lodash/omit';

import { InsuranceKind } from 'shared/types/insurers';

export function combinePackageDetailArray<T extends Record<any, any>>(
  arrays: Record<number, T[]>,
  indexKey: string,
  valueKey: string
) {
  const keys: string[] = [];
  const hash: Record<string, T> = {};
  const defaultHash = Object.keys(arrays).reduce(
    (o, key) => ({ ...o, [key]: {} }),
    {}
  );
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(arrays)) {
    (_get(value, valueKey) ?? []).forEach((item: T) => {
      const index = _get(item, indexKey) as string;
      if (!keys.includes(index)) {
        keys.push(index);
      }
      hash[index] = {
        ...defaultHash,
        ...hash[index],
        [key]: _omit(item, indexKey),
      };
    });
  }
  return { keys, result: hash };
}

export function convertArrayToHash<V>(keys: string[], values: V[]) {
  return values.reduce((p, v, idx) => ({ ...p, [keys[idx]]: v }), {});
}

export function getFilterFromQueryParam(queryParam: URLSearchParams) {
  return {
    packageId: queryParam.get('id') ?? '',
    insuranceKind: queryParam.get('insuranceKind') as InsuranceKind,
    sumInsured:
      queryParam.has('sumInsuredMin') && queryParam.has('sumInsuredMax')
        ? {
            min: queryParam.get('sumInsuredMin') as string,
            max: queryParam.get('sumInsuredMax') as string,
          }
        : undefined,
    paymentOption: queryParam.get('paymentOption') ?? undefined,
    installment: queryParam.has('installmentPlan')
      ? parseInt(queryParam.get('installmentPlan') ?? '0', 10)
      : undefined,
  };
}
