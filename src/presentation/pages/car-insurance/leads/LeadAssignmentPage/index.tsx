import React from 'react';

import LeadDashBoard from '../LeadDashBoard';
import TABLE_LEAD_TYPE from '../LeadDashBoard/LeadDashBoard.helper';

function LeadAssignmentPage() {
  return (
    <LeadDashBoard
      tableType={TABLE_LEAD_TYPE.LEAD_ASSIGNMENT}
      helmet="Lead Assignment"
    />
  );
}
export default LeadAssignmentPage;
