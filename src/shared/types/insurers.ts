export interface Insurer {
  name: string;
  displayName: string;
  displayNameTh?: string;
  order: number;
}

export interface InsurersResponse {
  insurers: Insurer[];
  nextPageToken: string;
}

export type InsuranceKind = 'both' | 'mandatory' | 'voluntary';

export type DownloadInsuranceKind = 'MANDATORY' | 'BOTH' | 'VOLUNTARY';
