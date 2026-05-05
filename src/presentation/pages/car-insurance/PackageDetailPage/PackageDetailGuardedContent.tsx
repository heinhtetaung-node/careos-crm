import React from 'react';

import NotFound from 'presentation/components/NotFound';
import { isMotorLead } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { isHealthLead } from 'presentation/pages/health-insurance/leads/leadDetailsPage/helper';
import { getString } from 'presentation/theme/localization';
import { ArrowLeftIcon, DownloadFileIcon } from '@alphafounders/icons';
import {
  Button,
  Container,
  DisclaimerSection,
  InfoContainer,
  InfoLeadCar,
  InfoSection,
} from '@alphafounders/ui';
import { CircularProgress } from '@material-ui/core';
import InsurerHeader from './InsurerHeader';
import useTranslatePackageData from './useTranslatePackageData';

interface PackageDetailGuardedContentProps {
  lead: any;
  leadId?: string;
  isUserAllowed: boolean;
  hasTransactions: boolean;
  packageDetail: any;
  orderId: string;
  carDetails: any;
  translatedPackageData: ReturnType<typeof useTranslatePackageData>;
  onGoBack: () => void;
  onSelect: () => void;
  onCompare: () => void;
  onDownloadQuotation: () => void;
  isSelectLoading: boolean;
  isDownloadLoading: boolean;
  isSelected: boolean;
  isSelectedForComparison: boolean;
  showButtons: boolean;
}

export default function PackageDetailGuardedContent({
  lead,
  leadId,
  isUserAllowed,
  hasTransactions,
  packageDetail,
  orderId,
  carDetails,
  translatedPackageData,
  onGoBack,
  onSelect,
  onCompare,
  onDownloadQuotation,
  isSelectLoading,
  isDownloadLoading,
  isSelected,
  isSelectedForComparison,
  showButtons,
}: Readonly<PackageDetailGuardedContentProps>) {
  if (
    !packageDetail ||
    !isUserAllowed ||
    (!isMotorLead(lead) && !isHealthLead(lead)) ||
    hasTransactions
  ) {
    return (
      <NotFound
        text={getString('errorPage.packageNotFound')}
        redirectTo={`${isHealthLead(lead) ? '/health' : ''}/leads/${leadId}`}
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
            onClick={onGoBack}
          >
            <ArrowLeftIcon />
            <span className="ml-2">{getString('text.back')}</span>
          </button>
        </div>
        <div className="col-span-2 text-center pb-20">
          <InsurerHeader
            insurancePackage={packageDetail}
            isSelected={isSelected}
            isSelectedForComparison={isSelectedForComparison}
            onSelect={onSelect}
            isSelectLoading={isSelectLoading}
            onCompare={onCompare}
            showButtons={showButtons}
          />
          {packageDetail?.insuranceKind === 'both' ? (
            <div>
              <p className="my-1 text-success font-bold">
                {getString('packageListing.includingCompulsoryPrice')}
              </p>
            </div>
          ) : null}
          <br />
          <br />
          <InfoLeadCar
            title={`${getString('packageListing.showingPackageDetailsFor')}:`}
            orderId={orderId}
            carDetails={carDetails || null}
          />
          <Button
            dataTestId="downloadQuotationButton-packageDetailPage"
            text={
              isDownloadLoading ? (
                <CircularProgress color="inherit" size={24} />
              ) : (
                getString('packageListing.downloadQuotation')
              )
            }
            onClick={onDownloadQuotation}
            icon={<DownloadFileIcon className="mr-2" />}
            variant="secondary"
            className="p-2 m-3 text-base mx-auto h-[25px] min-w-[190px] hover:bg-primary-light"
            disabled={isDownloadLoading}
          />
          <br />
          <br />
          <InfoContainer>
            {translatedPackageData.map((section) => (
              <InfoSection key={section.key} data={section} />
            ))}
            <DisclaimerSection
              listStyleImage={`${process.env.PUBLIC_URL}/static/img/rabbit-heart-logo.svg`}
              title={getString('remark.title')}
              description={getString('remark.description')}
            />
          </InfoContainer>
          <Button
            dataTestId="downloadQuotationButton-packageDetailPage"
            text={
              isDownloadLoading ? (
                <CircularProgress color="inherit" size={24} />
              ) : (
                getString('packageListing.downloadQuotation')
              )
            }
            onClick={onDownloadQuotation}
            icon={<DownloadFileIcon className="mr-2" />}
            variant="secondary"
            className="p-2 m-3 text-base mx-auto mt-10 h-[25px] min-w-[190px] hover:bg-primary-light"
            disabled={isDownloadLoading}
          />
        </div>
      </Container>
    </div>
  );
}
