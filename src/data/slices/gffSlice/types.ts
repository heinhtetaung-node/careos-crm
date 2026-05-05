export type LookupRequest = {
  query: string;
  role?: string;
};

export type SearchUserResponse = {
  users: {
    name: string;
    displayName: string;
  }[];
};

export type MatchingLeadsRequest = {
  leadId: string;
};

type MatchingCarData = {
  licensePlate: string;
  car: string;
};

export type MatchingLeadsResponse = {
  name: string;
  score: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  car: MatchingCarData;
};

export type RecordObject = {
  resource: any;
  [key: string]: any;
};

export type HistoryResponse = {
  record: RecordObject;
};
