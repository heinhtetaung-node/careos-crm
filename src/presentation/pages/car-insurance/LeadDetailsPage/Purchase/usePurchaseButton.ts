import { useFlags } from 'flagsmith/react';
import { useCallback, useState } from 'react';

import { UserRoles } from 'config/constant';
import FeatureFlags from 'config/flagsmithConfig';
import { PRODUCTS } from 'config/TypeFilter';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import {
  useCreateCustomerEmailMutation,
  useCreateNewCustomerMutation,
  useCreatePhoneNumberMutation,
  useLazyGetConnectedLeadsQuery,
  useLazyGetUserFromPhoneNumberQuery,
  useUpdateCustomerMutation,
} from 'data/slices/customerSlice';
import { validateLead } from 'data/slices/errorSlice/leadDetailError';
import { useCreateOrderMutation } from 'data/slices/leadDetailSlices/createOrderSlice';
import { useConnectLeadToCustomerMutation } from 'data/slices/leadSlice';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { handleGenericStructureError } from 'shared/helper/ErrorHelper';
import { Lead } from 'shared/types/lead';
import { createOrderSchema } from 'shared/validators/orderCreationValidator';
import useSnackbar from 'utils/snackbar';

import {
  carLeadHasRequiredDocumentsForPurchase,
  carLeadStatusAllowsPurchase,
} from './Purchase.helper';

interface UsePurchaseButtonParams {
  lead: Lead;
}

const isError = (res: any): res is { error: any } => 'error' in res;

export default function usePurchaseButton({
  lead,
}: Readonly<UsePurchaseButtonParams>) {
  const flags = useFlags([
    FeatureFlags.BROK_782_ALLOW_ONLY_SALES_AGENT_TO_PURCHASE_29102024_TEMP,
  ]);

  const allowOnlySalesAgentToPurchase = Boolean(
    flags[
      FeatureFlags.BROK_782_ALLOW_ONLY_SALES_AGENT_TO_PURCHASE_29102024_TEMP
    ]?.enabled
  );

  const { data: user } = useGetAuthenticateQuery();
  const dispatch = useAppDispatch();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [connectLeadToCustomer] = useConnectLeadToCustomerMutation();
  const [triggerConnectedLeads] = useLazyGetConnectedLeadsQuery();
  const [triggerUsersFromPhone] = useLazyGetUserFromPhoneNumberQuery();
  const [createCustomer] = useCreateNewCustomerMutation();
  const [createCustomerPhone] = useCreatePhoneNumberMutation();
  const [createCustomerEmail] = useCreateCustomerEmailMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const [isMappingLoading, setIsMappingLoading] = useState(false);

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const uploadedLeadDocuments = useAppSelector(
    (state) => state.leadsReducer.createDocumentReducer.documents ?? []
  );

  const isHealthProduct = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  const primaryPhone =
    lead?.data?.customerPhoneNumber?.[lead?.data?.primaryPhoneIndex ?? 0]
      ?.phone;

  const showUpdateError = useCallback(
    () => showErrorSnackbar(getString('text.updateLeadFail')),
    [showErrorSnackbar]
  );

  const assertLeadValidForOrder = useCallback(async (): Promise<boolean> => {
    if (!lead?.name) return false;

    try {
      await dispatch(
        validateLead(createOrderSchema(isHealthProduct) as any)
      ).unwrap();
    } catch {
      return false;
    }

    if (!isHealthProduct && !carLeadStatusAllowsPurchase(lead.status)) {
      showErrorSnackbar(
        getString('errors.carPurchaseRequiresPendingPaymentStatus')
      );
      return false;
    }

    if (
      !isHealthProduct &&
      !carLeadHasRequiredDocumentsForPurchase(uploadedLeadDocuments)
    ) {
      showErrorSnackbar(getString('errors.carPurchaseRequiredDocuments'));
      return false;
    }

    return true;
  }, [
    dispatch,
    isHealthProduct,
    lead?.name,
    lead.status,
    showErrorSnackbar,
    uploadedLeadDocuments,
  ]);

  const submitCreateOrder = useCallback(async () => {
    if (!lead?.name) return;

    const response = await createOrder({
      leadId: lead.name,
      form: { includeCustomQuote: true },
    });

    if (isError(response)) {
      const errorData = (response as any)?.error?.data;
      const errorDetailResponse = errorData?.details;
      const errorResponse = errorData?.message;

      const errorMessage: string[] = handleGenericStructureError(
        errorResponse ? [{ reason: errorResponse }] : errorDetailResponse
      );

      showErrorSnackbar(errorMessage.join('. '));
      return;
    }

    showSuccessSnackbar('text.createOrderSuccess');
  }, [createOrder, lead?.name, showErrorSnackbar, showSuccessSnackbar]);

  const connectLead = useCallback(
    async (customerName: string) => {
      if (!lead?.name) return false;

      const response = await connectLeadToCustomer({
        customerId: customerName,
        lead: lead.name,
      });

      if (isError(response)) {
        showUpdateError();
        return false;
      }

      return true;
    },
    [connectLeadToCustomer, lead?.name, showUpdateError]
  );

  const createAndConnectCustomer = useCallback(async () => {
    const firstName = lead?.data?.customerFirstName;
    const lastName = lead?.data?.customerLastName;

    if (!firstName || !lastName) {
      showErrorSnackbar(getString('text.nameIsMissing'));
      return false;
    }

    const createdCustomerResp = await createCustomer({
      firstName,
      lastName,
      createBy: user?.name ?? '',
      gender: lead?.data?.customerGender?.toUpperCase(),
      dateOfBirth: lead?.data?.customerDOB
        ? new Date(lead.data.customerDOB).toISOString()
        : undefined,
    });

    if (isError(createdCustomerResp) || !createdCustomerResp?.data?.name) {
      showUpdateError();
      return false;
    }

    const customerName = createdCustomerResp.data.name;

    const phonePromise = primaryPhone
      ? createCustomerPhone({ phone: primaryPhone, customerName })
      : null;

    const emailPromise = lead?.data?.customerEmail?.[0]
      ? createCustomerEmail({
          email: lead.data.customerEmail[0],
          customerName,
        })
      : null;

    if (phonePromise) {
      const phoneResp = await phonePromise;
      if (isError(phoneResp) || !(phoneResp as any)?.data?.name) {
        showUpdateError();
        return false;
      }

      const updateResp = await updateCustomer({
        customerId: customerName,
        payload: {
          primaryPhoneId: (phoneResp as any).data.name,
        },
      });

      if (isError(updateResp)) {
        showUpdateError();
        return false;
      }
    }

    if (emailPromise) {
      await emailPromise;
    }

    return connectLead(customerName);
  }, [
    connectLead,
    createCustomer,
    createCustomerEmail,
    createCustomerPhone,
    lead,
    primaryPhone,
    showErrorSnackbar,
    showUpdateError,
    updateCustomer,
    user?.name,
  ]);

  const ensureCustomerMapped = useCallback(async () => {
    setIsMappingLoading(true);

    try {
      const connectedRes = await triggerConnectedLeads({
        leadId: lead.name,
        currentCustomer: lead,
      });

      if (isError(connectedRes)) {
        showUpdateError();
        return false;
      }

      if (connectedRes.data?.customer?.name) {
        return true;
      }

      const leadCandidates = connectedRes.data?.leads ?? [];

      if (!leadCandidates.length || !primaryPhone) {
        return createAndConnectCustomer();
      }

      const usersRes = await triggerUsersFromPhone({
        phones: leadCandidates,
      });

      if (isError(usersRes)) {
        showUpdateError();
        return false;
      }

      const customers = usersRes.data?.customers ?? [];

      if (customers.length === 0) {
        return createAndConnectCustomer();
      }

      if (customers.length === 1) {
        return connectLead(customers[0].name);
      }

      return createAndConnectCustomer();
    } finally {
      setIsMappingLoading(false);
    }
  }, [
    connectLead,
    createAndConnectCustomer,
    lead,
    primaryPhone,
    showUpdateError,
    triggerConnectedLeads,
    triggerUsersFromPhone,
  ]);

  const handleCreateOrder = useCallback(async () => {
    if (allowOnlySalesAgentToPurchase && user?.role !== UserRoles.SALE_ROLE) {
      showErrorSnackbar(getString('errors.purchaseBySalesAgentOnly'));
      return;
    }

    if (!(await assertLeadValidForOrder())) {
      return;
    }

    const isMapped = await ensureCustomerMapped();

    if (!isMapped) return;

    await submitCreateOrder();
  }, [
    allowOnlySalesAgentToPurchase,
    assertLeadValidForOrder,
    ensureCustomerMapped,
    showErrorSnackbar,
    submitCreateOrder,
    user?.role,
  ]);

  return {
    isButtonLoading: isLoading || isMappingLoading,
    handleCreateOrder,
  };
}
