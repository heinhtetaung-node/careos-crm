import { useDispatch } from 'react-redux';

import { useUpdateLeadJsonMutation } from 'data/slices/leadDetailSlices/updateLeadSlice';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getLeadIdFromPath } from 'shared/helper/utilities';

type Address = {
  addressType?: string;
  address?: string;
  province?: any;
  district?: any;
  postCode?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxId?: string;
  subDistrict?: any;
};

type addAddressArgs = {
  shipmentAddressIsSame: boolean;
  billingAddressIsSame: boolean;
  policy: Address;
  shipping: Address;
  billing: Address;
};

export default function useAddAddress() {
  const [updateLead, status] = useUpdateLeadJsonMutation();
  const dispatch = useDispatch();
  const lead = useGetLeadSelector();
  const leadId = getLeadIdFromPath();

  const addAddress = async (addresses: addAddressArgs) => {
    const response = await updateLead({
      leadId,
      payload: [
        {
          op: lead?.data?.customerPolicyAddress?.length > 0 ? 'replace' : 'add',
          path: '/customerPolicyAddress',
          value: [addresses.policy],
        },
        {
          op:
            lead?.data?.customerShippingAddress?.length > 0 ? 'replace' : 'add',
          path: '/customerShippingAddress',
          value: [
            addresses.shipmentAddressIsSame
              ? addresses.policy
              : addresses.shipping,
          ],
        },
        {
          op:
            lead?.data?.customerBillingAddress?.length > 0 ? 'replace' : 'add',
          path: '/customerBillingAddress',
          value: [
            addresses.billingAddressIsSame
              ? addresses.policy
              : addresses.billing,
          ],
        },
      ],
    });
    if ('error' in response) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: (response.error as any).data.message,
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.addAddressSuccessful'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    return response;
  };

  return { addAddress, status };
}
