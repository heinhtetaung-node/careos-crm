export const INITIAL_LOGOUT_STATUS = 'select-status';
export enum LEAVE_TYPE {
  STATUS_UNSPECIFIED = 'STATUS_UNSPECIFIED',
  STATUS_IDLE = 'STATUS_IDLE',
  STATUS_CALL = 'STATUS_CALL',
  STATUS_AWAY = 'STATUS_AWAY',
  STATUS_OFFLINE = 'STATUS_OFFLINE',
}
export const LOGOUT_STATUS = [
  { id: 0, value: 'selectStatus', text: 'Select status' },
  { id: 1, value: 'lunch', text: 'Lunch' },
  { id: 2, value: 'coffee', text: 'Coffee' },
  { id: 3, value: 'training', text: 'Training' },
  { id: 4, value: 'meeting', text: 'Meeting' },
  { id: 5, value: 'toilet', text: 'Toilet' },
  { id: 6, value: 'dayend', text: 'Day End' },
];
