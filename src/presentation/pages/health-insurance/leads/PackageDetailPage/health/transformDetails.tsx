import { getString } from 'presentation/theme/localization';
import { numberToMoney, coverageDetails } from '@careos/utils';
import { satangToBaht } from 'utils/currency';

const getCoverageDetails = (apiPackage: any, details: any, lang: string) => {
  const { category, coverages: apiCoverages, product, plan } = apiPackage;
  const categoryDetails =
    coverageDetails[category as keyof typeof coverageDetails];
  if (!categoryDetails) return;

  categoryDetails.forEach(({ title, coverages }: any) => {
    const section = {
      key: 'key',
      title: getString(`healthPackageDetail.titles.${title}`),
      packages: [apiPackage.name],
      hasData: !!(category || product || plan),
      items: [] as Record<string, any>,
    };
    const items: { label: string; values: { [x: string]: any } }[] = [];
    coverages.forEach((key: string | number) => {
      const item = {
        label: getString(`healthPackageDetail.labels.${key}`),
        values: {
          [`${apiPackage.name}`]: {},
        },
      };
      const coverageValue = apiCoverages[key];
      if (coverageValue) {
        if (
          coverageValue?.limitValue !== null &&
          parseInt(coverageValue.limitValue.units, 10) > 0
        ) {
          item.values[apiPackage.name] = {
            component: `${numberToMoney(satangToBaht(coverageValue.limitValue.units))} ${getString('healthPackage.thb')}`,
          };
        } else {
          item.values[apiPackage.name] = {
            component:
              lang === 'en'
                ? coverageValue.displayNameEn || coverageValue.summaryEn
                : coverageValue.displayNameTh || coverageValue.summaryTh,
          };
        }
      }
      items.push(item);
    });
    section.items = [...items].filter(
      (item) => Object.keys(item.values[apiPackage.name]).length !== 0
    );
    if (section.items.length > 0) {
      details.push(section);
    }
  });
};

export default (apiPackage: any, lang: any) => {
  const details = [];
  const { category, product, plan } = apiPackage;
  details.push({
    key: 'key',
    title: getString('healthPackageDetail.packageDetail'),
    packages: [apiPackage.name],
    hasData: !!(category || product || plan),
    items: [
      {
        label: getString('healthPackageDetail.insuranceType'),
        values: {
          [`${apiPackage.name}`]: {
            component: getString(`healthPackageDetail.categories.${category}`),
          },
        },
      },
      {
        label: getString('healthPackageDetail.packageName'),
        values: {
          [`${apiPackage.name}`]: {
            component:
              lang === 'en'
                ? apiPackage.displayNameEn
                : apiPackage.displayNameTh,
          },
        },
      },
    ],
  });
  getCoverageDetails(apiPackage, details, lang);
  return details;
};
