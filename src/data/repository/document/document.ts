import { concatMap, map, pluck, tap } from 'rxjs/operators';

import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';

import getConfig from '../../setting';

const uploadDocument = (body: any) => {
  const { file, ...rest } = body;
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const uploadDocumentResource = RabbitResource.Document.uploadDocument();
  let response: any = null;

  return apiGateway.doPostAjaxRequest(uploadDocumentResource, rest).pipe(
    tap((res: any) => {
      response = res;
    }),
    pluck('data'),
    concatMap((res: any) =>
      apiGateway.uploadFile(
        RabbitResource.ImportFile.UploadFileByUrl(res.uploadUrl).Path,
        file,
        5
      )
    ),
    map(() => response)
  );
};

export default {
  uploadDocument,
};
