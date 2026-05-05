import { PRODUCTS } from 'config/TypeFilter';
import { useUpdateLeadJsonMutation } from 'data/slices/leadDetailSlices/updateLeadSlice';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import useSnackbar from 'utils/snackbar';

export default function useAddEmail() {
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const lead = useGetLeadSelector();
  const [updateLead, status] = useUpdateLeadJsonMutation();

  const addEmail = async (email: string) => {
    const emails = [...(lead?.data?.customerEmail ?? [])];
    const index = emails.indexOf(email);

    if (index === -1) {
      emails.push(email);
    } else {
      showErrorSnackbar(getString('text.emailAlreadyExist'));
      return {};
    }

    const response = await updateLead({
      leadId: getLeadIdFromPath(),
      payload: [
        {
          op: 'add',
          path:
            globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE
              ? '/customer/emails'
              : '/customerEmail',
          value: emails,
        },
      ],
    });

    if ('error' in response) {
      showErrorSnackbar((response.error as any).data.message);
    } else {
      showSuccessSnackbar(getString('text.addEmailSuccess'));
    }

    return response;
  };

  return { addEmail, status };
}
