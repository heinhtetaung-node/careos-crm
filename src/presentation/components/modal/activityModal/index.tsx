import { DownloadFileIcon } from '@alphafounders/icons';
import { Button, Dialog, Grid, makeStyles } from '@material-ui/core';
import * as Icon from '@material-ui/icons';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { showQuotationHistoryButton } from 'config/feature-flags';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { PRODUCTS } from 'config/TypeFilter';

import ActivityTable from './activityTable';
import './index.scss';
import ApprovalHistory from './ApprovalHistory';
import ApplicationFormHistory from './ApplicationFormHistory';
import CommunicationTable from './CommunicationTable';
import { AdminSupervisorRoles } from './CommunicationTable/helper';
import ContractHistory from './ContractHistory';
import PaymentHistory from './PaymentHistory';
import QuotationHistory from './QuotationHistory';

interface IPropsActivityModal {
  openDialog: boolean;
  closeDialog: (isClose: boolean) => void;
  activeId: number;
  isPurchased?: boolean;
}

const useStyles = makeStyles((theme: any) => ({
  active: {
    border: '3px solid !important',
    borderColor: `${theme.palette.primary.main} !important`,
    '&:after': {
      content: '" "',
      position: 'absolute',
      bottom: '-33px',
      right: 'auto',
      width: '15px',
      height: '15px',
      border: '12px solid',
      borderColor: `transparent transparent ${theme.palette.info.main} transparent`,
    },
  },
}));

function ActivityModal({
  openDialog,
  closeDialog,
  activeId,
  isPurchased = false,
}: Readonly<IPropsActivityModal>) {
  const classes = useStyles();
  const { id } = useParams() as { id: string };
  let buttons;

  const [downlaodAllRecordings, setDownlaodAllRecordings] = useState(false);

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const currentUser = useAppSelector((state) => state.authReducer.data.user);

  const ableToSeeDownload = AdminSupervisorRoles.includes(
    currentUser?.role as UserRoleID
  );

  const handleFinishDownload = () => {
    setDownlaodAllRecordings(false);
  };

  const isHealth = useMemo(
    () => globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE,
    [globalProduct]
  );

  if (!showQuotationHistoryButton) {
    buttons = [
      {
        id: 1,
        label: getString('lead.activity'),
        content: <ActivityTable />,
        disableOnPurchased: true,
        testid: 'activity-tab-btn',
      },
      {
        id: 2,
        label: getString('lead.communication'),
        content: <CommunicationTable id={id} />,
        disableOnPurchased: false,
        testid: 'communication-tab-btn',
      },
      {
        id: 3,
        label: getString('lead.assignment'),
        disableOnPurchased: true,
        testid: 'assignment-tab-btn',
      },
      {
        id: 4,
        label: getString('lead.audit'),
        disableOnPurchased: true,
        testid: 'audit-tab-btn',
      },
    ];
  } else {
    buttons = [
      {
        id: 1,
        label: getString('lead.activity'),
        content: <ActivityTable />,
        disableOnPurchased: true,
        testid: 'activity-tab-btn',
      },
      {
        id: 2,
        label: getString('lead.communication'),
        content: <CommunicationTable id={id} />,
        disableOnPurchased: false,
        testid: 'communication-tab-btn',
      },
      {
        id: 3,
        label: getString('lead.quotation'),
        content: <QuotationHistory id={id} />,
        disableOnPurchased: false,
        testid: 'quotation-tab-btn',
      },
    ];
  }

  buttons.push({
    id: buttons.length + 1,
    label: getString('lead.paymentHistory'),
    content: <PaymentHistory id={id} />,
    disableOnPurchased: false,
    testid: 'payment-history-tab-btn',
  });

  buttons.push({
    id: buttons.length + 1,
    label: getString('lead.contractHistory'),
    content: <ContractHistory id={id} />,
    disableOnPurchased: false,
    testid: 'contract-history-tab-btn',
  });

  buttons.push({
    id: buttons.length + 1,
    label: getString('lead.approvalHistory'),
    content: <ApprovalHistory id={id} isHealth={isHealth} />,
    disableOnPurchased: false,
    testid: 'approval-history-tab-btn',
  });

  if (isHealth) {
    buttons.push({
      id: buttons.length + 1,
      label: 'Application Form History',
      content: <ApplicationFormHistory id={id} />,
      disableOnPurchased: false,
      testid: 'application-form-history-btn',
    });
  }

  const [itemActiveId, setItemActiveId] = useState(-1);

  useMemo(() => {
    setItemActiveId(activeId);
  }, [activeId]);

  const itemHandleClick = (button: any) => {
    setItemActiveId(button.id);
  };

  const handleCloseDialog = () => {
    closeDialog(false);
  };

  return (
    <Dialog
      open={openDialog}
      aria-labelledby="form-dialog-title"
      className="activity-modal-wrap shared-common-modal"
    >
      <div className="activity-modal-override">
        <div className="modal-button-close no-background">
          <div className="close-btn">
            <Icon.Close
              onClick={() => handleCloseDialog()}
              data-testid="activity__close-btn"
            />
          </div>
        </div>
        <Grid item container xs={12} md={12} className="activity-modal">
          <Grid item container xs={12} md={12} className="group-button">
            {buttons.map((item) => (
              <Button
                className={clsx(
                  `unittest-button-${item.id}`,
                  `${itemActiveId === item.id ? classes.active : ''}`
                )}
                key={item.id}
                onClick={() => itemHandleClick(item)}
                disabled={isPurchased && item.disableOnPurchased}
                data-testid={item.testid}
              >
                {item.label}
              </Button>
            ))}
            {itemActiveId === 2 && ableToSeeDownload && (
              <Button
                className="w-10 absolute right-0 !mr-8"
                disabled={downlaodAllRecordings}
                onClick={() => setDownlaodAllRecordings(true)}
              >
                <DownloadFileIcon
                  className="button-action mr-2"
                  fontSize="small"
                  data-testid="voice-download-button"
                />
                {getString('text.downloadAllFiles')}
              </Button>
            )}
          </Grid>
          <Grid item container xs={12} md={12}>
            {
              buttons.find(
                (item: any) =>
                  item.id === itemActiveId &&
                  item.label !== getString('lead.communication')
              )?.content
            }

            {buttons.find(
              (item: any) =>
                item.id === itemActiveId &&
                item.label === getString('lead.communication')
            ) && (
              <CommunicationTable
                id={id}
                downlaodAllRecordings={downlaodAllRecordings}
                handleFinishDownload={handleFinishDownload}
              />
            )}
          </Grid>
        </Grid>
      </div>
    </Dialog>
  );
}

export default ActivityModal;
