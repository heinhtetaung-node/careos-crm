export interface IRequestLoginResponse {
  id: string;
  expires_at: string;
  issued_at: string;
  request_url: string;
  messages: string | null;
  methods: {
    password: {
      method: string;
      config: {
        action: string;
        method: string;
        fields: Array<{
          name: string;
          type: string;
          required: boolean;
          value?: string;
        }>;
      };
    };
  };
  forced: boolean;
}
