import { concatMap, pluck } from 'rxjs/operators';

import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import getConfig from 'data/setting';

const apiGateway = ApiGateway.createAPIConnection(getConfig());
interface HeaderProps {
  [key: string]: string;
}
const importCSV = (payload: any) => {
  const { file, ...rest } = payload;
  let uniqueFilename: string = file.name;

  const importCsvFilesResource = RabbitResource.ImportFile.ImportCSV();
  return apiGateway.doPostAjaxRequest(importCsvFilesResource, rest).pipe(
    pluck('data'),
    concatMap((data: { name: string; filename: string }) => {
      const importId = data.name.split('/')[1];
      uniqueFilename = data.filename;
      return apiGateway.doPutAjaxRequest(
        RabbitResource.ImportFile.GenerateUploadUrl(importId)
      );
    }),
    pluck('data'),
    concatMap((res: { url: string; headers?: HeaderProps }) => {
      const headersData =
        res?.headers && Object.keys(res.headers).length
          ? res.headers
          : {
              'Content-Type': 'text/csv',
              'X-Goog-Content-Length-Range': '0,5242880',
              'Content-Disposition': `attachment;filename=${uniqueFilename}`,
            };
      return apiGateway.uploadCSVFile(
        RabbitResource.ImportFile.UploadFileByUrl(res.url).Path,
        file,
        headersData
      );
    })
  );
};

export default {
  importCSV,
};
