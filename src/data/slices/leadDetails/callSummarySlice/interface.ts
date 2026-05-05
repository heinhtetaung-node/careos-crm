export interface ParamProps {
  [key: string]: number | string;
}

export interface ICallSummaryResponse {
  callSummary: {
    attempts: number;
    connects: number;
    totalDuration: number;
  };
}

export interface ICallSummary {
  totalCall: number | undefined;
  connectedCall: number | undefined;
  totalCallMinutes: number | undefined;
  totalCallSeconds: number | undefined;
}

export interface ICallSummaryRequest {
  id: string;
}

export interface ICallSummaryProps {
  id: string;
}
