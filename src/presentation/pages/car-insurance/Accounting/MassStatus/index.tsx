import React, { useState } from 'react';

import { Helmet } from 'react-helmet';
import { Button } from '@alphafounders/ui';

import useTableList from 'presentation/hooks/useTableList';
import ImportModal from 'presentation/components/modal/ImportModal';

import { initialPageState } from 'data/slices/importSlices/helper';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import {
  getRequiredColumnsByType,
  getTemplateByType,
  templateTypes,
  templateWithDataType,
} from './helper';
import { getColumns } from './config';
import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';

export default function AccountingMassStatus() {
  const [modal, setmodal] = useState<{ isShow: boolean; id: string | null }>({
    isShow: false,
    id: null,
  });

  const { TableComponent, TopComponent } = useTableList(
    'massStatusChange',
    getColumns(),
    {
      ...initialPageState,
      filter: `importType="${ImportType.Accounting}"`,
    },
    useLazyGetImportHistoryQuery,
    undefined,
    undefined,
    [],
    true
  );

  return (
    <div data-testid="accounting-mass-status-change-page">
      <Helmet title="Accounting - Mass status change Page" />
      <div className="flex flex-row items-center justify-between mt-2 p-4 bg-white">
        <div className="flex flex-row items-center justify-start gap-2 flex-wrap">
          {templateTypes.map((template) => (
            <Button
              key={template}
              text={getString(`menu.accounting.${template}`)}
              onClick={() => setmodal({ isShow: true, id: template })}
              className="p-3"
            />
          ))}
        </div>
        <div className="flex mb-2">
          <TopComponent />
        </div>
      </div>

      <div className="mt-1">
        <TableComponent
          ExpandableComponentParams={{
            isAllSelectable: true,
          }}
          ActionCellElements={() => <>&nbsp;</>}
        />
      </div>
      {modal.id && (
        <ImportModal
          title={getString(`menu.accounting.${modal.id}`)}
          name={`Mass Accounting ${getString(`menu.accounting.${modal.id}`)} Update`}
          importModalType={ImportType.Accounting}
          showModal={modal.isShow}
          onClose={() => setmodal((prev) => ({ ...prev, isShow: false }))}
          payloadData={{}}
          validationProps={{
            template: getTemplateByType(modal.id),
            requiredColumns: getRequiredColumnsByType(modal.id),
            templateWithType: templateWithDataType(modal.id),
            maximumUpload: 1000,
          }}
        />
      )}
    </div>
  );
}
