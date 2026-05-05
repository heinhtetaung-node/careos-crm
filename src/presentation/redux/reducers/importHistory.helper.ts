import { customImportedStatus } from 'data/slices/importSlices/helper';
import { formatDDMMYYYYHHMMSS } from 'shared/helper/utilities';
import { ILookUpUser } from 'shared/interfaces/common/admin/user';

type ImportedRecord = {
  createBy?: string;
  createTime?: string;
  errors?: any[];
  filename?: string;
  name: string;
  status?: string;
};

type ImportedHistoryOptions<T extends ImportedRecord> = {
  downloadLinkBuilder: (importedRecord: T) => string;
  itemMapper?: (importedRecord: T) => Record<string, any>;
  listImportedPackage?: T[];
  userList?: ILookUpUser[];
};

export { customImportedStatus };

export const formatImportedHistory = <T extends ImportedRecord>({
  downloadLinkBuilder,
  itemMapper,
  listImportedPackage = [],
  userList = [],
}: ImportedHistoryOptions<T>) =>
  listImportedPackage.map((importedRecord) => {
    const createByUser = userList.find(
      (item: ILookUpUser) => item?.key === importedRecord.createBy
    );

    return {
      id: importedRecord.name,
      importStatus: customImportedStatus(importedRecord?.status ?? ''),
      importDate: formatDDMMYYYYHHMMSS(importedRecord?.createTime ?? ''),
      importFileName: importedRecord?.filename || '',
      importedBy: createByUser?.value || '-',
      errors: importedRecord.errors || [],
      downloadLink: downloadLinkBuilder(importedRecord),
      ...(itemMapper ? itemMapper(importedRecord) : {}),
    };
  });
