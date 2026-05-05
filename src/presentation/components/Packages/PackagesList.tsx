import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';

import _camelCase from 'lodash/camelCase';

import { initialPageState } from 'data/slices/importSlices/helper';
import useTableList from 'presentation/hooks/useTableList';
import { Column } from 'presentation/HOCs/WithTableList';
import { getString } from 'presentation/theme/localization';
import CustomModal from '../common/CustomModal';
import {
  CUSTOM_PACKAGE_SOURCES,
  getOriginalPackageSource,
  getPackageTypeLabel,
  createPackageSourceMap,
} from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { formatAmount } from '../common/InfoPanel/Insurance/Insurance.helper';
import CommonModal from '../modal/CommonModal';
import SelectRegion from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/SelectRegion';
import useSnackbar from 'utils/snackbar';

import clsx from 'clsx';
import { satangToBaht } from 'utils/currency';
import { PackageActionCellColumn } from './PackageActionCell';

export const columns: Column[] = [
  {
    id: 'title',
    field: 'title',
    label: 'newPackageListing.insurer',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'displayName',
    field: 'approver',
    label: 'newPackageListing.displayName',
    minWidth: 50,
    sorting: 'none',
    disabled: true,
    transform: (data: any) => {
      const packageTypeLabel = CUSTOM_PACKAGE_SOURCES.includes(
        data.packageSource
      )
        ? getPackageTypeLabel(
            data?.originalPackageSource ?? data?.packageSource
          )
        : null;
      return (
        <>
          {data.displayName}
          {packageTypeLabel ? (
            <>
              <br />
              <span className="text-warning">{packageTypeLabel}</span>
            </>
          ) : null}
        </>
      );
    },
  },
  {
    id: 'carInsuranceType',
    field: 'carInsuranceType',
    label: 'newPackageListing.insuranceType',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
    transform: (data: any) => {
      const chips = [data.carInsuranceType];

      return (
        <div className="flex w-full capitalize">
          {chips.toReversed().map((item) => (
            <div
              className="p-1.5 rounded m-1 !bg-slate-200 text-center text-[10px]"
              key={`item-${item.id}`}
            >
              {item}{' '}
              {data.insuranceKind !== 'voluntary' &&
                !['TYPE_610', 'TYPE_620'].includes(data?.oicCode) &&
                item !== 'mandatory' &&
                getString('packageListing.values.insuranceType.mandatory')}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: 'oicCode',
    field: 'oicCode',
    label: 'newPackageListing.oicCode',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
    transform: (data: any) => data.oicCode?.replace('TYPE_', ''),
  },
  {
    id: 'repairType',
    field: 'repairType',
    label: 'newPackageListing.repairType',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
    transform: (data: any) => getString(data.repairType),
  },
  {
    id: 'sumCoverage',
    field: 'sumCoverage',
    label: 'newPackageListing.carCoverage',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'deductibleAmount',
    field: 'deductibleAmount',
    label: 'newPackageListing.deductible',
    minWidth: 20,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'priceBeforeDiscount',
    field: 'priceBeforeDiscount',
    label: 'newPackageListing.price',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      data.hasDiscount ? data.originalPrice : data.premium,
  },
];

const customPackageColumns: Column[] = [
  {
    id: 'paymentPlan',
    field: 'paymentPlan',
    label: 'newPackageListing.paymentPlan',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      data.customQuoteDetail?.paymentMethod &&
      `${
        (data.customQuoteDetail?.priceBreakDown?.numberOfMonths ?? 0) > 1
          ? getString('packageListing.xMonth', {
              x: data.customQuoteDetail?.priceBreakDown?.numberOfMonths,
            })
          : getString('packageListing.oneTime')
      } / ${getString(
        `discountPricing.${_camelCase(data.customQuoteDetail?.paymentMethod)}`
      )}`,
  },
  {
    id: 'shippingFees',
    field: 'shippingFees',
    label: 'newPackageListing.shippingFee',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      formatAmount(
        satangToBaht(
          data?.customQuoteDetails?.priceDetail?.priceSummary?.shipmentFee ?? 0
        )
      ),
  },
  {
    id: 'discount',
    field: 'discount',
    label: 'newPackageListing.discount',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      formatAmount(
        satangToBaht(
          data?.customQuoteDetails?.priceDetail?.priceSummary?.discountAmount ??
            0
        )
      ),
  },
  {
    id: 'processingFee',
    field: 'processingFee',
    label: 'newPackageListing.processingFee',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      formatAmount(
        satangToBaht(
          data?.customQuoteDetails?.priceDetail?.priceSummary
            ?.processingFeeAmount ?? 0
        )
      ),
  },
  {
    id: 'premium',
    field: 'premium',
    label: 'newPackageListing.invoicedAmount',
    minWidth: 30,
    sorting: 'none',
    disabled: true,
  },
];

export function PackagesList({
  id,
  packages,
  renderPackageCard,
  setExpendedPackage,
  expendedPackage,
  packageType,
  scrollableHeight,
  carSubModelYear,
  handleCompare,
  leadId,
  selectedPackage,
  selectPackage,
  currentScroll,
  setCurrentScroll,
  openPopUpId,
  subModels,
  filterValues,
  updateLeadAlongWithSubModel,
  voluntryInsuranceTypes = [],
  setOpenPopupId,
  openedPackages,
  setOpenedPackages,
  initialCar,
  showAlsoManualAndRenewal,
}: Readonly<{
  readonly id: string;
  packages: any[];
  renderPackageCard: (
    pkg: TransformedPackageType,
    setOpenedPackage: (arg: string[]) => void
  ) => JSX.Element;
  setExpendedPackage: (id: string) => void;
  expendedPackage: string;
  packageType: 'normal' | 'custom';
  scrollableHeight: string;
  carSubModelYear: string;
  updateLeadAlongWithSubModel?: (subModelId: any) => Promise<void>;
  handleCompare: (arg: any) => void;
  leadId: string;
  isPackageSelected?: (
    pkg: TransformedPackageType,
    selectedPackage: any
  ) => boolean;
  selectedPackage?: any;
  selectPackage?: (arg: any) => void;
  noOfDoors?: string;
  engineSize?: string;
  currentScroll: number;
  setCurrentScroll: (scroll: number) => void;
  openPopUpId?: string | null;
  previousCarInformation: any;
  subModels: any[];
  filterValues: any;
  voluntryInsuranceTypes?: string[];
  setOpenPopupId: (id: string | null) => void;
  openedPackages: Array<string | number>;
  setOpenedPackages: React.Dispatch<
    React.SetStateAction<Array<string | number>>
  >;
  initialCar?: any;
  setForceRefreshingTable?: (arg: boolean) => void;
  showAlsoManualAndRenewal?: boolean;
}>) {
  const [openedPackage, setOpenedPackage] = useState<any[]>([]);

  const initialFilter = (leadUuid: string) => `lead.name='leads/${leadUuid}'`;
  const [openSubModelPopupId, setOpenSubModelPopupId] = useState<string>('');
  const [subModelSelId, setSubModelSelId] = useState<string>(carSubModelYear);
  const [subModelsFilter, setSubModelsFilter] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'custom' | 'manual' | 'renewal'>(
    'custom'
  );

  const packageSourceMap = useMemo(
    () => createPackageSourceMap(packages),
    [packages]
  );

  const filteredPackages = useMemo(() => {
    if (!showAlsoManualAndRenewal) return packages;

    // Cache lookups by original package name (often repeats)
    const originalSourceCache = new Map<string, string | null | undefined>();

    const getCachedOriginalSource = (originalName?: string | null) => {
      if (!originalName) return undefined;
      if (originalSourceCache.has(originalName)) {
        return originalSourceCache.get(originalName);
      }
      const value = getOriginalPackageSource(originalName, packageSourceMap);
      originalSourceCache.set(originalName, value);
      return value;
    };

    const out: typeof packages = [];

    for (const pkg of packages) {
      const src = pkg.packageSource;

      if (activeTab === 'manual') {
        if (src === 'manual') out.push(pkg);
        continue;
      }

      if (activeTab === 'renewal') {
        if (src === 'renewal_manual_quote') out.push(pkg);
        continue;
      }

      // default/custom tab behavior
      if (src !== 'custom') continue;

      out.push({
        ...pkg,
        originalPackageSource: getCachedOriginalSource(
          pkg.customQuoteDetail?.originalPackageName
        ),
      });
    }

    return out;
  }, [packages, activeTab, showAlsoManualAndRenewal, packageSourceMap]);

  const { showErrorSnackbar } = useSnackbar();

  const handleOpenPackage = async (data: any) => {
    if (
      voluntryInsuranceTypes?.length === 0 &&
      !data.name.startsWith('customPackages')
    ) {
      showErrorSnackbar(getString('newPackageListing.selectInsuranceType'));
      return;
    }

    setExpendedPackage(data.id);

    setOpenedPackage((prev) => [
      ...prev,
      {
        ...data,
        carInsuranceType: `${data.carInsuranceType}${data.insuranceKind === 'both' ? ' '.concat(getString('packageListing.values.insuranceType.mandatory')) : ''}`,
      },
    ]);
    setOpenedPackages((prev: Array<string | number>) =>
      prev.includes(data?.id) ? prev : [...prev, data?.id]
    );
  };

  useEffect(() => {
    if (openPopUpId && packages.find((pkg) => pkg.id === openPopUpId)) {
      handleOpenPackage(packages.find((pkg) => pkg.id === openPopUpId));
      setOpenPopupId(null);
    }
  }, [openPopUpId]);

  const openModal = (packageId: string) => {
    if (
      !filterValues?.brand ||
      !filterValues?.year ||
      !filterValues?.model ||
      !filterValues?.engineSize ||
      !filterValues?.noOfDoors
    ) {
      showErrorSnackbar(getString('newPackageListing.selectAllFilter'));
      return;
    }
    setOpenSubModelPopupId(packageId);
  };

  // Ref + stable transform to satisfy react/no-unstable-nested-components:
  // avoid defining a component (arrow returning JSX) during render.
  const actionCellContextRef = useRef<{
    packageType: string;
    data: any;
    selectedPackageName: string;
    leadId: string;
    selectPackage?: (arg: any) => void;
    handleCompareFunc: (arg: any) => void;
    handleOpenPackage: (data: any) => void;
    openModal: (id: string) => void;
    initialCar: any;
    filterValues: any;
  }>(null as any);

  actionCellContextRef.current = {
    packageType,
    data: undefined,
    selectedPackageName: selectedPackage,
    leadId,
    selectPackage,
    handleCompareFunc: handleCompare,
    handleOpenPackage,
    openModal,
    initialCar: initialCar ?? {},
    filterValues: filterValues ?? {},
  };

  const actionCellTransform = useCallback((data: any) => {
    const ctx = actionCellContextRef.current;
    if (!ctx) return null;
    return (
      <PackageActionCellColumn
        packageType={ctx.packageType}
        data={data}
        selectedPackageName={ctx.selectedPackageName}
        leadId={ctx.leadId}
        selectPackage={ctx.selectPackage}
        handleCompareFunc={ctx.handleCompareFunc}
        handleOpenPackage={ctx.handleOpenPackage}
        openModal={ctx.openModal}
        initialCar={ctx.initialCar}
        filterValues={ctx.filterValues}
      />
    );
  }, []);

  const tableColumns = useMemo(
    () => [
      ...columns,
      ...(packageType === 'custom' ? customPackageColumns : []),
      {
        id: 'compare',
        label: '',
        minWidth: 22,
        disabled: true,
        transform: actionCellTransform,
      },
    ],
    [
      handleCompare,
      selectedPackage,
      packageType,
      leadId,
      selectPackage,
      handleOpenPackage,
      openModal,
      initialCar,
      filterValues,
    ]
  );

  const handleCustomClick = (packageId: string, scroll: number) => {
    setExpendedPackage(packageId);
    setCurrentScroll(scroll);
  };

  const [filterURI] = useState(initialFilter(id));
  const { TableComponent } = useTableList(
    'approvalHistory',
    tableColumns,
    { ...initialPageState, filter: filterURI },
    () =>
      [
        () => '',
        {
          data: {
            imports: filteredPackages,
          },
          isLoading: false,
          isError: false,
          isSuccess: true,
        },
      ] as any,
    undefined,
    undefined,
    [],
    false,
    () => <div />,
    [],
    (_id: any) => {},
    true,
    handleCustomClick
  );

  useEffect(() => {
    setSubModelsFilter(
      subModels.filter((item: any) => {
        if (filterValues.engineSize && filterValues.noOfDoors) {
          return (
            item.engineSize === filterValues.engineSize &&
            item.doors === filterValues.noOfDoors
          );
        }
        return true;
      })
    );
  }, [filterValues?.engineSize, filterValues?.noOfDoors]);

  const handleUpdateSubModel = async () => {
    if (updateLeadAlongWithSubModel)
      await updateLeadAlongWithSubModel(parseFloat(subModelSelId));
    setTimeout(() => {
      setOpenSubModelPopupId('');
      handleOpenPackage(packages.find((pkg) => pkg.id === openSubModelPopupId));
    }, 500);
  };

  return (
    <>
      <CommonModal
        title={getString('newPackageListing.selectSubModelTitle')}
        open={openSubModelPopupId !== ''}
        handleCloseModal={() => setOpenSubModelPopupId('')}
        maxWidth="sm"
      >
        <SelectRegion
          title={getString('leadDetailFields.submodel')}
          tooltipHelperText=""
          value={subModels.indexOf(
            subModels.find(
              (item: any) =>
                item?.value?.toString() === subModelSelId?.toString()
            )
          )}
          onChange={(index) => setSubModelSelId(subModels[index].value)}
          options={subModelsFilter?.map((subModel) => ({
            key: subModel.id,
            label: subModel.title,
            value: subModel.id,
          }))}
        />

        <button
          type="button"
          className="px-4 py-2.5 mt-2 mb-3 mr-2 bg-primary text-white text-md font-bold rounded-md cursor-pointer"
          onClick={() => handleUpdateSubModel()}
        >
          {getString('packageListing.payment')}
        </button>

        <button
          type="button"
          className="px-4 py-2.5 mt-2 mb-3 mr-2 bg-gray-200 cursor-pointer border-gray-300 text-gray-800 text-md font-bold rounded-md"
          onClick={() => setOpenSubModelPopupId('')}
        >
          {getString('text.cancel')}
        </button>
      </CommonModal>
      <CustomModal
        show={!!openedPackage?.length}
        onClose={() => setOpenedPackage([])}
      >
        {openedPackage.map((data) => renderPackageCard(data, setOpenedPackage))}
      </CustomModal>
      {showAlsoManualAndRenewal && (
        <div className="mb-3 right-0 justify-between flex">
          <div className="">
            <span className="font-bold ">
              {filteredPackages.length || 0}{' '}
              {getString(`newPackageListing.${activeTab}Packages`)}
            </span>
          </div>
          <div className="flex border-b border-gray-200 -mb-3">
            <button
              type="button"
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer',
                activeTab === 'custom'
                  ? 'bg-primary text-white font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              onClick={() => setActiveTab('custom')}
            >
              {getString('newPackageListing.custom')}
            </button>
            <button
              type="button"
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer',
                activeTab === 'manual'
                  ? 'bg-primary text-white font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              onClick={() => setActiveTab('manual')}
            >
              {getString('newPackageListing.manual')}
            </button>
            <button
              type="button"
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer',
                activeTab === 'renewal'
                  ? 'bg-primary text-white font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              onClick={() => setActiveTab('renewal')}
            >
              {getString('newPackageListing.renewal')}
            </button>
          </div>
        </div>
      )}
      <TableComponent
        fontSize="11px"
        paddingStyle="pt-[15px] pb-[15px] pl-[5px] pr-[1px]"
        paginationStyle="-mt-5"
        scrollableHeight={scrollableHeight}
        clickedRow={expendedPackage}
        currentScroll={currentScroll}
      />
    </>
  );
}
