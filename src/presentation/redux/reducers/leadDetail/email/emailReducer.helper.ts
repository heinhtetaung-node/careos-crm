import _ from 'lodash';

import { emailResponseProps } from 'presentation/redux/actions/leadDetail/email/types';

export const emailUpdater = (
  data: emailResponseProps,
  currentState: {
    emails: emailResponseProps[];
    loading: boolean;
    fileUploadUrl: string;
  }
) => {
  const allEmails = _.cloneDeep(currentState.emails);

  const selectedEmail = _.findIndex(allEmails, { name: data.name });

  allEmails[selectedEmail] = {
    ...currentState.emails[selectedEmail],
    ...data,
  };

  return allEmails;
};

export default emailUpdater;
