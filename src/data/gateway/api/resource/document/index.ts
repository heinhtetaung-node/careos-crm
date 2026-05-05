import { IResource } from 'shared/interfaces/common/resource';

import Type from '../../type';

const apiUrl = '/api/document/v1alpha1';

const uploadDocument = (): IResource => ({
  Type: Type.Public,
  Path: `${apiUrl}/documents`,
});

export default {
  uploadDocument,
};
