export type Participant = {
  name: string;
  deleteTime: null | string;
  destination: {
    lead?: {
      lead: string;
      phoneIndex: number;
    };
    user?: {
      user: string;
    };
  };
  outgoing: true;
  state: string;
};

export type CallResponse = {
  participants: Participant[];
};

export type SDPDescription = {
  sdp: string;
  type: string;
};

export type AddLeadToCall = {
  callName: string;
  phoneIndex: number;
  leadName: string;
};

export type AddAgentToCall = {
  callName: string;
  agentName: string;
};
