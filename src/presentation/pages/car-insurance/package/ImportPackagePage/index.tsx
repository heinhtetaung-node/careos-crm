import { Card, CardContent, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

import { PACKAGE_IMPORT_MAX_ROWS } from 'config/constant';
import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import Controls from 'presentation/components/controls/Control';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import csvPackageColumns from 'shared/constants/csvPackageColumns';
import { ImportType } from 'shared/constants/importFile';

import {
  columns,
  mandatoryPackageMaximumUpload,
  mandatoryPackageRequireColumn,
  mandatoryPackageTemplate,
  mandatoryPackageTemplateWithDatatype,
  renewalPackageTemplateWithDatatype,
  renewalPackageTemplate,
  renewalPackageRequireColumnAccepted,
  renewalPackageRequireColumnNotAccepted,
  insuranceMotorTemplate,
  insuranceMotorRequireColumn,
  insuranceMotorTemplateWithDatatype,
} from './importPackagePageHelper';
import useStyle from './index.style';
import './index.scss';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

function ImportPackagePage() {
  const classes = useStyle();

  const featureFlags = useFlags([
    FeatureFlags.BROK_2613_ENABLE_GENERIC_PACKAGE_IMPORT_20250530,
  ]);

  const enableGenericImport =
    featureFlags[FeatureFlags.BROK_2613_ENABLE_GENERIC_PACKAGE_IMPORT_20250530]
      ?.enabled ?? false;

  const [isImportPackage, setIsImportPackage] = useState(false);
  const [isImportRenewPackage, setIsImportRenewPackage] = useState(false);
  const [ImportMandatoryPackage, setImportMandatoryPackage] = useState(false);
  const [isImportInsuranceMotor, setIsImportInsuranceMotor] = useState(false);

  const {
    TableComponent,
    TopComponent,
    refetch: refetchImportHistory,
  } = useTableList(
    'package',
    columns,
    {
      ...initialPageState,
      filter: 'status!="WAITING_UPLOAD" importType="PACKAGE"',
    },
    useLazyGetImportHistoryQuery
  );
  return (
    <div className="package-import-page">
      <Helmet title="Package - Import Page" />
      <Grid container data-testid="package-import-page">
        <Card>
          <CardContent>
            <Grid
              container
              item
              xs={12}
              lg={12}
              className="package-import-page__control-btn"
            >
              <Grid
                item
                style={{ paddingLeft: 56 }}
                className="control-btn-group"
                lg={8}
              >
                <Controls.Button
                  text={getString('text.importPackages')}
                  color="primary"
                  className={classes.importButtons}
                  onClick={() => {
                    setIsImportPackage(true);
                  }}
                />
                <Controls.Button
                  text={getString('text.importRenewPackages')}
                  color="primary"
                  className={classes.importButtons}
                  onClick={() => {
                    setIsImportRenewPackage(true);
                  }}
                />
                <Controls.Button
                  text={getString('text.importMandatoryPackages')}
                  color="primary"
                  className={classes.importButtons}
                  onClick={() => {
                    setImportMandatoryPackage(true);
                  }}
                />
              </Grid>
              {enableGenericImport && (
                <Grid
                  item
                  style={{ paddingTop: 10, paddingLeft: 56 }}
                  className="control-btn-group"
                  lg={8}
                >
                  <div className="flex flex-row flex-wrap gap-2">
                    <Controls.Button
                      text={getString('text.importInsuranceMotor')}
                      color="primary"
                      className={classes.importButtons}
                      onClick={() => setIsImportInsuranceMotor(true)}
                    />
                  </div>
                </Grid>
              )}
              <Grid container item justifyContent="flex-end" lg={4}>
                <TopComponent />
              </Grid>
            </Grid>
            <TableComponent />
          </CardContent>
        </Card>
      </Grid>
      {/* Standard Package */}
      <ImportModal
        title={getString('text.importPackages')}
        name="standard package"
        showModal={isImportPackage}
        onClose={() => setIsImportPackage(false)}
        validationProps={{
          template: csvPackageColumns,
          requiredColumns: [],
          templateWithType: [],
          maximumUpload: PACKAGE_IMPORT_MAX_ROWS,
        }}
        progressMessage={getString('text.importPackagesProgress')}
        importModalType={ImportType.Package}
        payloadData={{
          packageDetails: {
            packageType: 'STANDARD',
          },
        }}
        refetchImportHistory={refetchImportHistory}
      />
      {/* Renewal Package */}
      <ImportModal
        title={getString('text.importRenewPackages')}
        name="renewal package"
        showModal={isImportRenewPackage}
        onClose={() => setIsImportRenewPackage(false)}
        validationProps={{
          template: renewalPackageTemplate,
          requiredColumns: [
            renewalPackageRequireColumnAccepted,
            renewalPackageRequireColumnNotAccepted,
          ],
          templateWithType: renewalPackageTemplateWithDatatype,
          maximumUpload: PACKAGE_IMPORT_MAX_ROWS,
        }}
        progressMessage={getString('text.importPackagesProgress')}
        importModalType={ImportType.Package}
        payloadData={{
          packageDetails: {
            packageType: 'RENEWAL',
          },
        }}
        refetchImportHistory={refetchImportHistory}
      />
      {/* Mandatory Package */}
      <ImportModal
        title={getString('text.importMandatoryPackages')}
        name="mandatory package"
        showModal={ImportMandatoryPackage}
        onClose={() => setImportMandatoryPackage(false)}
        validationProps={{
          template: mandatoryPackageTemplate,
          requiredColumns: mandatoryPackageRequireColumn,
          templateWithType: mandatoryPackageTemplateWithDatatype,
          maximumUpload: mandatoryPackageMaximumUpload,
        }}
        progressMessage={getString('text.importPackagesProgress')}
        importModalType={ImportType.Package}
        payloadData={{
          packageDetails: {
            packageType: 'MANDATORY',
          },
        }}
        refetchImportHistory={refetchImportHistory}
      />

      {/* Insurance Motor */}
      <ImportModal
        title={getString('text.importInsuranceMotor')}
        name="insurance motor"
        showModal={isImportInsuranceMotor}
        onClose={() => setIsImportInsuranceMotor(false)}
        progressMessage={getString('text.importPackagesProgress')}
        importModalType={ImportType.Package}
        payloadData={{
          packageDetails: {
            packageType: 'INSURANCE_MOTOR',
          },
        }}
        validationProps={{
          template: insuranceMotorTemplate,
          requiredColumns: insuranceMotorRequireColumn,
          templateWithType: insuranceMotorTemplateWithDatatype,
          maximumUpload: 50000,
        }}
        refetchImportHistory={refetchImportHistory}
      />
    </div>
  );
}

export default ImportPackagePage;
