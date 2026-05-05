import { CommonAPIResponse } from '../../types';

// GENERATE SCRIPT
export interface ScriptResponse {
  script: string;
}

// SAVE SCRIPT
export interface ScriptResponseType extends CommonAPIResponse {
  name: string;
  text: string;
}

export interface SaveScriptRequestPayload {
  leadId: string;
  text: string;
}

// FETCH SCRIPTS
export interface FetchScriptRequestProps {
  leadId: string;
  scriptParams: Record<string, number | string>;
}

export interface FetchScriptResponsePayload {
  scripts: ScriptResponseType[];
  nextPageToken: string;
}
