import { Card } from '@material-ui/core';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

import {
  useExportShipmentListQuery,
  useExportShipmentMutation,
} from 'data/slices/exportShipmentSlice';
import Controls from 'presentation/components/controls/Control';
import CustomPagination from 'presentation/components/controls/CustomPagination';
import DataTable from 'presentation/components/DataTable';
import { LeadImportDefault } from 'presentation/components/icons';
import CommonModal from 'presentation/components/modal/CommonModal';
import { ITEM_PER_PAGE_LIST } from 'presentation/HOCs/WithTableListHelper';
import { getString } from 'presentation/theme/localization';
import { downloadfileFromLink } from 'shared/helper/downloadDocumentHelper';
import { changeSortStatus, SORT_TABLE_TYPE } from 'shared/helper/utilities';
import useSnackbar from 'utils/snackbar';
import handleFailedPackageClick from 'shared/helper/csvImportHelper';

import {
  columns,
  computeOrderBy,
  formatResponse,
  getExportStatus,
  ShipmentLabelExportStatus,
} from './helper';

function ExportShipment() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [columnState, setColumnState] = useState(columns);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPerPage, setCurrentPerPage] = useState(15);
  const [tokenList, setTokenList] = useState<string[]>(['']);

  const { data, isLoading } = useExportShipmentListQuery({
    pageSize: currentPerPage,
    pageToken: tokenList[tokenList.length - 1],
    orderBy: computeOrderBy(columnState),
  });

  const [exportShipment, { isLoading: exportLoading }] =
    useExportShipmentMutation();

  const { showErrorSnackbar } = useSnackbar();

  const handlePageChange = (
    page: number,
    _nextToken: string | null,
    isPrev?: boolean
  ) => {
    setCurrentPage(page);
    if (isPrev) {
      setTokenList((prev) => {
        prev.pop();
        return page === 1 ? [''] : prev;
      });
    } else {
      setTokenList((prev) => {
        prev.push(data?.nextPageToken as string);
        return prev;
      });
    }
  };

  const handleExportShipment = async () => {
    const response = await exportShipment();
    if ('error' in response) {
      showErrorSnackbar((response.error as any).data.message);
    } else {
      setCurrentPage(1);
      setTokenList(['']);
      setShowConfirmModal(false);
    }
  };

  const handleSort = (columnId: string) => {
    setColumnState((prev) =>
      prev.map((col) => ({
        ...col,
        sorting:
          col.field === columnId
            ? changeSortStatus(col.sorting as SORT_TABLE_TYPE)
            : SORT_TABLE_TYPE.NONE,
      }))
    );
  };

  return (
    <div data-testid="export-shipment" className="p-5">
      <Helmet title="Export shipment" />
      <Card className="w-full p-3">
        <div className="my-3 flex justify-between">
          <div>
            <Controls.Button
              text={getString('text.exportShipment')}
              color="primary"
              data-testid="export-shipment-btn"
              onClick={() => setShowConfirmModal(true)}
            />
          </div>
          <div>
            <CustomPagination
              page={currentPage}
              perPage={currentPerPage}
              pageSizes={ITEM_PER_PAGE_LIST}
              onChangePage={handlePageChange}
              nextToken={data?.nextPageToken}
              onChangePerPage={(perPage) => setCurrentPerPage(perPage)}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div>
          <DataTable
            currentPage={currentPage}
            columns={columnState}
            originalData={formatResponse(
              data?.exports,
              currentPage,
              currentPerPage
            )}
            sortData={formatResponse(
              data?.exports,
              currentPage,
              currentPerPage
            )}
            isCustomPaging
            perPage={currentPerPage}
            isLoading={isLoading}
            sortTable={handleSort}
            isDownloadable
            customAction={downloadfileFromLink}
            handleFailedPackageClick={(data: any) =>
              handleFailedPackageClick({
                errors: [{ message: data.error, errorCode: 'INVALID' }],
              })
            }
            canDownload
            checkDownloadable={(row: any) =>
              row.status === getExportStatus(ShipmentLabelExportStatus.complete)
            }
          />
        </div>
        <div className="float-right my-3">
          <CustomPagination
            page={currentPage}
            perPage={currentPerPage}
            pageSizes={ITEM_PER_PAGE_LIST}
            onChangePage={handlePageChange}
            nextToken={data?.nextPageToken}
            onChangePerPage={(perPage) => setCurrentPerPage(perPage)}
            isLoading={isLoading}
          />
        </div>
      </Card>
      <CommonModal
        open={showConfirmModal}
        handleCloseModal={() => setShowConfirmModal(false)}
      >
        <div className="pt-10 pb-5">
          <LeadImportDefault />
        </div>
        <span className="text-center font-bold text-lg">
          {getString('text.exportShipmentConfirmation')}
        </span>
        <div className="flex justify-center items-center my-6">
          <Controls.Button
            text={getString('text.cancelButton')}
            color="primary"
            disabled={exportLoading}
            onClick={() => setShowConfirmModal(false)}
          />
          <Controls.Button
            text={getString('text.confirmButton')}
            color="primary"
            onClick={handleExportShipment}
            loading={exportLoading}
            disabled={exportLoading}
            data-cy="button-generate-handle"
          />
        </div>
      </CommonModal>
    </div>
  );
}

export default ExportShipment;
