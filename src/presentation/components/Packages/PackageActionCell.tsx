import React from 'react';
import { getApprovalStatus } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { getString } from 'presentation/theme/localization';
import clsx from 'clsx';
import { getPackageDetailUrl } from 'presentation/routes/Urls';
import { useNavigate } from 'react-router-dom';

type PackageActionProps = {
  data: any;
  packageType: string;
  selectedPackageName: string;
  leadId: string;
  selectPackage?: (payload: any) => void;
  handleCompareFunc: (id: string) => void;
  handleOpenPackage: (data: any) => void;
  openModal: (id: string) => void;
  initialCar: any;
  filterValues: any;
};

const renderCustomPackageStatusContent = (
  data: any,
  packageType: string,
  selectedPackageName: string,
  currentLeadId: string,
  onSelectPackage: ((payload: any) => void) | undefined
): React.ReactNode => {
  const { text } = getApprovalStatus(data?.customQuoteDetail?.approvalStatus);
  const isCustomSource =
    packageType === 'custom' &&
    !['manual', 'renewal_manual_quote'].includes(data.packageSource);
  if (!isCustomSource) return null;
  if (selectedPackageName === data.name) {
    return (
      <span className="text-green-400 text-[11px] -mt-4 font-bold">
        {getString('packageListing.selected')}
      </span>
    );
  }
  if (
    [getString('text.rejected'), getString('text.waitingApproval')].includes(
      text
    )
  ) {
    const statusClassName =
      text === getString('text.rejected') ? 'text-error' : 'text-warning';
    return (
      <span
        className={clsx(
          'mr-1 text-[10px] text-nowrap -mt-4 font-bold',
          statusClassName
        )}
      >
        {text}
      </span>
    );
  }
  return (
    <button
      type="button"
      className="text-indigo-500 absolute -mt-[18px] z-[1] cursor-pointer border-none bg-transparent underline text-xs"
      onClick={() => {
        const { paymentOption, paymentMethod, numberOfInstallments } =
          data?.customQuoteDetail ?? {};
        const insuranceKind = data?.insuranceKind?.toUpperCase();
        const filterData = {
          paymentOption,
          paymentMethod,
          installmentPlan: numberOfInstallments,
          insuranceKind,
        };
        const selectPackagePayload = {
          leadId: currentLeadId,
          payload: {
            ...filterData,
            package: data.id,
          },
        };
        if (onSelectPackage) {
          onSelectPackage(selectPackagePayload);
        }
      }}
    >
      {getString('newPackageListing.select')}
    </button>
  );
};

function PackageActionCell({
  data,
  packageType,
  selectedPackageName,
  leadId,
  selectPackage,
  handleCompareFunc,
  handleOpenPackage,
  openModal,
  initialCar,
  filterValues,
}: Readonly<PackageActionProps>) {
  const shouldOpenModal =
    !initialCar?.carSubModelYear ||
    initialCar?.brand !== filterValues?.brand ||
    initialCar?.year !== filterValues?.year ||
    initialCar?.model !== filterValues?.model ||
    initialCar?.engineSize !== filterValues?.engineSize ||
    initialCar?.noOfDoors !== filterValues?.noOfDoors;

  const navigate = useNavigate();

  return (
    <div className="relative min-h-12 h-auto pt-2">
      <div className="flex flex-col">
        {renderCustomPackageStatusContent(
          data,
          packageType,
          selectedPackageName,
          leadId,
          selectPackage
        )}

        <button
          type="button"
          className={clsx(
            'text-indigo-500 absolute cursor-pointer border-none bg-transparent underline text-xs',
            data?.customQuoteDetail?.approvalStatus && 'z-[1]'
          )}
          onClick={(e) => {
            e.preventDefault();
            handleCompareFunc(data.id);
          }}
        >
          + {getString('newPackageListing.compare')}
        </button>

        <button
          type="button"
          className={clsx(
            'text-indigo-500 absolute top-6 cursor-pointer border-none bg-transparent underline text-xs',
            data?.customQuoteDetail?.approvalStatus && 'z-[1]'
          )}
          onClick={() =>
            shouldOpenModal ? openModal(data.id) : handleOpenPackage(data)
          }
        >
          {getString('newPackageListing.payment')}
        </button>

        <button
          type="button"
          className={clsx(
            'text-indigo-500 absolute top-10 cursor-pointer border-none bg-transparent underline text-xs',
            data?.customQuoteDetail?.approvalStatus && 'z-[1]'
          )}
          onClick={() =>
            navigate(
              getPackageDetailUrl({
                leadId,
                packageId: data.id,
                noParams: true,
              })
            )
          }
        >
          {getString('newPackageListing.quotation')}
        </button>
      </div>
    </div>
  );
}

/** Stable component for use in table column transform. Avoids react/no-unstable-nested-components. */
export function PackageActionCellColumn(props: Readonly<PackageActionProps>) {
  return <PackageActionCell {...props} />;
}

export default PackageActionCell;
