import { skipToken } from '@reduxjs/toolkit/query';
import React, { useEffect, useMemo } from 'react';

import { useGetOriginalOrderQuery } from 'data/slices/leadDetails/originalOrderSlice';
import { useGetLeadSourceQuery } from 'data/slices/sourceSlices/sourceSlices';
import useGetAssignAgent from 'presentation/hooks/useAssignAgent';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import { LEAD_TYPE } from 'shared/constants';
import { mappingLeadType } from 'shared/helper/utilities';
import useSnackbar from 'utils/snackbar';

import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { formValue } from '../helper';
import LinkField from '../LinkField';
import RenderColumn from '../RenderColumn';

interface LeadInfoProps {
  headerSection: React.ReactNode;
  isHealth?: boolean;
}

function LeadInfo({ headerSection, isHealth }: Readonly<LeadInfoProps>) {
  const { showErrorSnackbar } = useSnackbar();

  const lead = useGetLeadSelector();
  const currentUser = useGetUserSelector();
  const isRenewalLead = lead?.type === LEAD_TYPE.RENEWAL;

  const {
    data: originalOrder,
    isLoading,
    isError,
  } = useGetOriginalOrderQuery(isRenewalLead ? lead.name : skipToken);

  const { assignAgent } = useGetAssignAgent(lead.name);

  const { data: leadSourceData } = useGetLeadSourceQuery(
    lead?.source ? { sourceName: lead.source } : skipToken
  );

  const schema = useMemo(() => {
    // lagacy component and data structure
    const _schema = { ...formValue.leadInfo } as any;
    const _data = {
      agentName: `${assignAgent?.firstName ?? '-'} ${
        assignAgent?.lastName ?? ''
      }`,
      id: lead.humanId ?? '-',
      type: getString(mappingLeadType(lead.type)),
      source: leadSourceData?.source ?? '-',
      sundayContactable: lead?.data?.sundayContactable ?? false,
      refId: lead?.reference || '-',
    } as any;
    Object.keys(_schema).forEach((key) => {
      _schema[key].value = _data[key];
    });
    return _schema;
  }, [
    lead?.data?.sundayContactable,
    lead.humanId,
    lead?.reference,
    lead.type,
    assignAgent?.firstName,
    assignAgent?.lastName,
    leadSourceData?.source,
  ]);

  useEffect(() => {
    if (isError) {
      showErrorSnackbar('Error fetching original order');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  return (
    <div className=" mb-3">
      {headerSection}
      <RenderColumn item={schema} isHealth={isHealth} />
      {isRenewalLead ? (
        <LinkField
          title={getString('leadDetailFields.originalOrder')}
          value={originalOrder?.originShortId}
          link={
            currentUser?.role === 'roles/sales'
              ? originalOrder?.url?.replace('orders', 'orders/my-orders')
              : originalOrder?.url
          }
          isLoading={isLoading}
        />
      ) : null}
    </div>
  );
}

export default LeadInfo;
