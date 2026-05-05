import { IResource } from '../../../../../shared/interfaces/common/resource';
import Type from '../../type';

const UpdatePresence = (userName?: string): IResource => ({
  Type: Type.Public,
  Path: `/api/presence/v1alpha1/${userName}/presence`,
});

export default {
  UpdatePresence,
};
