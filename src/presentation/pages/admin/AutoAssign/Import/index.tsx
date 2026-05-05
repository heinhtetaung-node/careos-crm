import { Card, CardContent, Grid } from '@material-ui/core';
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import Controls from 'presentation/components/controls/Control';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import {
  leadColumns,
  leadAutoAssignTemplate,
  autoAssignTemplateWithDatatype,
} from './helper';

import useTableStyles from '../tableStyles';
import '../../../../../scss/reuse-mixin.scss';

function AutoAssignImportPage() {
  const [isImportConfig, setIsImportConfig] = useState(false);
  const classes = useTableStyles();
  const updatedLeadColumns = useMemo(() => leadColumns(), []); // replace "Last Update" column with "Effective Date"
  const { TableComponent, TopComponent } = useTableList(
    'autoAssignImport',
    updatedLeadColumns,
    {
      ...initialPageState,
      filter: 'importType="LEAD_AUTOASSIGNMENT_CONFIG"',
    },
    useLazyGetImportHistoryQuery
  );
  const autoAssignImportTitle = `${getString(
    'menu.autoAssignment.root'
  )} ${getString('menu.autoAssignment.import')}`;
  return (
    <div className={classes.import} data-testid="test-config-import-page">
      <Helmet title="Admin - Auto-Assign Import" />
      <Grid container>
        <Card>
          <CardContent>
            <Grid container item xs={12} lg={12} className={classes.controlBtn}>
              <Grid item className={classes.btnGroup}>
                <Controls.Button
                  text={autoAssignImportTitle}
                  color="primary"
                  onClick={() => setIsImportConfig(true)}
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
        name="Auto-Assign Lead Import"
        importModalType={ImportType.AutoAssignLeadConfig}
        showModal={isImportConfig}
        onClose={() => setIsImportConfig(false)}
        validationProps={{
          template: leadAutoAssignTemplate,
          requiredColumns: leadAutoAssignTemplate,
          templateWithType: autoAssignTemplateWithDatatype,
          maximumUpload: 10_000,
        }}
      />
    </div>
  );
}

export default AutoAssignImportPage;
