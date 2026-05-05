import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import {
  importCarModelMaximumRows,
  importCarModelRequireColumn,
  importCarModelTemplate,
  importCarModelTemplateWithType,
} from './helper';

import CommonDataTable from '../CommonDataTable';
import { importColumns } from '../helper';

function ImportCarModel() {
  const [openImportModal, setOpenImportModal] = useState(false);

  const { TableComponent, TopComponent } = useTableList(
    'carModel',
    importColumns,
    {
      ...initialPageState,
      filter: 'status!="WAITING_UPLOAD" importType="CAR_MODEL"',
    },
    useLazyGetImportHistoryQuery
  );

  const closeImportModal = useCallback(() => setOpenImportModal(false), []);

  return (
    <div>
      <Helmet title="Model - Import" />
      <div className="flex" data-testid="model-import-main-container">
        <CommonDataTable
          handleModal={setOpenImportModal}
          buttonText={getString('text.modelImport')}
          TopComponent={<TopComponent />}
          TableComponent={<TableComponent />}
        />
      </div>
      <ImportModal
        title={getString('text.modelImport')}
        name={getString('text.model')}
        showModal={openImportModal}
        onClose={closeImportModal}
        validationProps={{
          template: importCarModelTemplate,
          requiredColumns: importCarModelRequireColumn,
          templateWithType: importCarModelTemplateWithType,
          maximumUpload: importCarModelMaximumRows,
        }}
        progressMessage={getString('text.importModelInProgress')}
        importModalType={ImportType.Model}
      />
    </div>
  );
}

export default ImportCarModel;
