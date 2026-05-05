import { format } from 'date-fns';
import { camelCase } from 'lodash';
import { useState, useEffect } from 'react';

import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { documentType } from 'presentation/components/modal/Qc/UpdateDataMyself/helper';
import { Titles } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getString } from 'presentation/theme/localization';

export default function usePolicyHolderInfo(
  resp: OrderDataResponse | undefined, // resp value can be undefined but it is not optional parameter
  isFetching: boolean
) {
  const [policyHolderInfo, setpolicyHolderInfo] = useState({});

  const insuredPerson = resp?.order?.data?.policyHolder; // aka policyHolder
  const { idType, idNumber } = resp?.order?.data ?? {};
  const { isCustomer, isCompany } = insuredPerson ?? {};

  const getPolicyHolderDetail = () => {
    if (isCustomer && !isCompany)
      return getString('qc.customerIsInsuredPerson');
    if (!isCustomer && isCompany) return getString('qc.policyHolderIsCompany');
    if (!isCustomer && !isCompany)
      return getString('qc.customerIsNotInsuredPerson');
    return '';
  };

  useEffect(() => {
    if (!isFetching) {
      const titleValue = Object.values(Titles).find(
        (title) => title === insuredPerson?.title
      );
      const title = titleValue
        ? getString(`policyholderTitle.${camelCase(titleValue)}`)
        : '';
      const policyHolderValue = isCompany
        ? `${insuredPerson?.companyName}, ${insuredPerson?.companyTaxId}`
        : `${title} ${insuredPerson?.firstName} ${insuredPerson?.lastName}`;
      const idTypeOption = documentType.find((type) => type.value === idType);
      const policyHolder: Record<string, any> = {
        [Questions.POLICYHOLDER_DIFFERENTIATION]: getPolicyHolderDetail(),
        [Questions.POLICYHOLDER_NAME_TITLE]: policyHolderValue,
        [Questions.DOB_OF_THE_POLICYHOLDER]: insuredPerson?.dateOfBirth
          ? format(new Date(insuredPerson.dateOfBirth), 'dd/MM/yyyy')
          : '-',
        [Questions.DOCUMENT_TYPE_SPECIFIED]: idTypeOption?.title ?? '-',
        [Questions.CORRECT_ID_NUMBER]: idNumber ?? '-',
      };
      setpolicyHolderInfo(policyHolder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuredPerson, idType, idNumber, isFetching]);

  return policyHolderInfo;
}
