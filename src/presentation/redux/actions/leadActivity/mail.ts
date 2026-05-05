import { IAction } from 'shared/interfaces/common';

import { LeadActivityTypes } from '.';

interface ISubLeadMailUpdate {
  leadName: string;
  isApiCallForUnreadMailCountDisabled: boolean;
}

const subscribeLeadMailUpdates = (
  payload: ISubLeadMailUpdate
): IAction<any> => ({
  type: LeadActivityTypes.SUBSCRIBE_LEAD_MAIL_UPDATES,
  payload,
});

export default subscribeLeadMailUpdates;
