import _omitBy from 'lodash/omitBy';
import _zip from 'lodash/zip';

export const getPackageDifference = (values: any, packageIds: any) => {
  let isDifferent = false;

  packageIds.forEach((pack: any, index: number) => {
    if (packageIds.length > index + 1) {
      if (values[pack]?.text !== values[packageIds[index + 1]]?.text) {
        isDifferent = true;
      } else if (
        values[pack]?.text === values[packageIds[index + 1]]?.text &&
        values[pack]?.textValues
      ) {
        if (
          values[pack]?.textValues?.value !==
          values[packageIds[index + 1]]?.textValues?.value
        ) {
          isDifferent = true;
        }
      }
    }
  });
  return isDifferent;
};

export const getDifferenceData = (packageData: any[]) => {
  const differenceData: any = [];
  packageData.forEach((pack: any, index: any) => {
    const data: any = [];
    let difference = false;

    // Check difference of each item of a package
    pack.items.forEach((item: any) => {
      const differenceItem = getPackageDifference(item.values, pack.packages);

      if (differenceItem) {
        difference = true;
        data.push(item);
      }
    });

    // Check if there is difference in any item of a package.
    if (difference) {
      const dataToPush = {
        ...packageData[index],
        items: data,
      };
      differenceData.push(dataToPush);
    }
  });

  return differenceData;
};

export const decodeCompareQueryParam = (query: URLSearchParams) => {
  const packageNames = query.has('id') ? query.get('id')?.split(',') : [];
  const insuranceCategorys = query.has('insuranceCategory')
    ? query.get('insuranceCategory')?.split(',')
    : [];
  const sumInsuredMins = query.has('sumInsuredMin')
    ? query.get('sumInsuredMin')?.split(',')
    : [];
  const sumInsuredMaxs = query.has('sumInsuredMax')
    ? query.get('sumInsuredMax')?.split(',')
    : [];

  return _zip(
    packageNames,
    insuranceCategorys,
    sumInsuredMaxs,
    sumInsuredMins
  ).map(([packageName, insuranceCategory, sumInsuredMax, sumInsuredMin]) =>
    _omitBy(
      {
        packageName,
        insuranceCategory,
        sumInsuredMax: parseInt(sumInsuredMax ?? '', 10),
        sumInsuredMin: parseInt(sumInsuredMin ?? '', 10),
      },
      Number.isNaN
    )
  );
};
