import { Paper } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFlags } from 'flagsmith/react';

import FeatureFlags from 'config/flagsmithConfig';
import { getListInsurer } from 'presentation/redux/actions/leadDetail/insurer';
import { getString } from 'presentation/theme/localization';
import {
  packageFields,
  packageSchema,
} from 'shared/constants/packageFormFields';
import { ISelectOptions } from 'shared/interfaces/common/lead/package';

import {
  addSelectInsurersCompanyOptions,
  customSelectInsurersCompany,
  getTitle,
  LIST_INSURERS_PAGE_SIZE,
} from '../customQuote.helper';
import CustomQuoteField from '../customQuoteField';

interface PackageProps {
  classes?: any;
  updatedPackageType?: string;
}

const MANUAL_PKG_EXCLUDED_INSURERS = [
  'insurers/52',
  'insurers/51',
  'insurers/50',
  'insurers/49',
  'insurers/48',
  'insurers/46',
  'insurers/45',
];

function Package({ classes = {}, updatedPackageType }: Readonly<PackageProps>) {
  const dispatch = useDispatch();
  const flags = useFlags([
    FeatureFlags.BROK_3011_ENABLE_E11_OIC_CODE_FOR_EV_20260213_TEMP,
  ]);
  const includeE11OicCode =
    flags[FeatureFlags.BROK_3011_ENABLE_E11_OIC_CODE_FOR_EV_20260213_TEMP]
      ?.enabled ?? false;

  const [insuranceCompany, setInsuranceCompany] = useState(false);
  const [packageSchemaState, setPackageSchemaState] = useState(
    getTitle(packageSchema({ includeE11OicCode }))
  );

  const listInsurer = useSelector(
    (state: any) =>
      state?.leadsDetailReducer?.getListInsurerReducer?.data?.listInsurer
  );

  // Use react-router's useLocation to get navigation state
  const location = useLocation();
  const selectedInsurersWithPackages = useMemo(
    () => location?.state?.selectedInsurersWithPackages ?? [],
    [location?.state?.selectedInsurersWithPackages]
  );

  const selectInsurersCompany = useMemo(() => {
    if (!listInsurer?.insurers) return listInsurer ?? null;

    const selectedSet = new Set(selectedInsurersWithPackages);

    return {
      insurers: listInsurer.insurers.filter(({ name }: { name: string }) => {
        if (MANUAL_PKG_EXCLUDED_INSURERS.includes(name)) {
          return false;
        }

        return updatedPackageType !== 'STANDARD' || !selectedSet.has(name);
      }),
    };
  }, [listInsurer, selectedInsurersWithPackages, updatedPackageType]);

  const insuranceCompanyField = useMemo(
    () =>
      packageSchemaState?.find(
        (field) => field.name === 'insurance_company_id'
      ),
    [packageSchemaState]
  );

  useEffect(() => {
    if (selectInsurersCompany) {
      const customSelectInsurersCompanyArray: ISelectOptions[] =
        customSelectInsurersCompany(selectInsurersCompany);
      setPackageSchemaState(
        addSelectInsurersCompanyOptions(
          getTitle(packageSchema({ includeE11OicCode })),
          packageFields.insuranceCompanyId.name,
          customSelectInsurersCompanyArray
        )
      );
      setInsuranceCompany(true);
    } else {
      dispatch(getListInsurer(LIST_INSURERS_PAGE_SIZE));
      setInsuranceCompany(false);
    }
  }, [
    includeE11OicCode,
    listInsurer,
    selectedInsurersWithPackages,
    updatedPackageType,
  ]);

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
              {getString('package.packageTitle')}
            </h5>
          </div>
        </div>
        {insuranceCompany && (
          <CustomQuoteField
            key={insuranceCompanyField?.options?.length ?? 0}
            data={packageSchemaState}
            classes={classes}
          />
        )}
      </div>
    </Paper>
  );
}

export default Package;
