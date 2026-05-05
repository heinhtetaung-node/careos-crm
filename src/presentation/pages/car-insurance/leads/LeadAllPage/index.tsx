import React from 'react';

import LeadDashBoard from '../LeadDashBoard';
import TABLE_LEAD_TYPE from '../LeadDashBoard/LeadDashBoard.helper';

function LeadAllPage() {
  return (
    <LeadDashBoard tableType={TABLE_LEAD_TYPE.LEAD_ALL} helmet="All Leads" />
  );
}
export default LeadAllPage;
