import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';
import { maskPhoneNumber } from 'shared/helper/utilities';
import { intervalToDuration, format } from 'utils/datetime';

import { CommunicationType } from './index.model';

export const AdminSupervisorRoles: UserRoleID[] = [
  UserRoleID.Admin,
  UserRoleID.SuperAdmin,
  UserRoleID.Supervisor,
  UserRoleID.Manager,
  UserRoleID.BackOffice,
];
export interface ICommunication {
  communicationType: string;
  createBy: string;
  createTime: string;
  deleteTime: string;
  duration: any;
  id: number;
  name: string;
  updateTime: string;
  to: string;
}

export const formatDurationData = (duration: any) => {
  const minutes = duration.minutes ?? 0;
  let { seconds } = duration;
  if (!seconds) seconds = 0;
  if (seconds < 10) seconds = `0${seconds}`;
  return `${minutes}:${seconds} ${getString('text.minutesAcronym')}`;
};

export const displayDuration = (communication: ICommunication) => {
  const { duration } = communication;
  if (communication.communicationType === CommunicationType.CALL) {
    return duration && duration?.value !== null
      ? `${formatDurationData(duration)}`
      : 'In Progress';
  }
  return '-';
};

export const displayTo = (communication: ICommunication) => {
  const { communicationType, to } = communication;
  if (communicationType === CommunicationType.EMAIL) {
    return to;
  }
  if (
    communicationType === CommunicationType.SMS ||
    communicationType === CommunicationType.CALL
  ) {
    return maskPhoneNumber(to);
  }
  return 'N/A';
};

export const displayTimestamp = (timestamp: { value: Date }) =>
  format(new Date(timestamp.value), 'dd/MM/yyyy (hh:mm:ss a)');

export const displayType = (communication: ICommunication) =>
  getString(`text.${communication.communicationType}`);

type communicationLogRow = {
  type: string;
  communication: {
    createBy: string;
    deleteTime: string | null;
    createTime: string;
    duration?: any;
  };
};

export const transformData = (messages: communicationLogRow[], users: any) => {
  const { selectData } = users;
  return messages.map((message, index) => {
    const { communication } = message;
    const m = {
      id: index + 1,
      communicationType: message.type,
      communication: { ...communication },
    };
    const createBy = selectData.find(
      (user: any) => communication.createBy === user.key
    );
    m.communication.createBy = createBy?.value || null;
    if (communication?.deleteTime) {
      m.communication.duration = intervalToDuration({
        start: new Date(communication.createTime),
        end: new Date(communication.deleteTime),
      });
    } else {
      m.communication.duration = null;
    }
    return m;
  });
};

/**
 * Downloads a file from a URL that returns a 307 redirect to Google Cloud Storage.
 * The function follows the redirect and downloads the file from the final GCS URL.
 *
 * @param url - The initial URL that will return a 307 redirect
 * @param fileName - The name to use for the downloaded file
 * @returns Promise<boolean> - Returns true if download succeeds, false otherwise
 */
export const downloadFile = async (
  url: string,
  fileName?: string
): Promise<boolean> => {
  try {
    // Make a request that will follow the 307 redirect to Google Cloud Storage
    const response = await fetch(url, {
      method: 'get',
      mode: 'cors',
      referrerPolicy: 'no-referrer',
      redirect: 'follow', // Automatically follow redirects (including 307)
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return false;
    }

    // Get the blob from the final redirected URL (Google Cloud Storage)
    const blob = await response.blob();

    // Create a download link and trigger the download
    const aElement = document.createElement('a');
    const resolvedFileName =
      fileName || new URL(response.url).pathname.split('/').pop();
    aElement.setAttribute('download', resolvedFileName!);
    const href = URL.createObjectURL(blob);
    aElement.href = href;
    aElement.setAttribute('target', '_blank');
    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
    URL.revokeObjectURL(href);

    return true;
  } catch (err) {
    console.error('Error downloading file from redirect URL:', err);
    return false;
  }
};
