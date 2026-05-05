import { ProductTypeFilter } from 'config/TypeFilter';
import WithFilterOptions from 'presentation/HOCs/WithFilterOptions';

import TypeSelector from './TypeSelector';

const ProductTypeMultiSelector = WithFilterOptions(
  TypeSelector,
  ProductTypeFilter
);

export default ProductTypeMultiSelector;
