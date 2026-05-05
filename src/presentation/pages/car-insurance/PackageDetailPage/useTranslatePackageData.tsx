import { zip } from 'lodash';
import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';

import { getString } from 'presentation/theme/localization';

import {
  DetailSectionItem,
  ValuesTranslated,
} from './PackageDetailPage.helper';
import {
  combinePackageDetailArray,
  convertArrayToHash,
} from './translatePackage.helper';

import { getPackageDifference } from '../PackageComparisonPage/helper';
import { TransformedPackageType } from '../PackageListingPageNew/hooks/useTransformedPackages';
import { DetailType } from '../PackageListingPageNew/packageTransformation/transformations';

const getTranslatedValues = (
  itemValues: DetailSectionItem['values'],
  pkgIds: string[]
) => {
  const values: Record<string, ValuesTranslated> = {};
  pkgIds.forEach((id: string) => {
    const translatedValue = getString(itemValues[id].textValues?.value);
    const isRepairType =
      itemValues[id].text === 'packageListing.templates.repairType';
    values[id] = {
      component:
        isRepairType && translatedValue === '-' ? (
          <span>-</span>
        ) : (
          <Trans
            i18nKey={itemValues[id].text ?? '-'}
            components={{
              boldGreen: <span className="text-success font-bold" />,
              lineBreak: <br />,
              bold: <span className="font-bold" />,
            }}
            values={{ value: translatedValue }}
          />
        ),
    };
  });
  return values;
};

const checkDifference = (
  values: Record<string, any>,
  packageIds: string[],
  showDifference: boolean
) => getPackageDifference(values, packageIds) || !showDifference;

const translate = (
  detailSection: (DetailType | undefined)[],
  packageIds: string[],
  showDifference: boolean
) => {
  const hashedDetailSection = convertArrayToHash(packageIds, detailSection);
  const { keys: labels, result: values } = combinePackageDetailArray(
    hashedDetailSection,
    'label',
    'items'
  );

  return {
    hasData: detailSection.some((sec) => sec?.hasData),
    title: getString(detailSection[0]?.title ?? ''),
    key: detailSection[0]?.title ?? '',
    packages: packageIds,
    items: labels
      .filter((label) =>
        checkDifference(values[label], packageIds, showDifference)
      )
      .map((label) => ({
        isEmpty: false,
        label: getString(label),
        values: getTranslatedValues(values[label], packageIds),
      })),
  };
};

function useTranslatePackageData(
  showDifference: boolean,
  ...insurancepackages: (TransformedPackageType | null)[]
) {
  const packageIds = insurancepackages.map(
    (insurancePackage) => insurancePackage?.id
  ) as string[];

  const translatedValues = useMemo(
    () =>
      zip(...insurancepackages.map((x) => x?.details ?? []))
        .map((detailSection) =>
          translate(detailSection, packageIds, showDifference)
        )
        .filter((itm) => itm.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [insurancepackages]
  );

  return translatedValues;
}

export default useTranslatePackageData;
