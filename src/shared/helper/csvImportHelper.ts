import { unparse } from 'papaparse';

import { getString } from 'presentation/theme/localization';

interface IError {
  errorCode: string;
  fieldName?: any;
  rowNumber?: any;
  message?: any;
}

export const getPackageErrorMessage = (error: IError) => {
  if (error.errorCode === 'REQUIRED') {
    return getString('importData.error.required', {
      fieldName: error.fieldName,
      rowNumber: error.rowNumber,
    });
  }

  if (error.errorCode === 'TRANSIENT') {
    return getString('importData.error.transient', {
      message: error.message,
      rowNumber: error.rowNumber,
    });
  }

  if (error.errorCode === 'INVALID') {
    if (error.rowNumber && error.fieldName) {
      return getString('importData.error.invalidWField', {
        message: error.message,
        fieldName: error.fieldName,
        rowNumber: error.rowNumber,
      });
    }
    if (error.rowNumber && !error.fieldName) {
      return getString('importData.error.invalidNoField', {
        message: error.message,
        rowNumber: error.rowNumber,
      });
    }

    return error.message;
  }

  return getString('importData.error.notExist', {
    message: error.message,
    fieldName: error.fieldName,
    rowNumber: error.rowNumber,
  });
};

// Download file as csv file.
export const downloadBlobAsFile = (
  errorData: { Errors: string }[],
  filename: string
) => {
  const universalBOM = '\uFEFF';
  const csv = unparse(errorData);
  const downloadLink = window.document.createElement('a');
  downloadLink.href = `data:text/csv; charset=utf-8,${encodeURIComponent(
    universalBOM + csv
  )}`;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

const handleFailedPackageClick = (data: {
  errors: IError[];
  importFileName?: string;
}) => {
  if (data.errors?.length) {
    const errorData: { Errors: string }[] = data.errors.map((error: IError) => {
      const message = getPackageErrorMessage(error);

      if (message.includes('shortID')) {
        const [shortIDPart, ...messageParts] = message.split(': ');
        const shortID = shortIDPart.replace('shortID ', '').trim();
        const errorMessage = messageParts.join(': ').trim();

        return { shortID, Errors: errorMessage };
      }
      return {
        Errors: message,
      };
    });

    downloadBlobAsFile(
      errorData,
      `errors_${data?.importFileName ? data.importFileName : 'file'}.csv`
    );
  }
};

export default handleFailedPackageClick;
