import _keyBy from 'lodash/keyBy';
import { FileSearchIcon } from '@alphafounders/icons';
import React, { useEffect, useMemo, useState } from 'react';

import {
  Item,
  ItemElement,
  ItemPackage,
} from 'data/slices/orderPolicySlice/interface';
import { useLazyGetRenewalPackageDetailsQuery } from 'data/slices/packageSlice';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import PackageDetails from 'presentation/components/modal/Qc/PackageDetails/PackageDetails';
import usePackageDetails from 'presentation/components/QcDetailPage/hooks/usePackageDetails';
import { Colon } from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/index.style';
import { getString } from 'presentation/theme/localization';
import { MotoTypes } from 'shared/constants/orderType';
import { checkProductIsHealth } from 'shared/constants/productOptions';
import { PRODUCTS } from 'config/TypeFilter';
import { getI18InsurerName } from 'presentation/components/QcDetailPage/hooks/usePackagesInfo';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useUpdateOrderByIdMutation } from 'data/slices/orderSlice';
import useSnackbar from 'utils/snackbar';
import DetailViewTextField from 'presentation/components/common/FormikFields/DetailViewTextField';

export default function PolicyDetails({
  policy,
  isReadOnly,
}: Readonly<{
  policy: Item;
  isReadOnly: boolean;
}>) {
  const [openModal, setOpenModal] = useState(false);
  const [trigger, { data, isFetching }] =
    useLazyGetRenewalPackageDetailsQuery();
  const itemElements: ItemElement[] = useMemo(
    () => [{ item: policy, package: data as ItemPackage }],
    [policy, data]
  );
  const packageDetails = usePackageDetails(itemElements, isFetching);
  const [updateOrder] = useUpdateOrderByIdMutation();
  const { showSuccessSnackbar } = useSnackbar();
  const setOpenCloseModal = () => {
    trigger(
      {
        packageId: policy.package,
      },
      true
    );
    setOpenModal(!openModal);
  };

  const insurers = useAppSelector(
    (state) => state.ordersReducer?.insurersAllReducer.data || []
  );

  const [policyFields, setPolicyFields] = useState<
    {
      title: string;
      value: string | null | undefined;
      editable: boolean;
      orderFieldPath: string;
      showPenIcon: boolean;
      isReadOnly: boolean;
    }[]
  >([]);

  const insurerName = getI18InsurerName(
    _keyBy(insurers, 'name')?.[policy.insurer]
  );
  useEffect(() => {
    if (!insurerName) {
      return;
    }
    setPolicyFields([
      {
        title: 'qc.insurer',
        value: insurerName,
        editable: false,
        orderFieldPath: '',
        showPenIcon: false,
        isReadOnly: true,
      },
      {
        title: 'tableListing.policyNumber',
        value: policy?.policyNumber,
        editable: true,
        orderFieldPath: 'policyNumber',
        showPenIcon: !isReadOnly,
        isReadOnly,
      },
      {
        title: 'leadDetailFields.applicationNumber',
        value: policy?.applicationNumber,
        editable: true,
        orderFieldPath: 'applicationNumber',
        showPenIcon: !isReadOnly,
        isReadOnly,
      },
      {
        title: 'qc.sumInsured',
        value: policy?.sumInsured,
        editable: false,
        orderFieldPath: '',
        showPenIcon: !isReadOnly,
        isReadOnly,
      },
    ]);
  }, [insurerName]);

  const updateOrderData = async (key: string, value: string, title: string) => {
    await updateOrder({
      orderId: policy?.name?.replace('orders/', ''),
      payload: {
        [key]: value,
      },
    });
    showSuccessSnackbar(getString('text.updated', { field: getString(title) }));
  };

  return (
    <div>
      {checkProductIsHealth(policy?.product as keyof typeof PRODUCTS) ? (
        <div className="w-full">
          {policyFields.map((field) => (
            <DetailViewTextField
              value={field.value}
              isReadOnly={field.isReadOnly}
              showPenIcon={field.showPenIcon}
              name={field.title}
              isDisabled={field.isReadOnly ? false : !field.editable}
              handleUpdate={(e) =>
                updateOrderData(
                  field.orderFieldPath,
                  e[field.title],
                  field.title
                )
              }
              title={getString(field.title)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 items-center py-2.5 px-[15px] border-0 border-b-[1px] border-solid border-[#e9edf5]">
          <span>
            {getString('qc.coverageDetails')}
            <Colon>: </Colon>
          </span>
          <CommonButton
            variant="outlined"
            color="default"
            size="small"
            data-testid="expand-package-details"
            onClick={setOpenCloseModal}
            startIcon={<FileSearchIcon />}
          >
            {getString('qc.seeDetails')}
          </CommonButton>

          <PackageDetails
            modalToggle={openModal}
            handleModalToggle={setOpenCloseModal}
            packageDetails={packageDetails[policy.motorItemType as MotoTypes]}
          />
        </div>
      )}
    </div>
  );
}
