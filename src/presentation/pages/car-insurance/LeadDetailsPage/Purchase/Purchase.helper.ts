import { DocumentType } from 'presentation/components/ActivityOrderSection/Document/config';
import { Lead, LeadStatus } from 'shared/types/lead';

// eslint-disable-next-line import/prefer-default-export
export const isLeadValidForOrder = (lead: Lead) =>
  lead.data?.checkout?.installments &&
  lead.data.checkout.deliveryOption &&
  lead.data.checkout.package;

/** Car purchase is allowed only once lead is in pending payment (payment success path). */
export function carLeadStatusAllowsPurchase(
  status: LeadStatus | undefined
): boolean {
  return status === 'LEAD_STATUS_PENDING_PAYMENT';
}

/** Car lead purchase requires ID card + vehicle registration uploads (lead document list). */
export function carLeadHasRequiredDocumentsForPurchase(
  documents: Array<{ type?: string } | null | undefined> | undefined
): boolean {
  const list = documents?.filter(Boolean) ?? [];
  return (
    list.some((d) => d!.type === DocumentType.DOCUMENT_TYPE_ID_CARD) &&
    list.some(
      (d) => d!.type === DocumentType.DOCUMENT_TYPE_VEHICLE_REGISTRATION
    )
  );
}
