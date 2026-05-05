import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { useGetCarBySubModalQuery } from 'data/slices/carSlice';
import { useLazyGetLeadByIDQuery } from 'data/slices/leadSlice';
import { getString } from 'presentation/theme/localization';

import {
  AccordionListWithTable,
  getFormattedLead,
  LEAD_DETAILS_KEYS,
} from '../helper';
import {
  LeadDataType,
  ILeadSectionProps,
  IDataProps,
  ICarDataProps,
} from '../types';
import 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/index.scss';

function LeadSection({ leads, classes }: ILeadSectionProps) {
  const [lead, setLead] = useState<{ [propName: string]: LeadDataType }>({});
  const [expanded, setExpended] = useState<string | false>(false);

  const [fetchLeadById, { isLoading: fetchingLead, data: leadData }] =
    useLazyGetLeadByIDQuery({});

  const { data: carDetails, isLoading: fetchingCarDetails } =
    useGetCarBySubModalQuery(
      leadData?.data?.carSubModelYear && leadData?.data?.registeredProvince
        ? {
            subModelYear: leadData.data.carSubModelYear,
            registeredProvince: leadData.data.registeredProvince,
          }
        : skipToken
    );

  useEffect(() => {
    if (leadData?.name && carDetails) {
      const { brand, model }: ICarDataProps = carDetails;

      let updatedLead = getFormattedLead(leadData, { brand, model });

      if (Object.keys(lead).length) {
        updatedLead = { ...lead, ...updatedLead };
      }
      setLead(updatedLead);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadData, carDetails]);

  const handleFetchData = (id: string) => {
    const isLeadEmpty = Object.keys(lead).length > 0;
    if (!isLeadEmpty || (isLeadEmpty && !lead?.[id])) {
      fetchLeadById(id);
    }
  };

  return (
    <div
      className={clsx({
        [classes.card]: true,
        [classes.overflow]: leads?.length > 7,
        [classes.textCenter]: !leads?.length,
      })}
    >
      {leads?.length ? (
        leads?.map((_lead: IDataProps, index: number) => (
          <AccordionListWithTable
            key={_lead.name}
            data={lead}
            id={_lead.name}
            name={`${getString('lead.tableListing.lead')} ${index + 1}`}
            expanded={expanded}
            handleExpand={setExpended}
            isLoading={fetchingLead || fetchingCarDetails}
            handleGetSelectedData={handleFetchData}
            FILTERED_DETAILS={LEAD_DETAILS_KEYS}
            classes={classes}
          />
        ))
      ) : (
        <p data-testid="no-leads">{getString('text.noLeads')}</p>
      )}
    </div>
  );
}

export default LeadSection;
