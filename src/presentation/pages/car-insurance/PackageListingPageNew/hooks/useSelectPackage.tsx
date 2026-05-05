import { useDeleteCouponMutation } from 'data/slices/leadDetailSlices/couponSlice';
import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import { useSelectPackageMutation } from 'data/slices/packageListing/api';
import { Lead } from 'shared/types/lead';
import useSnackbar from 'utils/snackbar';

export const shouldDeleteCoupon = (
  lead: Lead | undefined,
  newInstallment: number | undefined
) => lead?.data?.checkout?.coupon && (newInstallment ?? 0) > 1;

export default function useSelectPackage(leadId: string) {
  const { data: lead } = useGetLeadByIDQuery(leadId);

  const [deleteCoupon] = useDeleteCouponMutation();
  const [_selectPackage, status] = useSelectPackageMutation();

  const { showErrorSnackbar } = useSnackbar();

  const selectPackage = async (
    payload: Parameters<typeof _selectPackage>[0]
  ) => {
    let apiPayload = { ...payload };
    if (shouldDeleteCoupon(lead, payload.payload.installmentPlan)) {
      const vResponse = await deleteCoupon(leadId);
      if ('error' in vResponse) {
        showErrorSnackbar('Error removing voucher');
      }
    }

    apiPayload = {
      ...apiPayload,
      payload: {
        ...apiPayload.payload,
        includeCustomQuote: true,
      },
    };

    const response = await _selectPackage(apiPayload);
    return response;
  };

  return [selectPackage, status] as [typeof selectPackage, typeof status];
}
