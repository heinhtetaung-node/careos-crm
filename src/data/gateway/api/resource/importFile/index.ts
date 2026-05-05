import Type from 'data/gateway/api/type';
import * as CONSTANTS from 'shared/constants';

const ImportCSV = () => ({
  Type: Type.Public,
  Path: `/${CONSTANTS.apiEndpoint.importLeadEndPoint_v2}/imports`,
});

const GenerateUploadUrl = (payload: string) => ({
  Type: Type.Public,
  Path: `/${CONSTANTS.apiEndpoint.importLeadEndPoint_v2}/imports/${payload}:generateUploadUrl`,
});

const UploadFileByUrl = (payload: string) => ({
  Type: Type.Attachment,
  Path: payload,
});

export default {
  ImportCSV,
  GenerateUploadUrl,
  UploadFileByUrl,
};
