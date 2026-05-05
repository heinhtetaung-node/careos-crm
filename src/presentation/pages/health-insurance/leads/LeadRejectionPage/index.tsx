import LeadDashBoard from 'presentation/pages/car-insurance/leads/LeadDashBoard';
import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import React from 'react';

function LeadRejectionPage() {
  return (
    <LeadDashBoard
      tableType={TABLE_LEAD_TYPE.LEAD_REJECTION}
      helmet="Lead Rejection"
    />
  );
}
export default LeadRejectionPage;
