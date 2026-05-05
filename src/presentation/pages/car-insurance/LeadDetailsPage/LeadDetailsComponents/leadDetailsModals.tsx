import { Grid } from '@material-ui/core';
import React from 'react';

import NewLeadScheduleModal from 'presentation/components/modal/LeadScheduleModal/NewLeadScheduleModal';
import MessageModal from 'presentation/components/modal/MessageModal/index';

import If from '../CustomerSection/If';

interface LeadDetailModalProps {
  classes: any;
  openMessageModal: boolean;
  openScheduleModal: boolean;
  isPendingRejection: boolean;
  closeModalSchedule: (state: boolean) => void;
  setOpenMessageModal: (state: boolean) => void;
}

function LeadDetailsModals({
  classes,
  openMessageModal,
  openScheduleModal,
  isPendingRejection,
  closeModalSchedule,
  setOpenMessageModal,
}: LeadDetailModalProps) {
  return (
    <div data-testid="lead-detail-modal">
      <Grid className={classes.grid} item xs={12} lg={12}>
        <If condition={openScheduleModal}>
          <NewLeadScheduleModal
            isOpen={openScheduleModal}
            onClose={() => closeModalSchedule(false)}
          />
        </If>
      </Grid>
      <Grid className={classes.grid} item xs={12} lg={12}>
        <MessageModal
          className="jacky-modal"
          openDialog={openMessageModal}
          closeDialog={setOpenMessageModal}
          isPendingRejection={isPendingRejection}
        />
      </Grid>
    </div>
  );
}

export default LeadDetailsModals;
