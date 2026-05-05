import { useMemo } from 'react';

import {
  useCreatePhoneNumberMutation,
  useLazyGetCustomerPhoneNumberQuery,
  useUpdateCustomerMutation,
} from 'data/slices/customerSlice';
import { useUpdateLeadJsonMutation } from 'data/slices/leadDetailSlices/updateLeadSlice';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromLeadName } from 'shared/helper/utilities';
import useSnackbar from 'utils/snackbar';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

export default function useAddPhone() {
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const isHealthProduct = useMemo(
    () => globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE,
    [globalProduct]
  );

  const lead = useGetLeadSelector();
  const leadId = useMemo(() => getLeadIdFromLeadName(lead.name), [lead]);

  const [updateLead, { isLoading: isLeadUpdating, ...leadStatus }] =
    useUpdateLeadJsonMutation();
  const [updateCustomer, { isLoading: isCustomerUpdating }] =
    useUpdateCustomerMutation();
  const [createPhoneNumber, { isLoading: isCreatingCustomerPhone }] =
    useCreatePhoneNumberMutation();
  const [getCustomerPhones, { isLoading: isGettingCustomerPhones }] =
    useLazyGetCustomerPhoneNumberQuery();

  const addPhone = async (phone: string, isPrimary = false) => {
    const phoneNumbers = [...(lead?.data?.customerPhoneNumber ?? [])];
    const index = phoneNumbers.findIndex((x: any) => x.phone === phone);

    if (index === -1) {
      phoneNumbers.push({
        phone,
        status: 'unverified',
      });
      phoneNumbers.push(phoneNumbers.splice(index, 1)[0]);
    } else {
      showErrorSnackbar(getString('text.phoneAlreadyExist'));
      return {};
    }

    const response = await updateLead({
      leadId,
      payload: [
        {
          op: 'add',
          path: isHealthProduct
            ? '/customer/phoneNumbers'
            : '/customerPhoneNumber',
          value: phoneNumbers,
        },
      ],
    });
    if ('error' in response) {
      showErrorSnackbar((response.error as any)?.data?.message);
    } else {
      showSuccessSnackbar(getString('text.addPhoneSuccess'));
    }
    if (isPrimary) {
      await updateLead({
        leadId,
        payload: [
          {
            op: 'add',
            path: isHealthProduct
              ? '/customer/primaryPhoneIndex'
              : '/primaryPhoneIndex',
            value: phoneNumbers.length - 1,
          },
        ],
      });
    }
    return response;
  };

  const setPrimaryPhoneIndex = async (phoneIndex: number) => {
    const response = await updateLead({
      leadId,
      payload: [
        {
          op: 'add',
          path: isHealthProduct
            ? '/customer/primaryPhoneIndex'
            : '/primaryPhoneIndex',
          value: phoneIndex,
        },
      ],
    });
    if ('error' in response) {
      showErrorSnackbar((response.error as any)?.data?.message);
    }
    return response;
  };

  const removePhoneFromLead = async (phone: string, onSuccess: () => void) => {
    const primaryPhone =
      lead?.data?.customerPhoneNumber[lead?.data?.primaryPhoneIndex].phone;

    const phoneNumbers = [...(lead?.data?.customerPhoneNumber ?? [])].filter(
      (x: any) => x.phone !== phone
    );

    // primary phone number should not be deleted
    if (primaryPhone === phone || !phoneNumbers.length) {
      showErrorSnackbar(getString('text.cantDeletePrimaryPhone'));
      return {};
    }

    try {
      await updateLead({
        leadId,
        payload: [
          {
            op: 'replace',
            path: isHealthProduct
              ? '/customer/phoneNumbers'
              : '/customerPhoneNumber',
            value: phoneNumbers,
          },
        ],
      });

      const { primary: newPrimaryPhoneIndex } = (
        lead?.data?.customerPhoneNumber ?? []
      ).reduce(
        (res: { phones: string[]; primary: number }, p: { phone: string }) =>
          p?.phone === phone
            ? res
            : {
                phones: [...res.phones, p.phone],
                primary:
                  p.phone === primaryPhone ? res.phones.length : res.primary,
              },
        { phones: [] as string[], primary: -1 }
      );

      if (newPrimaryPhoneIndex !== lead?.data?.primaryPhoneIndex) {
        setPrimaryPhoneIndex(newPrimaryPhoneIndex);
      }

      showSuccessSnackbar(getString('text.removePhoneSuccess'));
      onSuccess();
      return {};
    } catch (error) {
      showErrorSnackbar((error as any)?.data?.message);
      return {};
    }
  };

  const setPrimaryPhoneForCustomer = async (
    phoneNumber: string,
    customerId: string
  ) => {
    let decodedPhone = phoneNumber;
    try {
      decodedPhone = decodeURIComponent(phoneNumber);
    } catch {
      decodedPhone = phoneNumber;
    }

    const { phones: customerPhones = [] } =
      (await getCustomerPhones({
        customerName: customerId,
        filter: `phone:"${decodedPhone}"`,
      }).unwrap()) ?? {};

    let primaryPhoneId =
      customerPhones.length > 0
        ? (customerPhones.slice(-1)[0]?.name ?? '')
        : '';

    if (!primaryPhoneId) {
      try {
        const created = await createPhoneNumber({
          phone: decodedPhone,
          customerName: customerId,
        }).unwrap();
        primaryPhoneId = created?.name ?? '';
      } catch (e) {
        showErrorSnackbar((e as any)?.data?.message ?? String(e));
        return {};
      }
    }

    if (!primaryPhoneId) {
      return {};
    }

    return updateCustomer({
      customerId,
      payload: {
        primaryPhoneId,
      },
    });
  };

  return {
    addPhone,
    removePhoneFromLead,
    setPrimaryPhoneIndex,
    setPrimaryPhoneForCustomer,
    status: {
      ...leadStatus,
      isLoading:
        isLeadUpdating ||
        isGettingCustomerPhones ||
        isCustomerUpdating ||
        isCreatingCustomerPhone,
    },
  };
}
