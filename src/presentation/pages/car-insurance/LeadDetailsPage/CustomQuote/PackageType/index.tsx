import { Paper } from '@material-ui/core';
import clsx from 'clsx';
import { useFormikContext } from 'formik';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import RadioGroup from 'presentation/components/common/RadioGroup/RadioGroup';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { renewalPackageSchema } from 'shared/constants/packageFormFields';

import { getPackageTypes } from './helper';

import { initialCustomQuoteFormData } from '../customQuote.helper';
import CustomQuoteField from '../customQuoteField';
import useManualQuoteRestrictionByInsurerEnabled from 'presentation/hooks/useManualQuoteRestrictionByInsurerEnabled';
import { UserRoles } from 'config/constant';
import { useGetUserSelector } from 'presentation/redux/selectors/user';

interface PackageTypeProps {
  handleChangePackageType: (packageType: string) => void;
  classes?: any;
}

function PackageType({
  classes,
  handleChangePackageType,
}: Readonly<PackageTypeProps>) {
  const { type: leadType, data: leadData } = useGetLeadSelector();
  const dispatch = useDispatch();
  const { values, setFieldValue } =
    useFormikContext<typeof initialCustomQuoteFormData>();
  const location = useLocation();
  const isManualQuoteRestrictionByInsurerEnabled =
    useManualQuoteRestrictionByInsurerEnabled();

  const user = useGetUserSelector();
  const userRole = user?.role;

  const changePackageType = useCallback(
    (packageType: string) => {
      handleChangePackageType(packageType);
      setFieldValue('package_type', packageType);

      if (packageType !== 'RENEWAL') {
        setFieldValue('name', '');
        return;
      }

      const isMissingRequiredFields =
        !leadData.chassisNumber || !leadData.currentInsurer;

      if (isMissingRequiredFields) {
        dispatch(
          showSnackBar({
            isOpen: true,
            message:
              'Cannot create the package. Chassis no. and Current insurer are required.',
            status: CONSTANTS.snackBarConfig.type.error,
          })
        );
      }

      const name = `${leadData?.chassisNumber}_${leadData?.currentInsurer}`;
      setFieldValue('name', name);
    },
    [handleChangePackageType, setFieldValue, leadData, dispatch]
  );

  useEffect(() => {
    if (leadType === 'LEAD_TYPE_RENEWAL') {
      changePackageType(location.state?.fromPackages ? 'STANDARD' : 'RENEWAL');
      setFieldValue('chassisNo', leadData?.chassisNumber);
      setFieldValue(
        'name',
        `${leadData?.chassisNumber}_${leadData?.currentInsurer}`
      );
    } else {
      changePackageType('STANDARD');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadData]);

  const packageTypeOptions = useMemo(() => {
    const options = getPackageTypes(leadType) ?? [];

    const shouldHideStandard =
      isManualQuoteRestrictionByInsurerEnabled &&
      !location.state?.fromPackages &&
      userRole === UserRoles.SALE_ROLE;

    if (!shouldHideStandard) return options;

    return options.filter((option) => option.value !== 'STANDARD');
  }, [leadType, isManualQuoteRestrictionByInsurerEnabled, userRole]);

  useEffect(() => {
    const selectedPackageType = values.package_type;
    const firstAvailablePackageType = packageTypeOptions?.[0]?.value;

    const isCurrentValueHidden =
      selectedPackageType &&
      packageTypeOptions.length > 0 &&
      !packageTypeOptions.some(
        (option) => option.value === selectedPackageType
      );

    if (isCurrentValueHidden && firstAvailablePackageType) {
      changePackageType(firstAvailablePackageType);
    }
  }, [packageTypeOptions, values.package_type, changePackageType]);

  return (
    <Paper elevation={3} className="shared-insurer-info">
      <div className="package-section custom-quote-components">
        <div className="custom-quote-components--headerSection">
          <div
            className={clsx('custom-quote-page__name', classes.titleBackground)}
          >
            <h5
              className={clsx('custom-quote-page__name--text', classes.title)}
            >
              {getString('package.packageTypeTitle')}
            </h5>
          </div>
        </div>
        <RadioGroup
          options={packageTypeOptions}
          name="package_type"
          value={values.package_type}
          onChange={(e) => changePackageType(e.target.value)}
        />
      </div>
      {values.package_type === 'RENEWAL' && (
        <div className="package-section custom-quote-components mt-3">
          <div className="custom-quote-components--headerSection">
            <div
              className={clsx(
                'custom-quote-page__name',
                classes.titleBackground
              )}
            >
              <h5
                className={clsx('custom-quote-page__name--text', classes.title)}
              >
                {getString('package.renewalPackageTitle')}
              </h5>
            </div>
          </div>
          <CustomQuoteField data={renewalPackageSchema()} classes={classes} />
        </div>
      )}
    </Paper>
  );
}

export default PackageType;
