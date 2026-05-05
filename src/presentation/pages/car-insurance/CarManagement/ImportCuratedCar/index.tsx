import { Grid } from '@material-ui/core';
import { useFlags } from 'flagsmith/react';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { initialPageState } from 'data/slices/importSlices/helper';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import CommonDataTable from '../CommonDataTable';
import {
  importColumns,
  importedCuratedCarTemplate,
  importedCuratedCarRequireColumn,
  importedCuratedCarTemplateWithDatatype,
  importedCuratedCarMaximumUpload,
} from '../helper';

function ImportCuratedCar() {
  const flags = useFlags([
    'lead-3041_update-the-car-management-menu_20230113_temp',
  ]);
  const enableCarManagementMenu =
    flags['lead-3041_update-the-car-management-menu_20230113_temp']?.enabled ??
    false;
  const [openImportModal, setOpenImportModal] = useState(false);

  const { TableComponent, TopComponent } = useTableList(
    'curatedCar',
    importColumns,
    {
      ...initialPageState,
      filter: 'status!="WAITING_UPLOAD" importType="CURATED_CAR"',
    },
    useLazyGetImportHistoryQuery
  );

  const closeModal = useCallback(() => setOpenImportModal(false), []);

  return (
    <div>
      <Helmet title="Curated Car - Import" />
      <Grid container data-testid="curated-car-import">
        <CommonDataTable
          handleModal={setOpenImportModal}
          buttonText={
            enableCarManagementMenu
              ? getString('curatedCar.subModel')
              : getString('curatedCar.importCuratedCar')
          }
          TopComponent={<TopComponent />}
          TableComponent={<TableComponent />}
        />
      </Grid>
      <ImportModal
        title={getString('curatedCar.importCuratedCar')}
        name={getString('menu.curatedCar.root')}
        showModal={openImportModal}
        onClose={closeModal}
        validationProps={{
          template: importedCuratedCarTemplate,
          requiredColumns: importedCuratedCarRequireColumn,
          templateWithType: importedCuratedCarTemplateWithDatatype,
          maximumUpload: importedCuratedCarMaximumUpload,
        }}
        progressMessage={getString('curatedCar.importCuratedCarProgress')}
        importModalType={ImportType.CuratedCar}
      />
    </div>
  );
}

export default ImportCuratedCar;
