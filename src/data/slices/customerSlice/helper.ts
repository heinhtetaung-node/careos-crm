import { formatDDMMYYYYHHMMSS } from 'shared/helper/utilities';

import {
  CustomerProfileResponse,
  TransformedCustomerProfiles,
  PhoneResponse,
} from './types';

const transformCustomerProfiles = (payload: CustomerProfileResponse) => {
  const response: TransformedCustomerProfiles['imports'] =
    payload?.customerProfiles?.map((data: any) => ({
      id: data?.customer?.name,
      customerID: data?.customer?.humanId,
      name: `${data?.customer?.firstName} ${data?.customer?.lastName}`,
      phoneNumber: data?.phones?.find(
        (phone: PhoneResponse) => phone?.name === data.customer?.primaryPhoneId
      )?.phone,
      email: data?.emails[(data?.emails?.length as number) - 1]?.email,
      createdOn: formatDDMMYYYYHHMMSS(data?.customer?.createTime),
    }));

  return response;
};

export default transformCustomerProfiles;
