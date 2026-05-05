import { getString } from 'presentation/theme/localization';

export interface IParentEmail {
  name: string;
  body: string;
  to: string;
  from: string;
  cc: string[];
  subject: string;
  attachment: any[];
  bodyText: string;
}

export const getParentMailUUID = (email: string) => {
  const newUUID = email.split('mails/')[1];

  return newUUID || '';
};

export enum MessageType {
  Email = 'email',
  SMS = 'sms',
}

export interface IReplyFormData {
  [MessageType.Email]: {
    message: string;
    to: string;
    cc: string[];
    subject: string;
    attachment: any[];
    parentId?: string;
  };
}

export const initialFormData: IReplyFormData = {
  email: {
    message: '',
    to: '',
    cc: [],
    subject: '',
    attachment: [],
    parentId: '',
  },
};

export const KEY_CODE = {
  ENTER: 13,
  TAB: 9,
};

export const FILE_CONFIG = {
  MAX_ONE_FILE_SIZE: 1e6,
  MAX_ALL_FILE_SIZE: 5e6,
};

export const quotingBodyMessage = (message: string) => {
  const quoted = message ? `"${message}"` : '';
  return quoted;
};

export interface IEmail {
  message: string;
  to: string;
  cc: string[];
  subject: string;
  attachment: any[];
}

export const handleRejectedMessage = (
  rejectedFile: { name: string; type: string | undefined; size: number },
  acceptedFiles: string[],
  maxFileSize: number
) => {
  // INFO: Handle error when upload file type not supported or too big
  let msg = '';
  const fileType = rejectedFile.type || '';
  if (rejectedFile.size >= maxFileSize) {
    msg = getString('text.fileSizeLimit', {
      fileName: rejectedFile.name,
    });
    return msg;
  }
  if (!acceptedFiles.includes(fileType)) {
    msg = getString('text.unsupportedFile', {
      fileName: rejectedFile.name,
    });
    return msg;
  }

  return msg;
};

export const checkTotalFileSize = (fileList: File[]) => {
  let totalFileSize = 0;
  fileList.forEach((file) => {
    totalFileSize += file.size;
  });

  return totalFileSize >= FILE_CONFIG.MAX_ALL_FILE_SIZE;
};
