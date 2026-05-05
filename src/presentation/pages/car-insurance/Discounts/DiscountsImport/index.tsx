import { Card, CardContent, Grid } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import Controls from 'presentation/components/controls/Control';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { useStyles } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/index';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';
import { SelectElement } from 'shared/types/controls';

import {
  columns,
  discountFileUploadTypes,
  discountsRequiredColumns,
  discountsTemplateWithDataTypes,
} from './helper';
import '../../../../../scss/reuse-mixin.scss';

function DiscountImportPage() {
  const [isImportDiscountProfile, setIsImportDiscountProfile] = useState(false);
  const [fileType, setFileType] = useState<number>(0);
  const classes = useStyles();

  const { TableComponent, TopComponent } = useTableList(
    'discountsImport',
    columns,
    {
      ...initialPageState,
      filter: `importType="${ImportType.Discounts}"`,
    },
    useLazyGetImportHistoryQuery
  );

  const handleFileType = useCallback(
    (event: React.ChangeEvent<SelectElement>) =>
      setFileType(event.target.value as number),
    []
  );

  const handleDiscountModal = useCallback(
    () => setIsImportDiscountProfile((prev) => !prev),
    []
  );

  return (
    <div className={classes.importCustomerProfile}>
      <Helmet title="Discounts - Import Page" />
      <Grid container>
        <Card>
          <CardContent>
            <Grid container item xs={12} lg={12} className={classes.controlBtn}>
              <Grid item className={classes.btnGroup}>
                <Controls.Button
                  text={getString('menu.discounts.importDiscount')}
                  color="primary"
                  onClick={handleDiscountModal}
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
        parentData={fileType}
        name="Discounts"
        title={getString('menu.discounts.importDiscount')}
        showModal={isImportDiscountProfile}
        onClose={handleDiscountModal}
        importModalType={ImportType.Discounts}
        validationProps={{
          template: discountsRequiredColumns(fileType),
          requiredColumns: discountsRequiredColumns(fileType),
          templateWithType: discountsTemplateWithDataTypes(fileType),
          maximumUpload: 100_000,
        }}
        customImportState={{
          agent_discount_rule_details: {
            type: discountFileUploadTypes[fileType].value,
          },
        }}
        CustomImportElements={
          <Controls.Select
            name="file_type"
            label={getString('menu.discounts.fileType')}
            value={fileType}
            onChange={handleFileType}
            options={discountFileUploadTypes}
            placeholder={getString('menu.discounts.placeholder')}
          />
        }
      />
    </div>
  );
}

export default DiscountImportPage;
