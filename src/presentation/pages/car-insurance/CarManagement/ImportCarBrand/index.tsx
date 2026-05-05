import { Grid } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import {
  importCarBrandMaximumUpload,
  importCarBrandRequireColumn,
  importCarBrandTemplate,
  importCarBrandTemplateWithType,
} from './helper';

import CommonDataTable from '../CommonDataTable';
import { importColumns } from '../helper';

function ImportCarBrand() {
  const [openImportModal, setOpenImportModal] = useState(false);

  const { TableComponent, TopComponent } = useTableList(
    'carBrand',
    importColumns,
    {
      ...initialPageState,
      filter: 'status!="WAITING_UPLOAD" importType="CAR_BRAND"',
    },
    useLazyGetImportHistoryQuery
  );

  const closeImportModal = useCallback(() => setOpenImportModal(false), []);

  return (
    <div>
      <Helmet title="Brand - Import" />
      <Grid container data-testid="brand-import">
        <CommonDataTable
          handleModal={setOpenImportModal}
          buttonText={getString('text.brandImport')}
          TopComponent={<TopComponent />}
          TableComponent={<TableComponent />}
        />
      </Grid>
      <ImportModal
        title={getString('text.brandImport')}
        name={getString('text.brand')}
        showModal={openImportModal}
        onClose={closeImportModal}
        validationProps={{
          template: importCarBrandTemplate,
          requiredColumns: importCarBrandRequireColumn,
          templateWithType: importCarBrandTemplateWithType,
          maximumUpload: importCarBrandMaximumUpload,
        }}
        progressMessage={getString('text.importBrandInProgress')}
        importModalType={ImportType.Brand}
      />
    </div>
  );
}

export default ImportCarBrand;
