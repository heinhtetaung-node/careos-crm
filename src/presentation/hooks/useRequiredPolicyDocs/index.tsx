import _find from 'lodash/find';
import _matchesProperty from 'lodash/matchesProperty';
import { useEffect } from 'react';

import { useLazyGetPolicyDocsQuery } from 'data/slices/policyDocsSlice';
import { DocumentType } from 'presentation/components/ActivityOrderSection/Document/config';
import ShipmentHelper from 'presentation/components/ActivityOrderSection/helper';

export default function useRequiredPolicyDocs({
  orderId,
  orderPolicy,
}: {
  orderId: string;
  orderPolicy: any;
}) {
  const [getPolicyDocs, { data: { documents: uploadedPolicyDocs = [] } = {} }] =
    useLazyGetPolicyDocsQuery();
  useEffect(() => {
    const _policyId = ShipmentHelper.getPolicyIdFromName(
      orderPolicy?.policy?.name
    ); // using policyId from name(aka order id). can't use policyId which is actually `humanId`
    if (_policyId && orderId) {
      getPolicyDocs({ policyId: _policyId, orderId }, true);
    }
  }, [orderPolicy?.policy?.name, orderId, getPolicyDocs]);
  const isRequiredDocUploaded = !!_find(
    uploadedPolicyDocs,
    _matchesProperty('type', DocumentType.DOCUMENT_TYPE_POLICY)
  );
  return isRequiredDocUploaded;
}
