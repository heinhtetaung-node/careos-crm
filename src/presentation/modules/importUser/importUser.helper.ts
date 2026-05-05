import { getString } from 'presentation/theme/localization';

import { UserRole, UserStatus } from '../../../mock-data/AdminUser.mock';

const DAILY_LEAD_LIMIT = 'Daily Lead Limit';
const TOTAL_LEAD_LIMIT = 'Total Lead Limit';
const AGENT_SCORE = 'Agent Score';
const ASSIGNED_TEAM = 'Assigned Team';
const USER_STATUS = 'User Status';
const USER_NAME = 'User Name';
const USER_ROLE = 'User Role';

interface IRowMissing {
  [key: string]: number | string | boolean;
}

export enum COLUMNS_ERROR_TYPE {
  DAILY_LEAD_LIMIT_TYPE = 1,
  TOTAL_LEAD_LIMIT_TYPE = 2,
  AGENT_SCORE_TYPE = 3,
  ASSIGNED_TEAM_TYPE = 4,
  USER_STATUS_TYPE = 5,
  USER_NAME_TYPE = 6,
  ROLE_INVALID = 7,
  STATUS_INVALID = 8,
}

// eslint-disable-next-line consistent-return
const getStringType = (type: COLUMNS_ERROR_TYPE) => {
  if (type === COLUMNS_ERROR_TYPE.DAILY_LEAD_LIMIT_TYPE)
    return DAILY_LEAD_LIMIT;
  if (type === COLUMNS_ERROR_TYPE.TOTAL_LEAD_LIMIT_TYPE)
    return TOTAL_LEAD_LIMIT;
  if (type === COLUMNS_ERROR_TYPE.AGENT_SCORE_TYPE) return AGENT_SCORE;
  if (type === COLUMNS_ERROR_TYPE.ASSIGNED_TEAM_TYPE) return ASSIGNED_TEAM;
  if (type === COLUMNS_ERROR_TYPE.USER_STATUS_TYPE) return USER_STATUS;
  if (type === COLUMNS_ERROR_TYPE.USER_NAME_TYPE) return USER_NAME;
  if (type === COLUMNS_ERROR_TYPE.ROLE_INVALID) return USER_ROLE;
  if (type === COLUMNS_ERROR_TYPE.STATUS_INVALID) return USER_STATUS;
};

export const pushErrorMissingColumn = (data: number[], type: number) => {
  const rowError: string[] = [];
  data.forEach((row) => {
    rowError.push(
      getString('text.requiredRowsValidation', {
        column: getStringType(type),
        name: getString('text.user'),
        row,
      })
    );
  });
  return rowError;
};

export const pushErrorUnnecessaryColumn = (data: number[], type: number) => {
  const rowError: string[] = [];
  data.forEach((row) => {
    rowError.push(
      getString('text.unnecessaryRowsValidation', {
        column: getStringType(type),
        name: getString('text.user'),
        row,
      })
    );
  });
  return rowError;
};

export const pushErrorInvalidColumn = (data: any[], type: number) => {
  const rowError: string[] = [];
  data.forEach((item) => {
    rowError.push(
      getString('text.rowExcelInvalid', {
        row: item.index,
        name: getStringType(type),
        value: item.value,
      })
    );
  });
  return rowError;
};
export const getRowMissing = (results: IRowMissing[]) => {
  const missTeam: number[] = [];
  const missDaily: number[] = [];
  const missTotal: number[] = [];
  const missScore: number[] = [];
  const hasTeam: number[] = [];
  const hasDaily: number[] = [];
  const hasTotal: number[] = [];
  const hasScore: number[] = [];
  const hasRoleInvalid: any[] = [];
  const hasStatusInvalid: any[] = [];
  results.forEach((row, index: number) => {
    // INFO: Because first row file csv  is header,  we need to increment one
    const rowIndex = index + 1;
    const role = row['User Role']?.toString().toLowerCase();
    const status = row['User Status']?.toString().toLowerCase();
    const backOfficeRoles = [
      'Customer Service Agent',
      'Documents Collection Agent',
      'Quality Control Agent',
      'Submission Agent',
    ].map((item) => item.toLowerCase());
    if (role === 'sales agent') {
      if (!row[ASSIGNED_TEAM]) missTeam.push(rowIndex);
      if (!row[DAILY_LEAD_LIMIT]) missDaily.push(rowIndex);
      if (!row[TOTAL_LEAD_LIMIT]) missTotal.push(rowIndex);
      if (!row[AGENT_SCORE]) missScore.push(rowIndex);
    } else if (backOfficeRoles.includes(role)) {
      if (!row[ASSIGNED_TEAM]) missTeam.push(rowIndex);
      if (row[DAILY_LEAD_LIMIT]) hasDaily.push(rowIndex);
      if (row[TOTAL_LEAD_LIMIT]) hasTotal.push(rowIndex);
      if (row[AGENT_SCORE]) hasScore.push(rowIndex);
    } else {
      if (row[ASSIGNED_TEAM]) hasTeam.push(rowIndex);
      if (row[DAILY_LEAD_LIMIT]) hasDaily.push(rowIndex);
      if (row[TOTAL_LEAD_LIMIT]) hasTotal.push(rowIndex);
      if (row[AGENT_SCORE]) hasScore.push(rowIndex);
    }
    const findRole = UserRole.find((item) => item.title.toLowerCase() === role);
    // INFO: validate user status only accept 2 value 'Inactive' and 'Active'
    const findStatus = UserStatus.find(
      (item) => item.title.toLowerCase() === status
    );
    if (!findRole) {
      hasRoleInvalid.push({
        index: rowIndex,
        value: role,
      });
    }
    if (!findStatus) {
      hasStatusInvalid.push({
        index: rowIndex,
        value: status,
      });
    }
  });
  return {
    missTeam,
    missDaily,
    missTotal,
    missScore,
    hasTeam,
    hasDaily,
    hasTotal,
    hasScore,
    hasRoleInvalid,
    hasStatusInvalid,
  };
};

export const getListErrorHandle = (
  missTeam: number[],
  missDaily: number[],
  missTotal: number[],
  missScore: number[],
  hasTeam: number[],
  hasDaily: number[],
  hasTotal: number[],
  hasScore: number[],
  hasRoleInvalid: any[],
  hasStatusInvalid: any[]
) => {
  let errorList: string[] = [];
  const data = [
    {
      field: missTeam,
      type: 'missing',
      title: COLUMNS_ERROR_TYPE.ASSIGNED_TEAM_TYPE,
    },
    {
      field: missDaily,
      type: 'missing',
      title: COLUMNS_ERROR_TYPE.DAILY_LEAD_LIMIT_TYPE,
    },
    {
      field: missTotal,
      type: 'missing',
      title: COLUMNS_ERROR_TYPE.TOTAL_LEAD_LIMIT_TYPE,
    },
    {
      field: missScore,
      type: 'missing',
      title: COLUMNS_ERROR_TYPE.AGENT_SCORE_TYPE,
    },
    {
      field: hasTeam,
      title: COLUMNS_ERROR_TYPE.ASSIGNED_TEAM_TYPE,
    },
    {
      field: hasDaily,
      title: COLUMNS_ERROR_TYPE.DAILY_LEAD_LIMIT_TYPE,
    },
    {
      field: hasTotal,
      title: COLUMNS_ERROR_TYPE.TOTAL_LEAD_LIMIT_TYPE,
    },
    {
      field: hasScore,
      title: COLUMNS_ERROR_TYPE.AGENT_SCORE_TYPE,
    },
    {
      type: 'invalid',
      field: hasRoleInvalid,
      title: COLUMNS_ERROR_TYPE.ROLE_INVALID,
    },
    {
      type: 'invalid',
      field: hasStatusInvalid,
      title: COLUMNS_ERROR_TYPE.STATUS_INVALID,
    },
  ];
  data.forEach((item) => {
    if (item.type === 'missing') {
      errorList = [
        ...errorList,
        ...pushErrorMissingColumn(item.field, item.title),
      ];
    }
    if (item.type === 'invalid') {
      errorList = [
        ...errorList,
        ...pushErrorInvalidColumn(item.field, item.title),
      ];
    } else {
      errorList = [
        ...errorList,
        ...pushErrorUnnecessaryColumn(item.field, item.title),
      ];
    }
  });
  return errorList;
};
