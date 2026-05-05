import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import {
  importRedbookRequireColumn,
  importRedbookTemplate,
  importRedbookTemplateWithType,
} from './helper';

import CommonDataTable from '../CommonDataTable';
import { importColumns } from '../helper';

function ImportRedbook() {
  const [openImportModal, setOpenImportModal] = useState(false);

  const { TableComponent, TopComponent } = useTableList(
    'redbook',
    importColumns,
    {
      ...initialPageState,
      filter: 'status!="WAITING_UPLOAD" importType="REDBOOK"',
    },
    useLazyGetImportHistoryQuery
  );

  const closeImportModal = useCallback(() => setOpenImportModal(false), []);

  return (
    <div>
      <Helmet title="Redbook - Import" />
      <div className="flex" data-testid="redbook-import-main-container">
        <CommonDataTable
          handleModal={setOpenImportModal}
          buttonText={getString('text.redbookImport')}
          TopComponent={<TopComponent />}
          TableComponent={<TableComponent />}
        />
      </div>
      <ImportModal
        title={getString('text.redbookImport')}
        name={getString('text.redbook')}
        showModal={openImportModal}
        onClose={closeImportModal}
        validationProps={{
          template: importRedbookTemplate,
          requiredColumns: importRedbookRequireColumn,
          templateWithType: importRedbookTemplateWithType,
        }}
        progressMessage={getString('text.importRedbookInProgress')}
        importModalType={ImportType.Redbook}
      />
    </div>
  );
}

export default ImportRedbook;
