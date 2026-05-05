export enum QCActions {
  QCActionApprove = 'QC_ACTION_APPROVE',
  QCActionReject = 'QC_ACTION_REJECT',
  QCActionSalesNeedToFix = 'QC_ACTION_SALES_FIXED',
}

export enum AnswerSheets {
  CRITICAL_MOTOR_ANSWER_SHEET = 'critical_motor_answer_sheet',
  NON_CRITICAL_MOTOR_ANSWER_SHEET = 'nonCriticalMotorAnswerSheet',
  PACKAGE_ANSWER_SHEET = 'package_answer_sheet',
}

export interface MotorAnswerSheet {
  critical_motor_answer_sheet: Record<string, boolean>;
  nonCriticalMotorAnswerSheet: Record<string, boolean>;
}

export interface HealthAnswerSheet {
  critical_health_answer_sheet: Record<string, boolean>;
  nonCriticalHealthAnswerSheet: Record<string, boolean>;
}

export interface QcQuestionsDataResponse {
  order: string;
  createTime: string;
  updateTime: string;
  motor_answer_sheet: MotorAnswerSheet;
  motorAnswerSheet?: any;
  healthAnswerSheet?: any;
}

export interface QcAddonsDataResponse {
  addons: Record<string, any>[];
}

export interface QCSavePayload {
  name: string;
  qc_action: QCActions;
  motor_answer_sheet?: MotorAnswerSheet;
  health_answer_sheet?: HealthAnswerSheet;
}

export interface QCGetPayload {
  orderId: string;
}
