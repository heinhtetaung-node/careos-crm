import { Button } from '@alphafounders/ui';
import { Grid } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { FOREIGN_LEADS_SOURCES } from 'config/constant';
import FeatureFlags from 'config/flagsmithConfig';
import { useGetSuccessfulTransactionQuery } from 'data/slices/transactionSlice';
import { useFlags } from 'flagsmith/react';
import ActivitySection from 'presentation/components/ActivitySection';
import EditableCarSection from 'presentation/components/CarInfoSection/EditableCarSection/index';
import InsurerInfoSection from 'presentation/components/InsurerInfoSection/InsurerInfoSection';
import AccountCurrentProductSection from 'presentation/components/AccountCurrentProductSection';
import LeadHistoricalData from 'presentation/components/LeadDetails/LeadHistoricalData';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import { useFetchPolicies } from 'presentation/hooks/useFetchPolicies/useFetchPolicies';

import CustomerSection from '../CustomerSection';

interface LeadDetailSectionProps {
  id?: string;
  classes: any;
  carInfo: any;
  isPageDisabled: boolean;
  preferredInsurersList: any;
  isPendingRejection: boolean;
}

function LeadDetailsSections({
  id,
  classes,
  carInfo,
  isPageDisabled,
  isPendingRejection,
  preferredInsurersList,
}: Readonly<LeadDetailSectionProps>) {
  const [openForeignLeadData, setOpenForeignLeadData] = useState(false);
  const [openMatchingLeads, setOpenMatchingLeads] = useState(false);

  const lead = useGetLeadSelector();
  const policiesData = useFetchPolicies(lead);

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

  const disableOnSuccessfulTransaction = false;

  const { data: transactions } = useGetSuccessfulTransactionQuery(
    lead?.name ?? '',
    {
      skip: !lead?.name || !disableOnSuccessfulTransaction,
    }
  );

  const flags = useFlags([
    FeatureFlags.BROK_4125_SHOW_ACCOUNT_CURRENT_PRODUCT_SECTION_20251127_TEMP,
  ]);

  const showAccountCurrentProductSection =
    flags[
      FeatureFlags.BROK_4125_SHOW_ACCOUNT_CURRENT_PRODUCT_SECTION_20251127_TEMP
    ]?.enabled;

  return (
    <Grid
      id={id}
      container
      direction="row"
      data-testid="lead-detail-section"
      className={`${classes.grid} lead-detail-page__boards`}
    >
      <Grid
        className={classes.grid}
        item
        xs={12}
        container
        md={12}
        lg={12}
        xl={8}
        direction="row"
      >
        <Grid
          item
          xs={12}
          md={4}
          lg={4}
          className={`${classes.grid} lead-detail-page__boards__item`}
        >
          <CustomerSection
            isFieldDisabled={isPageDisabled}
            isPendingRejection={isPendingRejection}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          lg={4}
          className={`${classes.grid} lead-detail-page__boards__item`}
        >
          <EditableCarSection
            carData={carInfo}
            isFieldDisabled={
              isPageDisabled || Boolean(transactions?.charges.length)
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          lg={4}
          className={clsx(
            classes.grid,
            'lead-detail-page__boards__item',
            'flex',
            'flex-col'
          )}
        >
          {showAccountCurrentProductSection && (
            <div className="flex-grow">
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
              isFieldDisabled={isPageDisabled}
              isPaymentMade={Boolean(transactions?.charges.length)}
            />
          </div>
        </Grid>
      </Grid>

      <Grid
        item
        xs={12}
        md={12}
        lg={12}
        xl={4}
        className={`${classes.grid} lead-detail-page__boards__activity relative`}
      >
        {!openForeignLeadData && !openMatchingLeads && (
          <ActivitySection isFieldDisabled={isPageDisabled} />
        )}
        {FOREIGN_LEADS_SOURCES.includes(lead.source) && (
          <div className="relative">
            <div
              className={clsx(
                'transition-[display] transition-500 ease-linear',
                {
                  'hidden w-0': !openForeignLeadData,
                  'block w-full': openForeignLeadData,
                }
              )}
            >
              <LeadHistoricalData leadId={lead.name} sourceId={lead.source} />
            </div>
            <Button
              text={getString('text.historicalData')}
              dataTestId="lead--extra--detail-button"
              className={clsx(
                '-rotate-90 px-4 py-2 w-[150px] shadow-closeBtn ml-3 mr-0 text-xs z-20',
                {
                  '-left-[100px] absolute top-[25rem]': openForeignLeadData,
                  '-right-[60px] fixed bottom-[30rem]': !openForeignLeadData,
                }
              )}
              onClick={() => setOpenForeignLeadData(!openForeignLeadData)}
            />
          </div>
        )}
      </Grid>
    </Grid>
  );
}

export default LeadDetailsSections;
