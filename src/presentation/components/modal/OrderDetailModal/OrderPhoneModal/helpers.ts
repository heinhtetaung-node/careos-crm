import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';

import { PhoneResponse } from 'data/slices/customerSlice/types';
import { PhoneNumber } from 'shared/types/customer';

export const isPhoneExists = (
  phonesList: (PhoneResponse | PhoneNumber)[] | undefined,
  phoneToFind: string
) => {
  return {
    object: _find(phonesList, ['phone', phoneToFind]),
    indexOf: _findIndex(phonesList, ['phone', phoneToFind]),
  };
};

export const syncCustomerAndLeadPhones = (
  customerPhones: PhoneResponse[] | undefined,
  phonesFromLead: PhoneNumber[]
) => {
  return (
    customerPhones
      ?.map(({ phone: customerPhone }) => {
        if (isPhoneExists(phonesFromLead, customerPhone)?.object) {
          return false;
        }
        return {
          phone: customerPhone,
          status: 'unverified',
        };
      })
      ?.filter((object) => object !== false) ?? []
  );
};

export default isPhoneExists;
