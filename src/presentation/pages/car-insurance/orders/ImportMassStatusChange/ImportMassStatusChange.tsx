import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import Controls from 'presentation/components/controls/Control';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import useTableStyles from 'presentation/pages/admin/AutoAssign/tableStyles';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import {
  massStatusChangeColumns,
  orderMassStatusChangeRequiredColumns,
  orderMassStatusChangetemplate,
  orderMassStatusChangeTemplateWithDataType,
} from './helper';

export default function ImportMassSetatusChange() {
  const [openModal, setOpenModal] = useState(false);
  const classes = useTableStyles();
  const { TableComponent, TopComponent } = useTableList(
    'massStatusChange',
    massStatusChangeColumns,
    {
      ...initialPageState,
      filter: `importType="${ImportType.OrderStatus}"`,
    },
    useLazyGetImportHistoryQuery
  );

  return (
    <div className={classes.import} data-testid="test-mass-import-page">
      <Helmet title="Order - Mass Status Change" />
      <Grid container>
        <Card>
          <CardContent>
            <Grid container item xs={12} lg={12} className={classes.controlBtn}>
              <Grid item className={classes.btnGroup}>
                <Controls.Button
                  text={getString('order.massAssign.importMassStatusChange')}
                  color="primary"
                  onClick={() => setOpenModal(true)}
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
        title={getString('order.massAssign.importMassAssignConfig')}
        name="Mass Order Status Update"
        importModalType={ImportType.OrderStatus}
        showModal={openModal}
        onClose={() => setOpenModal(false)}
        payloadData={{
          orderStatusDetails: {
            status_name: 'ITEM_SUBMISSION_STATUS',
          },
        }}
        validationProps={{
          template: orderMassStatusChangetemplate,
          requiredColumns: orderMassStatusChangeRequiredColumns,
          templateWithType: orderMassStatusChangeTemplateWithDataType,
          maximumUpload: 1000,
        }}
      />
    </div>
  );
}
