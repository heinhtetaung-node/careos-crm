import { Card, CardContent, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import Controls from 'presentation/components/controls/Control';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import customerProfileTemplate from 'shared/constants/csvCustomerProfile';
import { ImportType } from 'shared/constants/importFile';
import { SelectElement } from 'shared/types/controls';

import {
  columns,
  customerDetailSource,
  customerProfileRequiredColumns,
  customerProfileTemplateWithDataTypes,
} from './customerProfileHelper';
import '../../../../../scss/reuse-mixin.scss';

export const useStyles = makeStyles({
  controlBtn: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  btnGroup: {
    display: 'flex',
    marginLeft: '56px',
    '& button': {
      textTransform: 'uppercase',
    },
  },
  table: {
    '& .MuiTableCell-root.MuiTableCell-body': {
      '&:nth-child(1)': {
        textAlign: 'center',
      },
      '&:nth-child(2)': {
        width: '200px',
        maxWidth: '200px',
      },
      '&:nth-child(3)': {
        width: '200px',
        maxWidth: '200px',
      },
    },
  },
  importCustomerProfile: {
    '& .MuiCard-root': { width: '100%' },
    '& .MuiCardContent-root': { padding: '16px 0' },
    '& .paging': {
      float: 'right',
      margin: '20px 0',
    },
  },
});

function ImportCustomerProfilePage() {
  const [isImportCustomerProfile, setIsImportCustomerProfile] = useState(false);
  const [fileType, setFileType] = useState<number>(0);

  const classes = useStyles();

  const { TableComponent, TopComponent } = useTableList(
    'customerProfile',
    columns.filter((col) => col.id !== 'effectiveDate'),
    {
      ...initialPageState,
      filter: 'importType="CUSTOMER"',
    },
    useLazyGetImportHistoryQuery
  );

  const handleFileType = useCallback(
    (event: React.ChangeEvent<SelectElement>) =>
      setFileType(event.target.value as number),
    []
  );

  return (
    <div className={classes.importCustomerProfile}>
      <Helmet title="Customer Profile - Import Page" />
      <Grid container>
        <Card>
          <CardContent>
            <Grid container item xs={12} lg={12} className={classes.controlBtn}>
              <Grid item className={classes.btnGroup}>
                <Controls.Button
                  text={getString('customerProfile.import')}
                  color="primary"
                  onClick={() => setIsImportCustomerProfile(true)}
                />
              </Grid>
              <Grid container item justifyContent="flex-end" lg={6}>
                <TopComponent />
              </Grid>
            </Grid>
            <div className={classes.table}>
              <TableComponent />
            </div>
          </CardContent>
        </Card>
      </Grid>
      <ImportModal
        name="Customer Profile"
        title={getString('customerProfile.import')}
        showModal={isImportCustomerProfile}
        onClose={() => setIsImportCustomerProfile(false)}
        importModalType={ImportType.CustomerProfile}
        validationProps={{
          template: customerProfileTemplate,
          requiredColumns: customerProfileRequiredColumns,
          templateWithType: customerProfileTemplateWithDataTypes,
          maximumUpload: 300_000,
        }}
        customImportState={{
          customerDetails: {
            source: customerDetailSource[fileType].value,
          },
        }}
        CustomImportElements={
          <Controls.Select
            name="file_type"
            label={getString('customerProfile.sourceFile')}
            value={fileType}
            onChange={handleFileType}
            options={customerDetailSource}
            placeholder={getString('customerProfile.sourceFile')}
          />
        }
      />
    </div>
  );
}

export default ImportCustomerProfilePage;
