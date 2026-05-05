import _isEmpty from 'lodash/isEmpty';

import { Lead } from 'shared/types/lead';

// eslint-disable-next-line import/prefer-default-export
export function checkIsLeadInvalidForViewPackage(lead: Lead) {
  if (_isEmpty(lead.data?.insuranceKind)) {
    return true;
  }
  if (
    lead.data?.insuranceKind !== 'mandatory' &&
    _isEmpty(lead.data?.voluntaryInsuranceType)
  ) {
    return true;
  }
  if (
    lead.data?.insuranceKind !== 'mandatory' &&
    lead.data?.voluntaryInsuranceType.length === 0
  ) {
    return true;
  }
  return false;
}
