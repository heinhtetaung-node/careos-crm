import { createFilterOptions } from '@material-ui/lab/Autocomplete';

import { getString } from '../../theme/localization';

export const followConditions = (
  hasSelectAll: boolean,
  params: any,
  filtered: any
) => {
  if (hasSelectAll && !params.inputValue) {
    return [{ label: getString('text.selectAll'), value: 'all' }, ...filtered];
  }
  return [...filtered];
};

function useAutocomplete() {
  const filter = createFilterOptions();

  const handleFilterOptions = (
    hasSelectAll: boolean,
    opts: any,
    params: any
  ) => {
    const filtered = filter(opts, params);
    return followConditions(hasSelectAll, params, filtered);
  };

  return { handleFilterOptions };
}

export default useAutocomplete;
