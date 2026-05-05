import { Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';

import { showQuotationHistoryButton } from 'config/feature-flags';
import ActivityModal from 'presentation/components/modal/activityModal';

import { getString } from '../../theme/localization';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

interface ButtonRowProps {
  isPurchased?: boolean;
}

export default function ButtonRow({ isPurchased = false }: ButtonRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const isHealth = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  const buttons = [
    {
      id: 1,
      label: getString('lead.activity'),
      disableOnPurchase: true,
      testid: 'activity-btn',
      type: 'activity',
    },
    {
      id: 2,
      label: getString('lead.communication'),
      disableOnPurchase: false,
      testid: 'communication-btn',
      type: 'activity',
    },
  ];

  if (showQuotationHistoryButton) {
    buttons.push({
      id: 3,
      label: getString('lead.quotation'),
      disableOnPurchase: false,
      testid: 'quotation-btn',
      type: 'activity',
    });
  } else {
    buttons.push(
      {
        id: 3,
        label: getString('lead.assignment'),
        disableOnPurchase: true,
        testid: 'assignment-btn',
        type: 'activity',
      },
      {
        id: 4,
        label: getString('lead.audit'),
        disableOnPurchase: true,
        testid: 'audit-btn',
        type: 'activity',
      }
    );
  }
  buttons.push({
    id: buttons.length + 1,
    label: getString('lead.paymentHistory'),
    disableOnPurchase: false,
    testid: 'payment-history-btn',
    type: 'payment',
  });
  buttons.push({
    id: buttons.length + 1,
    label: getString('lead.contractHistory'),
    disableOnPurchase: false,
    testid: 'contract-history-btn',
    type: 'payment',
  });
  buttons.push({
    id: buttons.length + 1,
    label: getString('lead.approvalHistory'),
    disableOnPurchase: false,
    testid: 'approval-history-btn',
    type: 'payment',
  });
  if (isHealth) {
    buttons.push({
      id: buttons.length + 1,
      label: getString('lead.applicationFormHistory'),
      disableOnPurchase: false,
      testid: 'application-form-history-btn',
      type: 'payment',
    });
  }

  const [itemActiveId, setItemActiveId] = useState(0);

  const itemHandleClick = (button: any) => {
    setIsOpen(true);
    setItemActiveId(button.id);
  };

  const useStyles = makeStyles((theme) => ({
    container: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: theme.spacing(4),
    },
  }));
  const classes = useStyles();
  const setIsAddLeadSuccess = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <div
        className={classes.container}
        data-testid="activity-section-button-row"
      >
        <div className="w-full flex flex-wrap gap-2">
          <div className="w-auto flex gap-2" data-testid="activity-buttons">
            {buttons
              .filter((item) => item.type === 'activity')
              .map((item) => (
                <Button
                  variant="outlined"
                  color="primary"
                  key={item.id}
                  onClick={() => itemHandleClick(item)}
                  className="h-auto px-4 py-2"
                  disabled={isPurchased && item.disableOnPurchase}
                  data-testid={item.testid}
                >
                  {item.label}
                </Button>
              ))}
          </div>
          <div
            className="w-auto flex gap-2 flex-wrap"
            data-testid="payment-buttons"
          >
            {buttons
              .filter((item) => item.type === 'payment')
              .map((item) => (
                <Button
                  variant="outlined"
                  color="primary"
                  key={item.id}
                  onClick={() => itemHandleClick(item)}
                  className="h-auto px-4 py-2 whitespace-nowrap"
                  disabled={isPurchased && item.disableOnPurchase}
                  data-testid={item.testid}
                >
                  {item.label}
                </Button>
              ))}
          </div>
        </div>
      </div>

      <Grid item xs={12} lg={12}>
        <ActivityModal
          openDialog={isOpen}
          closeDialog={() => setIsAddLeadSuccess()}
          activeId={itemActiveId}
          isPurchased={isPurchased}
        />
      </Grid>
    </div>
  );
}
