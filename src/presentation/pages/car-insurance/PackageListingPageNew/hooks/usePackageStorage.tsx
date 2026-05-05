import { useSessionStorage } from 'usehooks-ts';

import { getMaximumPackageLimit } from 'data/slices/packageListing/helper';

import { TransformedPackageType } from './useTransformedPackages';

export type StorageType = {
  detail: TransformedPackageType;
  name: string;
  sumInsuredMin?: number | string;
  sumInsuredMax?: number | string;
  insuranceCategory: string;
};

function usePackageStorage() {
  const [packageData, setPackageData] = useSessionStorage<StorageType[]>(
    'PACKAGE_LISTING',
    []
  );

  const resetComparedPackags = () => {
    setPackageData([]);
  };

  const addToComparison = (selectedPackage: StorageType) => {
    const maximumPackageLimit = getMaximumPackageLimit();
    if (packageData.length < maximumPackageLimit) {
      setPackageData([...packageData, selectedPackage]);
    } else {
      packageData[packageData.length - 1] = selectedPackage;
      setPackageData(packageData);
    }
  };

  const removeFromComparison = (packageName: string) => {
    setPackageData(packageData.filter((pkg) => pkg.name !== packageName));
  };

  return {
    packageData,
    resetComparedPackags,
    addToComparison,
    removeFromComparison,
  };
}

export default usePackageStorage;
