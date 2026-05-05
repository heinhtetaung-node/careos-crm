export interface IAdminUserMock {
  id?: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  userName: string;
  product: number;
  productName?: string;
  team: number;
  teamName?: string;
  userRole: number;
  userRoleName?: string;
  dailyLimit?: number;
  totalLimit?: number;
  agentScore?: number;
  active?: boolean;
  status?: string;
  lastLoginOn?: string;
  createBy?: string;
  createOn?: string;
}
