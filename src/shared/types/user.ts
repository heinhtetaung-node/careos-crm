export type User = {
  annotations: Record<string, string | number>;
  firstName: string;
  lastName: string;
  humanId: string;
  name: string;
  loginTime: string;
  role: string;
  product?: string;
};
