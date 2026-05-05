import { Card, CardContent, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import Controls from 'presentation/components/controls/Control';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import {
  massLeadTemplate,
  massLeadTemplateWithDatatype,
  massLeadColumns,
} from './helper';

import useTableStyles from '../tableStyles';

function MassLeadImport() {
  const [isImport, setIsImport] = useState(false);
  const classes = useTableStyles();

  const { TableComponent, TopComponent } = useTableList(
    'massLeadImport',
    massLeadColumns,
    {
      ...initialPageState,
      filter: `importType="${ImportType.MassLead}"`,
    },
    useLazyGetImportHistoryQuery
  );
  const autoAssignImportTitle = `${getString(
    'menu.autoAssignment.massLeadImport'
  )}`;
  return (
    <div className={classes.import} data-testid="test-mass-import-page">
      <Helmet title="Admin - Auto-Assign Mass Import" />
      <Grid container>
        <Card>
          <CardContent>
            <Grid container item xs={12} lg={12} className={classes.controlBtn}>
              <Grid item className={classes.btnGroup}>
                <Controls.Button
                  text={autoAssignImportTitle}
                  color="primary"
                  onClick={() => setIsImport(true)}
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
        title={autoAssignImportTitle}
        name="Mass Lead Import"
        importModalType={ImportType.MassLead}
        showModal={isImport}
        onClose={() => setIsImport(false)}
        validationProps={{
          template: massLeadTemplate,
          requiredColumns: massLeadTemplate,
          templateWithType: massLeadTemplateWithDatatype,
          maximumUpload: 10_000,
        }}
      />
    </div>
  );
}

export default MassLeadImport;
