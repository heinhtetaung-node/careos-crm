import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import _get from 'lodash/get';
import _has from 'lodash/has';
import { fromFetch } from 'rxjs/fetch';

import { MB_PER_BYTES } from 'config/constant';
import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import { DOCUMENT_MAX_SIZE } from 'shared/constants';
import { buildUrl } from 'utils/url';

interface DocumentUploadRequest {
  fileName: string;
  contentType: string;
  file: File;
}

export interface DocumentUploadResponse {
  message: string;
  documentResource: string;
}

const documentUploadSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    uploadDocument: build.mutation<
      DocumentUploadResponse,
      DocumentUploadRequest
    >({
      async queryFn(_args, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          // create document upload.
          const createDocumentUpload = (await fetchWithBQ({
            url: buildUrl(baseUrls.salesFlow, { path: basePaths.documents }),
            method: 'POST',
            body: {
              displayName: _args.fileName,
              contentType: _args.contentType,
            },
          })) as any;

          if (createDocumentUpload.error) {
            return { error: createDocumentUpload.error as FetchBaseQueryError };
          }

          const maxContentRange = MB_PER_BYTES * DOCUMENT_MAX_SIZE;
          const gcHeader = {
            'x-goog-content-length-range': `0,${maxContentRange}`,
            'Content-Type': _args.contentType,
          };

          await fromFetch(createDocumentUpload.data?.uploadUrl as string, {
            headers: gcHeader,
            method: 'PUT',
            body: _args.file,
          }).toPromise();
          return {
            data: {
              message: 'Success',
              documentName: _args.fileName,
              documentResource: _has(createDocumentUpload, 'data.document.name')
                ? _get(createDocumentUpload, 'data.document.name')
                : '',
            },
          } as any;
        } catch {
          return {
            error: 'Something went wrong!',
          };
        }
      },
    }),
    getDocumentDetails: build.query<any, string>({
      query: (documentResource) => ({
        url: `${basePaths.document}/${documentResource}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useUploadDocumentMutation, useGetDocumentDetailsQuery } =
  documentUploadSlice;
