import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import { FilesDownload } from 'presentation/components/ActivityOrderSection/DocumentSection';

export const downloadFileFromBlobURL = (documentID: string) => {
  const src = `${process.env.VITE_API_ENDPOINT}/api/document/v1alpha1/${documentID}:file?download=true`;

  const downloadLink = window.document.createElement('iframe');
  downloadLink.style.display = 'none';
  downloadLink.src = src;

  document.body.appendChild(downloadLink);

  const timer = setInterval(() => {
    window.addEventListener('error', () => {
      document.body.removeChild(downloadLink);
      clearInterval(timer);
    });
    const iframeDoc =
      downloadLink.contentDocument || downloadLink.contentWindow?.document;
    // Check if loading is complete
    if (
      iframeDoc?.readyState === 'complete' ||
      iframeDoc?.readyState === 'interactive'
    ) {
      document.body.removeChild(downloadLink);
      clearInterval(timer);
    }
  }, 2000);
};

export const downloadFilesToZip = (
  arrFilesDownload: (FilesDownload | undefined)[]
) => {
  const zip = new JSZip();
  let count = 0;
  const zipFilename = 'Documents.zip';

  arrFilesDownload.forEach((e: FilesDownload | undefined) => {
    zip.file(e?.fileName || '', e?.file);
    count += 1;
    if (count === arrFilesDownload.length) {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, zipFilename);
      });
    }
  });
};

export const runAsyncFuntionsConsecutively = (
  functions: (() => void)[],
  startIndex: number
) => {
  functions[startIndex]?.();
  if (startIndex < functions.length - 1) {
    setTimeout(() => {
      runAsyncFuntionsConsecutively(functions, startIndex + 1);
    }, 1000);
  }
};

export const downloadfileFromLink = (src: string) => {
  const link = document.createElement('a');
  link.setAttribute('target', '_blank');
  link.setAttribute('href', src);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
