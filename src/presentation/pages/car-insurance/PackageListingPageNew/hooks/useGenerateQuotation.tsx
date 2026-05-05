import { useGenerateQuotationMutation } from 'data/slices/packageListing';
import { showSnackBar } from 'presentation/redux/actions/ui';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import * as CONSTANTS from 'shared/constants';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

// Support for new api payload. LEAD_2144_INTEGRATE_DISCOUNT_AND_PRICING_ENGINE_20230324_TEMP
type UpdatedParams = {
  package: string;
  insuranceKind: string;
  sumInsuredMax?: number | string;
  sumInsuredMin?: number | string;
  paymentOption?: string;
  paymentMethod?: string;
  installmentPlan?: number;
};

type CarInsurancePackageFilterProps = {
  filters: UpdatedParams[];
};

interface GenerateLinkProps {
  leadId: string;
  carInsurancePackageFilter?: CarInsurancePackageFilterProps;
  carInsuranceQuotationFilter?: CarInsurancePackageFilterProps;
}

export default function useGenerateQuotation() {
  const dispatch = useAppDispatch();
  const product = useAppSelector(
    (state) =>
      state.typeSelectorReducer.globalProductSelectorReducer?.data || ''
  );
  const [generateQuotationMutation, { isLoading }] =
    useGenerateQuotationMutation();

  const generateQuotation = async ({ leadId, ...rest }: GenerateLinkProps) => {
    const response: any = await generateQuotationMutation({
      payload: {
        product,
        lead: leadId,
        includeCustomQuote: true,
        includeShipmentFee: true,
        ...rest,
      },
    });

    /* istanbul ignore next */
    if (response?.error) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: response?.error?.data?.message,
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }

    if (response?.data?.document) {
      downloadFileFromBlobURL(response.data.document);
    }
  };
  return { generateQuotation, isLoading };
}
