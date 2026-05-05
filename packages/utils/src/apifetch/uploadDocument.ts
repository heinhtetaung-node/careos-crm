import { ajax } from 'rxjs/ajax';

export enum SizeLimit {
  SMALL = 2097152, // 2MB
  MEDIUM = 5242880, // 5MB
  LARGE = 10485760, // 10MB
  EXTRA_LARGE = 20971520, // 20MB
}
// eslint-disable-next-line import/prefer-default-export
export const uploadDocumentViaDocumentService = async (
  uploadUrl: string,
  file: File,
  sizeLimit: SizeLimit = SizeLimit.MEDIUM
) => {
  const gcHeader = {
    'x-goog-content-length-range': `0,${sizeLimit}`,
    'Content-Type': `${file.type}`,
  };
  return new Promise((resolve, reject) => {
    ajax({
      method: 'PUT',
      responseType: 'blob',
      headers: gcHeader,
      crossDomain: true,
      url: uploadUrl,
      body: file,
    }).subscribe({
      next: (value) => resolve(value),
      error: (err) => reject(new Error(err)),
    });
  });
};
