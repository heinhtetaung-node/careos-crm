import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React, { PropsWithChildren } from 'react';

interface PaymentSectionProps {
  paymentOption: string;
  action?: React.ReactNode;
  dataTestId?: string;
}

function TableData({
  paymentOption,
  action,
  dataTestId = 'tableData-component',
  children,
}: PropsWithChildren<PaymentSectionProps>) {
  return (
    <Accordion defaultExpanded data-testid={dataTestId}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <div className="flex items-center">
          <span className="pr-2 text-primary text-[16px] font-bold">
            {paymentOption}
          </span>
          {action}
        </div>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

export default TableData;
