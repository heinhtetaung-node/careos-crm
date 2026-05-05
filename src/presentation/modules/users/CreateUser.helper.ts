import * as Yup from 'yup';

export interface ITeamOptions {
  [key: string]: number | string;
}

export const scores = [
  { id: 1, title: '1', value: '1' },
  { id: 2, title: '2', value: '2' },
  { id: 3, title: '3', value: '3' },
  { id: 4, title: '4', value: '4' },
];

export const getInitialUser = () => ({
  role: '',
  name: '',
  firstName: '',
  lastName: '',
  humanId: '',
  team: '',
  dailyLimit: '',
  totalLimit: '',
  agentScore: '',
  enabled: false,
  language: 'TH',
});

export const filterTeam = (
  teamList: ITeamOptions[] = [],
  productId: number
) => {
  const teams = teamList.filter((item) => item?.productId === productId);
  return teams;
};

export const createValidationSchema = (
  saleRole: string,
  backOfficeRole: string[]
) =>
  Yup.object().shape({
    role: Yup.string().required('Required'),
    firstName: Yup.string().trim().required('Required'),
    lastName: Yup.string().trim().required('Required'),
    humanId: Yup.string().trim().required('Required'),
    team: Yup.string().when('role', {
      is: (role: string) => role === saleRole || backOfficeRole.includes(role),
      then: (schema) => schema.required('Required'),
    }),
    dailyLimit: Yup.number().when('role', {
      is: (role: string) => role === saleRole,
      then: () => Yup.number().required('Required'),
    }),
    totalLimit: Yup.number().when('role', {
      is: (role: string) => role === saleRole,
      then: () => Yup.number().required('Required'),
    }),
    agentScore: Yup.number().when('role', {
      is: (role: string) => role === saleRole,
      then: () => Yup.number().required('Required'),
    }),
  });
