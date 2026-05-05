import { FilesDownload } from 'presentation/components/ActivityOrderSection/DocumentSection';

const fileTypes: Record<string, boolean> = {
  'application/pdf': true,
  'image/jpeg': true,
  'image/png': true,
};

export function showFormatFile(
  fileName: string,
  fileCurrent?: FilesDownload
): string {
  if (!fileName) return fileCurrent?.file?.type?.split('/')[1];
  return fileName?.split('.')[fileName?.split('.').length - 1];
}

export function isValidFileType(fileType: string): boolean {
  return fileTypes[fileType] || false;
}
