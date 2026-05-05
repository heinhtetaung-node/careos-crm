import { ArrowLeftIcon } from '@alphafounders/icons';
import {
  Container,
  DisclaimerSection,
  InfoContainer,
  InfoSection,
} from '@alphafounders/ui';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import { addToComparison } from 'data/slices/packageListing';
import Loader from 'presentation/components/Loader';
import NotFound from 'presentation/components/NotFound';
import useAuthorizedUsers from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useAuthorizedUsers';
import { isPackageSelected } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { getPackagesUrl } from 'presentation/routes/Urls';
import { getString } from 'presentation/theme/localization';

import InsurerHeader from './InsurerHeader';
import useGetPackageData from './useGetPackageData';

import useSelectPackage from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useSelectPackage';
import { isHealthLead } from 'presentation/pages/health-insurance/leads/leadDetailsPage/helper';
import { getFilterFromQueryParam } from 'presentation/pages/car-insurance/PackageDetailPage/translatePackage.helper';
import useSnackbar from 'utils/snackbar';
import { showSnackBar } from 'presentation/redux/actions/ui';
import * as CONSTANTS from 'shared/constants';
import { getAgeByBirthday } from '@careos/utils';

function PackageDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const { showErrorSnackbar } = useSnackbar();
  const queryParams = new URLSearchParams(search);
  const leadId = params?.id;
  const isPackageDetailView = queryParams.has('id');
  const filterValues = getFilterFromQueryParam(queryParams);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: lead } = useGetLeadByIDQuery(params.id!);
  const selectedPackageId = lead?.data?.checkout?.package ?? '';
  const age = getAgeByBirthday(lead?.data?.policyHolder?.dob ?? '');

  const {
    packages,
    sumInsuredInfo,
    isLoading: packageLoading,
    otherInfo,
  } = useGetPackageData(
    isPackageDetailView ? [queryParams.get('id') ?? ''] : [],
    filterValues,
    age
  );

  const [packageDetail] = packages;
  const { isLoading: isAuthorizedUserLoading, isUserAllowed } =
    useAuthorizedUsers(lead?.name);

  const [selectPackage, { isLoading: isSelectPackageLoading }] =
    useSelectPackage(params.id!);

  const goBack = () => {
    window.history.back();
  };

  const handleSelect = async () => {
    if (!leadId) {
      return showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
    }
    const selectPackagePayload = {
      leadId: leadId as string,
      payload: {
        selectHealthPackage: {
          installmentPlan:
            otherInfo?.installment || queryParams.get('installmentPlan'),
          paymentOption:
            otherInfo?.paymentOption || queryParams.get('paymentOption'),
          paymentMethod:
            otherInfo?.paymentMethod || queryParams.get('paymentMethod'),
          package: otherInfo?.customPackageResourceName,
        },
      },
    };

    const response = await selectPackage(selectPackagePayload as any);
    if ('error' in response) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('errorMessage.generalErrorMessage'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    return response;
  };

  const handleCompare = () => {
    dispatch(addToComparison({ id: packageDetail.id, maxLimit: 2 }));
    navigate(getPackagesUrl(lead?.name.split('/')[1]));
  };

  if (packageLoading || isAuthorizedUserLoading) {
    return <Loader />;
  }

  if (!packageDetail || !isUserAllowed || !isHealthLead(lead)) {
    return (
      <NotFound
        text={getString('errorPage.packageNotFound')}
        redirectTo={`${isHealthLead(lead) ? '/health' : ''}/leads/${params.id}`}
        btnText={getString('errorPage.goToLead')}
      />
    );
  }

  return (
    <div className="w-full h-full bg-white">
      <Container className="grid grid-cols-4">
        <div>
          <button
            className="py-5 px-2 flex items-center bg-white border-none"
            type="button"
            onClick={goBack}
          >
            <ArrowLeftIcon />
            <span className="ml-2">{getString('text.back')}</span>
          </button>
        </div>
        <div className="col-span-2 text-center pb-20">
          <InsurerHeader
            insurancePackage={packageDetail}
            isDisabled={otherInfo?.customQuoteDetails === null}
            isSelected={
              otherInfo?.customPackageResourceName
                ? isPackageSelected(
                    {
                      ...packageDetail,
                      id: otherInfo?.customPackageResourceName,
                    },
                    selectedPackageId
                  )
                : false
            }
            isSelectedForComparison={false}
            onSelect={handleSelect}
            isSelectLoading={isSelectPackageLoading}
            onCompare={handleCompare}
            showButtons
          />
          <br />
          <br />
          <br />
          <br />
          <InfoContainer>
            {packageDetail.details?.map((section) => (
              <InfoSection key={section.title} data={section as any} />
            ))}
            <DisclaimerSection
              listStyleImage={`${process.env.PUBLIC_URL}/static/img/rabbit-heart-logo.svg`}
              title={getString('remark.title')}
              description={getString('remark.description')}
            />
          </InfoContainer>
        </div>
      </Container>
    </div>
  );
}

export default PackageDetailPage;
