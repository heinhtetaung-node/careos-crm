import { FolderOpenIcon } from '@alphafounders/icons';
import { format, formatISO } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useUpdatePolicyDataMutation } from 'data/slices/orderPolicySlice';
import {
  useGetOrderItemsQuery,
  useGetOrderPolicyItemsQuery,
} from 'data/slices/orderSlice';
import { Item, ItemElement } from 'data/slices/orderPolicySlice/interface';
import DetailViewDatepicker from 'presentation/components/common/FormikFields/DetailViewDatepicker';
import PackageTypeBadge from 'presentation/components/common/PackageTypeBadge';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { insuranceType } from 'presentation/components/QcDetailPage/hooks/usePackagesInfo';
import { getPackageTypeLabelFromOrderData } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import {
  Colon,
  FieldItem,
} from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/index.style';
import { FormField } from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/RenderItem';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import {
  ItemApprovalStatus,
  ItemQcStatus,
  ItemSubmissionStatus,
} from 'shared/constants/orderType';

import PolicyDetails from './PolicyDetails';

import CovernoteDownload from '../CovernoteDownload';

const downloadCovernoteStatus = {
  approval: [ItemApprovalStatus.APPROVED, ItemApprovalStatus.POLICY_UPLOADED],
  submission: [
    ItemSubmissionStatus.PRESUBMITTED,
    ItemSubmissionStatus.SUBMITTED,
  ],
};

function PoliciesInfo({
  isReadOnly = false,
  covernoteDownload = false,
  insuranceCategory = '',
}) {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState<string[]>([]);

  const { data: user } = useGetAuthenticateQuery();
  const [updatePolicy, { isSuccess, isError }] = useUpdatePolicyDataMutation();

  const { data: policyItems, isLoading: isItemsLoading } =
    useGetOrderPolicyItemsQuery(orderId!);
  const { data: orderDetail, isLoading: isOrderDetailLoading } =
    useGetOrderItemsQuery({ orderId: orderId! });

  type PolicyItemWithLabel = Item & {
    packageTypeLabel: string | null;
    discounts: ItemElement['discounts'];
  };

  const policies = useMemo<PolicyItemWithLabel[]>(() => {
    if (isItemsLoading || isOrderDetailLoading || !policyItems) return [];

    const orderItemsByName = new Map(
      (orderDetail?.items ?? []).map((el) => [el?.item?.name, el] as const)
    );

    return policyItems.map((item) => {
      const itemElement = orderItemsByName.get(item.name);

      const discounts = itemElement?.discounts ?? [];
      const pkg = itemElement?.package;

      return {
        ...item,
        discounts,
        packageTypeLabel: getPackageTypeLabelFromOrderData(
          pkg?.packageType,
          pkg?.source
        ),
      };
    });
  }, [isItemsLoading, isOrderDetailLoading, policyItems, orderDetail?.items]);

  const isSalesAgent = user?.role === UserRoleID.SalesAgent;

  const onUpdateOrder = (policyId: string, payload: any) => {
    setErrors((prevState) => prevState.filter((i) => i !== policyId));
    updatePolicy({
      orderId,
      policyId: policyId?.split('/')[3] ?? '',
      payload: {
        policyStartDate: `${formatISO(payload.policyStartDate, {
          representation: 'date',
        })}T00:00:00+00:00`,
      },
    });
  };

  useEffect(() => {
    if (isError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('errorMessage.generalErrorMessage'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updatePolicySuccessfully'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <div className="mb-[11px] rounded-[10px] border border-solid border-[#e9edf5]">
      <h3 className="m-0 py-[10px] px-[15px] text-primary bg-muted-light rounded-t-[10px]">
        {getString('text.policies')}
      </h3>
      {policies?.map((item: PolicyItemWithLabel, index) => {
        // make date picker read only for these specific statuses
        const readOnlyStatuses =
          item.submissionStatus === ItemSubmissionStatus.SUBMITTED ||
          item.qcStatus === ItemQcStatus.APPROVED;

        // make date picker read only for these specific roles
        const readOnlyRoles =
          user?.role === UserRoleID.Supervisor ||
          user?.role === UserRoleID.Manager ||
          user?.role === UserRoleID.SalesAgent;

        const allowOpenToApprovalDetail =
          isSalesAgent &&
          item.approvalStatus === ItemApprovalStatus.POLICY_UPLOADED;

        const policyRoute = `/${item.name.split('/items')[0]}/policies/${
          item.humanId
        }/approval`;

        return (
          <div key={item?.humanId ?? index}>
            <div className="px-[15px] py-[10px] flex items-center border-x-0 border-t-0 border-b border-[#e9edf5] border-solid">
              {insuranceCategory && (
                <span className="font-bold text-lg">
                  {getString(
                    `healthPackageFilter.productCategoryValue.${insuranceCategory}`
                  )}
                </span>
              )}
              <span className="font-bold text-lg">
                {insuranceType[item?.motorItemType]}
              </span>
              <PackageTypeBadge label={item.packageTypeLabel} />
              {allowOpenToApprovalDetail && (
                <Link
                  className="ml-auto leading-[0.1]"
                  to={policyRoute}
                  target="_blank"
                >
                  <FolderOpenIcon />
                </Link>
              )}
            </div>
            {isReadOnly || (readOnlyRoles && readOnlyStatuses) ? (
              <FormField>
                <FieldItem>{getString('text.policyStartDate')}</FieldItem>
                <FieldItem>
                  <Colon>: </Colon>
                  <span>
                    {format(new Date(item?.policyStartDate), 'dd/MM/yyyy')}
                  </span>
                </FieldItem>
              </FormField>
            ) : (
              <DetailViewDatepicker
                title={getString('text.policyStartDate')}
                name="policyStartDate"
                error={
                  errors?.includes(item.name)
                    ? getString('text.invalidDateWithCurrent')
                    : ''
                }
                dataTestId={`${item.humanId}-policy-start-date`}
                value={format(new Date(item?.policyStartDate), 'dd/MM/yyyy')}
                handleUpdate={(newDate) => onUpdateOrder(item.name, newDate)}
                placeholder="DD/MM/YYYY"
                datepickerProps={{
                  minDate: new Date(new Date().getFullYear() - 100, 1, 2),
                }}
              />
            )}
            {covernoteDownload &&
              downloadCovernoteStatus.submission.includes(
                item?.submissionStatus as ItemSubmissionStatus
              ) && (
                <div className="grid grid-cols-2 items-center gap-1 py-2.5 px-[15px] border-0 border-b-[1px] border-solid border-[#e9edf5]">
                  <span>
                    {getString('order.policies.downloadCovernote')}
                    <Colon>: </Colon>
                  </span>
                  <CovernoteDownload
                    policyId={item?.name}
                    btnSize="small"
                    shortText
                  />
                </div>
              )}
            <PolicyDetails policy={item} isReadOnly={isReadOnly} />
          </div>
        );
      })}
    </div>
  );
}

export default PoliciesInfo;
