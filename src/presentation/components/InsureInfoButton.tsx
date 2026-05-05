import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { useGetSuccessfulTransactionQuery } from 'data/slices/transactionSlice';
import { removeFilterValueFromStorage } from 'presentation/pages/car-insurance/PackageDetailPage/useGetPackageData';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getPackagesUrl } from 'presentation/routes/Urls';

import Controls from './controls/Control';

import { getString } from '../theme/localization';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

interface Props {
  isDisabled?: boolean;
}

function InsurerInfoBtn({ isDisabled = false }: Props) {
  const disableOnSuccessfulTransaction = false;
  const leadInfo = useGetLeadSelector();
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const {
    data: successfulTransaction,
    isLoading: transactionLoading,
    refetch: refetchTransactions,
  } = useGetSuccessfulTransactionQuery(leadInfo.name, {
    skip: !disableOnSuccessfulTransaction,
  });
  const { id } = useParams() as { id: string };

  const navigate = useNavigate();
  const { errors, setFieldTouch } = useLeadDetailError();

  const handleClick = async () => {
    if (disableOnSuccessfulTransaction) {
      const result = await refetchTransactions();
      if (!result.data?.charges?.length) {
        setFieldTouch('package');
        removeFilterValueFromStorage();
        navigate(
          getPackagesUrl(
            id,
            globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE
          )
        );
      }
    } else {
      setFieldTouch('package');
      removeFilterValueFromStorage();
      navigate(
        getPackagesUrl(id, globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE)
      );
    }
  };

  return (
    <Controls.Button
      color={errors.package ? 'danger' : 'primary'}
      type="submit"
      variant="contained"
      className="unittest-view-quotes button-view-quotes"
      disabled={isDisabled || successfulTransaction?.charges?.length}
      loading={transactionLoading}
      onClick={handleClick}
      data-testid="package-listing-btn"
    >
      {getString('text.viewPackages')}
    </Controls.Button>
  );
}

export default InsurerInfoBtn;
