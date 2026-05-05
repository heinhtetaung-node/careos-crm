import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useLazyGetLeadByIDQuery } from 'data/slices/leadSlice';
import { useLazyGetOrderCommentsQuery } from 'data/slices/orderCommentSlice';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';

import { generateInsurerEmailContent } from './helper';

interface EmailContent {
  emailAddress: string;
  emailCcs: string[];
  emailSubject: string;
  emailBody: string;
}

interface UseCopyButtonProps {
  orderPolicy: Record<string, any>;
  orderData: OrderDataResponse | undefined;
  showEmailModal?: boolean;
}

export const useCopyButton = ({
  orderPolicy,
  orderData,
  showEmailModal = false,
}: UseCopyButtonProps) => {
  const { orderId } = useParams();
  const [getLeadById] = useLazyGetLeadByIDQuery();
  const [getOrderComments] = useLazyGetOrderCommentsQuery();
  const { showSuccessSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);

  const handleClick = useCallback(async () => {
    if (!orderId || !orderPolicy || !orderData) return;

    setIsLoading(true);
    setIsError(false);
    try {
      const generatedContent = await generateInsurerEmailContent(
        orderPolicy,
        orderData,
        orderId,
        getLeadById,
        getOrderComments
      );

      if (showEmailModal) {
        setEmailContent(generatedContent);
        setIsEmailModalOpen(true);
      } else {
        await navigator.clipboard.writeText(
          `${generatedContent.emailAddress}\n${generatedContent.emailBody}`
        );
        showSuccessSnackbar(getString('copyPolicy.success'));
      }
    } catch (error) {
      console.error('Error generating email content:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    orderId,
    orderPolicy,
    orderData,
    showEmailModal,
    getLeadById,
    getOrderComments,
    showSuccessSnackbar,
  ]);

  const closeEmailModal = useCallback(() => {
    setIsEmailModalOpen(false);
  }, []);

  return {
    isLoading,
    isError,
    isEmailModalOpen,
    emailContent,
    handleClick,
    closeEmailModal,
  };
};
