import * as CONSTANTS from 'shared/constants';
import { IResource } from 'shared/interfaces/common/resource';

import Type from '../../type';

const CreateCallPath = (path: string): IResource => ({
  Type: Type.Public,
  Path: `/${CONSTANTS.apiUrl.call}/${path}`,
});

export default {
  CreateCallPath,
};
