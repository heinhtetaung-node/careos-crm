import { CAR_ROWS } from 'presentation/components/CarInfoSection/EditableCarSection/interface';
import { INSURER_ROWS } from 'presentation/components/InsurerInfoSection/config';
import { CUSTOMER_ROWS } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/Customer/config';
import { POLICYHOLDER_ROWS } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/config';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';

import { createErrorSlice, createSchemaValidator } from '.';

const leadDetailValidator = createSchemaValidator('leadDetailSchemaErrors', {
  dataReducerPath: 'leadsDetailReducer.lead.payload',
});

export const validateLead = leadDetailValidator.validate;

export const { reducer, errorSelectorFn, actions } = createErrorSlice(
  'leadDetailErrors',
  {
    [CUSTOMER_ROWS.firstName]: 'data.customerFirstName',
    [CUSTOMER_ROWS.lastName]: 'data.customerLastName',
    [CUSTOMER_ROWS.dob]: 'data.customerDOB',
    [CUSTOMER_ROWS.gender]: 'data.customerGender',
    [CUSTOMER_ROWS.language]: 'data.locale',

    // health policyholder
    policyHolderOccupation: 'data.policyHolderOccupation',
    policyHolderRace: 'data.policyHolderRace',

    [POLICYHOLDER_ROWS.policyHolderType]: 'data.policyHolderType',
    [POLICYHOLDER_ROWS.policyHolderTitle]: 'data.policyTitle',
    [POLICYHOLDER_ROWS.policyHolderFirstName]: 'data.policyHolderFirstName',
    [POLICYHOLDER_ROWS.policyHolderLastName]: 'data.policyHolderLastName',
    [POLICYHOLDER_ROWS.policyHolderDob]: 'data.policyHolderDOB',
    [POLICYHOLDER_ROWS.policyHolderNationalId]: 'data.policyHolderNationalId',
    [POLICYHOLDER_ROWS.policyHolderPassport]: 'data.policyHolderPassport',
    [POLICYHOLDER_ROWS.policyHolderCompanyName]: [
      'data.customerPolicyAddress[0].companyName',
      'data.customerPolicyAddress',
    ],
    [POLICYHOLDER_ROWS.policyHolderTaxId]: [
      'data.customerPolicyAddress[0].taxId',
      'data.customerPolicyAddress',
    ],
    [POLICYHOLDER_ROWS.noOfFixedDriver]: 'data.numberOfFixedDriver',
    [POLICYHOLDER_ROWS.firstDriverName]: [
      'data.firstDriverDOB',
      'data.firstDriverFirstName',
      'data.firstDriverLastName',
    ],
    [POLICYHOLDER_ROWS.secondDriverName]: [
      'data.secondDriverDOB',
      'data.secondDriverFirstName',
      'data.secondDriverLastName',
    ],
    [INSURER_ROWS.INSURANCE_KIND]: 'data.insuranceKind',
    [INSURER_ROWS.POLICY_START_DATE]: 'data.policyStartDate',
    [INSURER_ROWS.COMPULSORY_POLICY_START_DATE]:
      'data.compulsoryPolicyStartDate',
    [INSURER_ROWS.DELIVERY_OPTION]: [
      'data.checkout.deliveryOption',
      'data.shippingOption',
    ],
    [CAR_ROWS.VEHICLE_COLOR]: 'data.carColor',
    [CAR_ROWS.VEHICLE_ID_NUMBER]: 'data.vehicleIdNumber',
    [CAR_ROWS.CHASSIS_NUMBER]: 'data.chassisNumber',
    [CAR_ROWS.LICENSE_PLATE]: 'data.carLicensePlate',
    [CAR_ROWS.PROVINCE]: 'data.registeredProvince',
    [CAR_ROWS.DRIVING_PURPOSE]: 'data.carUsageType',
    [CAR_ROWS.DASHCAM]: 'data.carDashCam',
    [CAR_ROWS.MODIFICATION]: 'data.carModified',
    [CAR_ROWS.SUB_MODEL]: 'data.carSubModelYear',
    address: [
      'data.customerBillingAddress',
      'data.customerShippingAddress',
      'data.customerPolicyAddress',
      'data.customerPolicyAddress[0].firstName',
      'data.customerPolicyAddress[0].lastName',
      'data.customerPolicyAddress[0].taxId',
      'data.customerPolicyAddress[0].companyName',
    ],
    customerEmail: 'data.customerEmail',
    package: 'data.checkout.package',

    healthCustomerEmail: 'data.customer.emails',
  },
  leadDetailValidator
);

export function useLeadDetailError() {
  const errors = useAppSelector(errorSelectorFn);
  const dispatch = useAppDispatch();
  const setFieldTouch = (field: keyof typeof errors) => {
    dispatch(actions.setFieldError({ key: field, value: undefined }));
  };
  return {
    errors,
    setFieldTouch,
  };
}
