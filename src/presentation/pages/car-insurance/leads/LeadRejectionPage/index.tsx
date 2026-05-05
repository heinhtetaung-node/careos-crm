import React from 'react';

import LeadDashBoard from '../LeadDashBoard';
import TABLE_LEAD_TYPE from '../LeadDashBoard/LeadDashBoard.helper';

function LeadRejectionPage() {
  return (
    <LeadDashBoard
      tableType={TABLE_LEAD_TYPE.LEAD_REJECTION}
      helmet="Lead Rejection"
    />
  );
}
export default LeadRejectionPage;
