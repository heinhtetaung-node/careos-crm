import { get, has } from 'lodash';

import { CarQuery } from './types';

const queryOrder = ['brands', 'models', 'submodels', 'years'];

// eslint-disable-next-line import/prefer-default-export
export const getCarDataQueryPath = (query: CarQuery) => {
  let path = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const resource of queryOrder) {
    if (resource !== query.resourceType) {
      path += `${resource}/${get(query, resource, '-')}/`;
    } else {
      path += has(query, resource)
        ? `${resource}/${get(query, resource)}`
        : resource;
      break;
    }
  }
  return path;
};
