import { LeadTypeFilter } from 'config/TypeFilter';
import WithFilterOptions from 'presentation/HOCs/WithFilterOptions';
import { getString } from 'presentation/theme/localization';

import TypeSelector from './TypeSelector';

const localeLeadTypeFilter = LeadTypeFilter.map((type: any) => ({
  ...type,
  title: getString(type.title),
}));

const LeadTypeMultiSelector = WithFilterOptions(
  TypeSelector,
  localeLeadTypeFilter
);

export default LeadTypeMultiSelector;
