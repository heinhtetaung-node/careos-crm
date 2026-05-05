import * as Yup from 'yup';

import { ILeadSources } from 'shared/interfaces/common/lead/sources';

export const getInitialLeadSources = (): ILeadSources => ({
  product: '',
  online: false,
  hidden: false,
  source: '',
  medium: '',
  campaign: '',
});

// INFO: Just fake data, remove later
export const getFakeLeadSources = (): ILeadSources => ({
  name: 'sources/3d53000e-935f-414b-a432-53811fd0ee47',
  product: 'products/health-insurance',
  online: false,
  hidden: true,
  source: 'source test 4 5',
  medium: '',
  campaign: '',
});

export const createValidationSchema = () =>
  Yup.object().shape({
    source: Yup.string().trim().required('Required'),
    hidden: Yup.string().trim().required('Required'),
  });
