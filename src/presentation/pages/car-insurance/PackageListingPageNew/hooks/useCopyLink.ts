import { useGenerateLinkMutation } from 'data/slices/packageListing';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import copyTextToClipboard from 'utils/copyClipboard';
import useSnackbar from 'utils/snackbar';

// Support for new api payload.
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

interface CopyLinkProps {
  lead: string;
  action: 'details' | 'comparison';
  carInsurancePackageFilter?: CarInsurancePackageFilterProps;
}

const useCopyLink = () => {
  const [generateLink, { isLoading }] = useGenerateLinkMutation();
  const product = useAppSelector(
    (state) =>
      state.typeSelectorReducer.globalProductSelectorReducer?.data || ''
  );

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const copyLink = async ({ lead, action, ...rest }: CopyLinkProps) => {
    const response = await generateLink({
      payload: {
        lead,
        action,
        product,
        ...rest,
        includeCustomQuote: true,
      },
    });

    if ('data' in response) {
      try {
        const copySuccess = copyTextToClipboard(response.data?.url);

        if (copySuccess) {
          showSuccessSnackbar(getString('clipboard.success'));
        } else {
          showErrorSnackbar(getString('clipboard.failure'));
        }
      } catch (e) {
        const err = e as Error;
        showErrorSnackbar(getString('clipboard.failure'));
        newrelic?.noticeError?.(err);
      }
    } else {
      showErrorSnackbar(getString('clipboard.apiFailure'));
    }
  };

  return {
    copyLink,
    isGeneratingLink: isLoading,
  };
};

export default useCopyLink;
