import * as Yup from 'yup';

import { getString } from 'presentation/theme/localization';

interface TeamRole {
  name: string;
  title: string;
  value: string;
}

const buildValidationSchema = (roles: string[]) =>
  Yup.object().shape({
    teamRole: Yup.object({
      name: Yup.string(),
      title: Yup.string(),
      value: Yup.string(),
    }).required(getString('text.error', { field: 'Team Role' })),
    insurer: Yup.array().when('teamRole', {
      is: (teamRole: TeamRole) => !roles.includes(teamRole.value),
      then: () =>
        Yup.array()
          .of(
            Yup.object({
              displayName: Yup.string(),
              shortnameEn: Yup.string(),
              name: Yup.string(),
            })
          )
          .min(1)
          .required(getString('text.error', { field: 'Insurer' })),
    }),
    teamName: Yup.string()
      .required(getString('text.error', { field: 'Team Name' }))
      .trim(),
    product: Yup.object().when('teamRole', {
      is: (teamRole: TeamRole) => roles.includes(teamRole.value),
      then: () =>
        Yup.object({
          id: Yup.number(),
          value: Yup.string().required(),
          title: Yup.string(),
        }).required(getString('text.error', { field: 'Product' })),
    }),
    leadType: Yup.object().when('teamRole', {
      is: (teamRole: TeamRole) => roles.includes(teamRole.value),
      then: () =>
        Yup.object({
          id: Yup.number(),
          leadType: Yup.string().required(),
          value: Yup.string().required(),
          title: Yup.string(),
        }).required(getString('text.error', { field: 'Lead Type' })),
    }),
    manager: Yup.object({
      title: Yup.string(),
      value: Yup.string().required(),
    }).required(getString('text.error', { field: 'Manager' })),
    supervisor: Yup.object({
      title: Yup.string(),
      value: Yup.string().required(),
    }).required(getString('text.error', { field: 'Supervisor' })),
  });

export default buildValidationSchema;
