import { Package } from 'interface';

import filterType1 from './filterType1';
import filterType12p3p from './filterType12p3p';
import filterType23 from './filterType23';

/**
 * Omission Logic Handler
 * @param {Object[]} packages
 * @param {Object} config
 */
const omissionFilter = (packages: Package[]) => [
  ...filterType1(packages),
  ...filterType1(packages, true),
  ...filterType12p3p(packages),
  ...filterType23(packages),
];

export default omissionFilter;
