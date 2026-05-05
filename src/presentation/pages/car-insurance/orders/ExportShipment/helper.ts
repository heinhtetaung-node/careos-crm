import _get from 'lodash/get';

import { basePaths, baseUrls } from 'data/slices/apiSlice';
import { Column } from 'presentation/HOCs/WithTableList';
import { getOrderByField } from 'presentation/hooks/useTableList/helper';
import { formatDDMMYYYYHHMMSS, SORT_TABLE_TYPE } from 'shared/helper/utilities';

export enum ShipmentLabelExportStatus {
  inProgress = 'SHIPMENT_LABEL_EXPORT_IN_PROGRESS',
  complete = 'SHIPMENT_LABEL_EXPORT_STATUS_COMPLETE',
  error = 'SHIPMENT_LABEL_EXPORT_STATUS_ERROR',
}
export const columns: Column[] = [
  {
    id: 'srNo',
    field: 'srNo',
    label: 'text.srNo',
    minWidth: 100,
    disabled: true,
  },
  {
    id: 'createBy',
    field: 'createBy',
    label: 'text.requestedBy',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'createTime',
    field: 'createTime',
    label: 'text.requestedAt',
    minWidth: 100,
    sorting: 'desc',
  },
  {
    id: 'status',
    field: 'status',
    label: 'text.status',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
];

const exportSatusMap = {
  [ShipmentLabelExportStatus.inProgress]: 'IN_PROGRESS',
  [ShipmentLabelExportStatus.complete]: 'COMPLETE',
  [ShipmentLabelExportStatus.error]: 'ERROR',
};

export const getExportStatus = (status: ShipmentLabelExportStatus) =>
  _get(exportSatusMap, status, '');

export const getExportFileUrl = (resourceName: string) =>
  `${baseUrls.salesFlow}/${basePaths.shipment}/${resourceName}:file?download=true`;

export const formatResponse = (
  response: any,
  currentPage: number,
  currentPerPage: number
) =>
  (response ?? []).map((data: any, idx: number) => ({
    ...data,
    createTime: formatDDMMYYYYHHMMSS(data.createTime),
    srNo: currentPerPage * (currentPage - 1) + idx + 1,
    downloadLink: getExportFileUrl(data.name),
    status: getExportStatus(data.status),
  }));

export const computeOrderBy = (columnState: Column[]) => {
  const sortColumn = columnState.find(
    (col) => !col.disabled && col.sorting !== SORT_TABLE_TYPE.NONE
  );
  if (sortColumn) {
    return getOrderByField(
      sortColumn.field as string,
      sortColumn.sorting as SORT_TABLE_TYPE
    );
  }
  return undefined;
};
