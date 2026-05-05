import { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import { useGetSuccessfulTransactionQuery } from 'data/slices/transactionSlice';
import useAuthorizedUsers from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useAuthorizedUsers';
import { getString } from 'presentation/theme/localization';

import { getFilterFromQueryParam } from './translatePackage.helper';

interface UsePackageDetailSetupProps {
  disableOnSuccessfulTransaction?: boolean;
}

export default function usePackageDetailSetup(
  props: UsePackageDetailSetupProps = {}
) {
  const { disableOnSuccessfulTransaction = false } = props;

  const params = useParams<{ id: string }>();
  const { search } = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);

  const isPackageDetailView = queryParams.has('id');
  const filterValues = getFilterFromQueryParam(queryParams);
  const packageId = queryParams.get('id');
  const { data: lead } = useGetLeadByIDQuery(params.id ?? '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: transactions, isLoading: transactionLoading } =
    useGetSuccessfulTransactionQuery(lead?.name ?? '', {
      skip:
        !lead?.name || !disableOnSuccessfulTransaction || !isPackageDetailView,
    });

  const { isLoading: isAuthorizedUserLoading, isUserAllowed } =
    useAuthorizedUsers(lead?.name);

  const selectedPackageId = lead?.data?.checkout?.package ?? '';
  const orderId = `${getString('text.orderId')}: ${lead?.humanId || ''}`;

  return {
    params,
    queryParams,
    isPackageDetailView,
    filterValues,
    packageId,
    lead,
    transactions,
    transactionLoading,
    isAuthorizedUserLoading,
    isUserAllowed,
    selectedPackageId,
    orderId,
  };
}
