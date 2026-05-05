import { Button } from '@alphafounders/ui';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FOREIGN_LEADS_SOURCES } from 'config/constant';
import ActivitySection from 'presentation/components/ActivitySection';
import LeadHistoricalData from 'presentation/components/LeadDetails/LeadHistoricalData';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';

import FeatureFlags from 'config/flagsmithConfig';
import { useFlags } from 'flagsmith/react';
import AccountCurrentProductSection from 'presentation/components/AccountCurrentProductSection';
import { useFetchPolicies } from 'presentation/hooks/useFetchPolicies/useFetchPolicies';
import { BeneficiarySection } from './component/Beneficiary';
import CustomerSection from './component/CustomerSection';
import InsurerInfoSection from './component/InsuranceSection';

interface LeadDetailSectionProps {
  id: string;
  isPageDisabled: boolean;
  preferredInsurersList: any;
  isPendingRejection: boolean;
  isPartiallyDisabled: boolean;
  getStatus: () => any;
}

function LeadDetailsSections({
  id,
  isPageDisabled,
  isPendingRejection,
  preferredInsurersList,
  getStatus,
  isPartiallyDisabled = false,
}: LeadDetailSectionProps) {
  const [openForeignLeadData, setOpenForeignLeadData] = useState(false);
  const [openMatchingLeads, setOpenMatchingLeads] = useState(false);

  useEffect(() => {
    if (openForeignLeadData) {
      setOpenMatchingLeads(false);
    }
  }, [openForeignLeadData]);

  useEffect(() => {
    if (openMatchingLeads) {
      setOpenForeignLeadData(false);
    }
  }, [openMatchingLeads]);

  const navigate = useNavigate();
  const lead = useGetLeadSelector();
  const policiesData = useFetchPolicies(lead);

  const redirectToCustomQuotes = (_leadId?: string) => {
    navigate(`/leads/${_leadId}/custom-quote`);
  };

  const flags = useFlags([
    FeatureFlags.BROK_4125_SHOW_ACCOUNT_CURRENT_PRODUCT_SECTION_20251127_TEMP,
  ]);
  const showAccountCurrentProductSection =
    flags[
      FeatureFlags.BROK_4125_SHOW_ACCOUNT_CURRENT_PRODUCT_SECTION_20251127_TEMP
    ]?.enabled;

  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-2 xl:grid-cols-[70%_30%] gap-2 mt-2"
      data-testid="lead-detail-section"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <CustomerSection
            isPartiallyDisabled={isPartiallyDisabled}
            isFieldDisabled={isPageDisabled}
            isPendingRejection={isPendingRejection}
          />
        </div>

        <div className="grid grid-cols-1">
          <BeneficiarySection
            isFieldDisabled={isPageDisabled && !isPartiallyDisabled}
          />
        </div>

        <div className="flex flex-col gap-4">
          {showAccountCurrentProductSection && (
            <div className="min-h-[200px]">
              <AccountCurrentProductSection
                haveOrders={
                  policiesData?.insuranceProducts
                    ? policiesData.insuranceProducts.length > 0
                    : false
                }
                data={policiesData ?? undefined}
              />
            </div>
          )}

          <div className="flex-grow">
            <InsurerInfoSection
              insurers={preferredInsurersList}
              onRequestQuote={() => redirectToCustomQuotes(id)}
              isFieldDisabled={isPageDisabled}
              getStatus={getStatus}
            />
          </div>
        </div>
      </div>

      <div className="relative">
        {!openForeignLeadData && !openMatchingLeads && (
          <ActivitySection isFieldDisabled={isPartiallyDisabled} />
        )}
        {FOREIGN_LEADS_SOURCES.includes(lead.source) && (
          <div className="relative">
            <div
              className={`transition-all ease-linear ${
                openForeignLeadData ? 'block w-full' : 'hidden w-0'
              }`}
            >
              <LeadHistoricalData leadId={lead.name} sourceId={lead.source} />
            </div>
            <Button
              text={getString('text.historicalData')}
              dataTestId="lead--extra--detail-button"
              className={`-rotate-90 px-4 py-2 w-[150px] shadow-md text-xs z-20 transition-all ${
                openForeignLeadData
                  ? 'absolute top-[25rem] left-[-100px]'
                  : 'fixed bottom-[30rem] right-[-60px]'
              }`}
              onClick={() => setOpenForeignLeadData(!openForeignLeadData)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadDetailsSections;
