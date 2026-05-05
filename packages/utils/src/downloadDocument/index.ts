import { commonFetch } from '../apifetch/commonFetch';

export const downloadDocument = async (documentPath: string) => {
  const downloadLink = `${documentPath}:file?download=true`;
  const { url } = await commonFetch(downloadLink);
  if (url) {
    window.location.assign(url);
  }
};
