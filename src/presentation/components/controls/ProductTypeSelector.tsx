import { ProductTypeFilter } from 'config/TypeFilter';
import Select from 'presentation/components/controls/Select';
import WithFilterOptions from 'presentation/HOCs/WithFilterOptions';

const ProductTypeSelector = WithFilterOptions(Select, ProductTypeFilter);

export default ProductTypeSelector;
