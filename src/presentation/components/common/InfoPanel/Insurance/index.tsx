import * as React from 'react';
import { useDispatch } from 'react-redux';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useUpdatePolicyMutation } from 'data/slices/orderPolicySlice';
import FormikWrapper from 'presentation/components/common/FormikFields/FormikWrapper';
import { formatMotoType } from 'presentation/components/OrderListingTable/helper';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { CarRepairType, MotoTypes } from 'shared/constants/orderType';
import { satangToBaht } from 'utils/currency';
import { format } from 'utils/datetime';

import { getPackageTypeLabelFromOrderData } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';

import {
  getProductName,
  getDiscountAmount,
  formatAmount,
  items,
  readOnlyItems,
  modifyPolicySaveData,
  getPolicyId,
} from './Insurance.helper';
import validationSchema from './validation';

interface IProps {
  isEditable?: boolean;
  policy?: any;
  insurancePackage?: any;
  orderId?: string;
  policyId?: string;
  editableFields?: string[];
  setFieldsErrors?: React.Dispatch<React.SetStateAction<any>>;
  hiddenFields?: string[];
}

function Insurance({
  isEditable = false,
  policy,
  insurancePackage,
  orderId,
  policyId,
  editableFields,
  setFieldsErrors,
  hiddenFields = [],
}: IProps) {
  const dispatch = useDispatch();
  const [state, setState] = React.useState({
    applicationNumber: policy?.applicationNumber,
    policyStartDate: policy?.policyStartDate,
    adjustedPremium: policy?.adjustedPremium,
    policyNumber: policy?.policyNumber,
    onLoadUpdate: false,
  });
  const { data: user } = useGetAuthenticateQuery();
  const inboundAgent = user?.role === UserRoleID.InboundAgent;
  const accounting = user?.role === UserRoleID.Accounting;
  const isUserEditablePermission = inboundAgent || accounting;

  const [
    updatePolicy,
    {
      isUninitialized,
      isSuccess: updateSuccess,
      data,
      error: updateErrorObject,
    },
  ] = useUpdatePolicyMutation();

  React.useEffect(() => {
    if (policy && !state.onLoadUpdate) {
      setState({
        ...state,
        policyStartDate: policy?.policyStartDate,
        adjustedPremium: policy?.adjustedPremium,
        policyNumber: policy?.policyNumber,
        applicationNumber: policy?.applicationNumber,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policy]);

  React.useEffect(() => {
    if (!isUninitialized && updateSuccess && data) {
      setState({
        ...state,
        policyStartDate: data?.policyStartDate,
        adjustedPremium: data?.adjustedPremium,
        policyNumber: policy?.policyNumber,
        applicationNumber: policy?.applicationNumber,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUninitialized, updateSuccess, data]);

  React.useEffect(() => {
    if (!isUninitialized && updateErrorObject) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updateInsuranceFailed', {
            message: updateErrorObject.toString(),
          }),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else if (!isUninitialized && updateSuccess) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updateInsuranceSuccessfully'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUninitialized, updateSuccess, updateErrorObject]);

  const ownCarDamage =
    policy?.sumInsured && insurancePackage?.sumCoverageMax
      ? Math.min(policy.sumInsured, insurancePackage.sumCoverageMax)
      : undefined;
  const fireAndTheft =
    policy?.motorItemType === MotoTypes.MOTOR_TYPE_1
      ? ownCarDamage
      : insurancePackage?.fireTheftCoverage;

  const { carRepairType } = insurancePackage ?? {};
  const repairTypeText =
    carRepairType &&
    carRepairType !== CarRepairType.CAR_REPAIR_TYPES_UNSPECIFIED
      ? getString(`qc.${carRepairType.toLowerCase()}`)
      : '-';
  const insuranceInitialValues = {
    insurer: insurancePackage?.insurerName ?? '',
    product: policy?.motorItemType ? formatMotoType(policy?.motorItemType) : '',
    applicationNumber: policy?.applicationNumber ?? '',
    insuranceType: getProductName(policy?.product),
    policyNumber: policy?.policyNumber ?? '',
    repairType: repairTypeText,
    packageName: insurancePackage?.displayName ?? '',
    grossPremium: policy?.grossPremium
      ? formatAmount(satangToBaht(policy.grossPremium))
      : '',
    discount: getDiscountAmount(policy?.discount),
    netPremium: policy?.netPremium
      ? formatAmount(satangToBaht(policy.netPremium))
      : '',
    policyDate: policy?.policyStartDate
      ? format(new Date(policy.policyStartDate), 'dd/MM/yyyy')
      : '',
    ownCarDamage: ownCarDamage ? formatAmount(satangToBaht(ownCarDamage)) : '',
    deductibleAmount: insurancePackage?.deductibleAmount
      ? formatAmount(satangToBaht(insurancePackage.deductibleAmount))
      : '',
    fireAndTheft: fireAndTheft ? formatAmount(satangToBaht(fireAndTheft)) : '',
    adjustedPremium: policy?.adjustedPremium
      ? formatAmount(satangToBaht(policy.adjustedPremium))
      : '',
  };

  const handleOrderUpdate = (values: any) => {
    /* istanbul ignore else */
    if (policy && insurancePackage && orderId && policyId) {
      const policyID = getPolicyId(policy.name);
      const passPayload = modifyPolicySaveData(
        orderId,
        policyID,
        values,
        state
      );
      /* istanbul ignore else */
      if (passPayload) {
        updatePolicy(passPayload);
      }
    }
  };
  let customFieldsValidation = null;
  const notEditFields = readOnlyItems;
  if (editableFields && !isUserEditablePermission) {
    notEditFields.forEach((field, key) => {
      if (editableFields.includes(field.name)) {
        customFieldsValidation = validationSchema.pick([field.name] as any);
        notEditFields[key] = {
          ...notEditFields[key],
          isReadOnly: false,
          showAsterisk: true,
        };
      }
    });
  }

  const packageTypeLabel = getPackageTypeLabelFromOrderData(
    insurancePackage?.packageType,
    insurancePackage?.source
  );

  const fields = isEditable
    ? items.filter((item) => !hiddenFields.includes(item.name))
    : notEditFields.filter((item) => !hiddenFields.includes(item.name));

  const insertAfterMap: Record<string, any[]> = {
    insuranceType: [
      {
        title: 'qc.packageType',
        name: 'packageType',
        fieldType: 'text',
        isReadOnly: true,
        dataTestId: 'insurance-package-type',
        display: true,
      },
    ],
  };

  const fieldsWithPackageType = fields.flatMap((field) => [
    field,
    ...(insertAfterMap[field.name] ?? []),
  ]);

  return (
    <FormikWrapper
      title="text.insurancePackageTitle"
      items={fieldsWithPackageType}
      initialValues={{
        ...insuranceInitialValues,
        packageType:
          packageTypeLabel ?? getString('packageListing.packageType.standard'),
      }}
      validationSchema={isEditable ? validationSchema : customFieldsValidation}
      handleUpdate={handleOrderUpdate}
      setFieldsErrors={setFieldsErrors}
    />
  );
}

export default Insurance;
