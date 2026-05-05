export const buildUrl = (domain: string, { path }: { path: string }) => {
  const baseUrl = new URL(domain);
  let urlPath = path;

  if (baseUrl.pathname) {
    if (baseUrl.pathname.slice(-1) !== '/') {
      baseUrl.pathname += '/';
    }

    urlPath = baseUrl.pathname + path.replace(/^\//, '');
  }

  return new URL(urlPath, baseUrl.origin).href;
};

export const untestFn = () => {
  console.log('untest');
  return 'untested';
};

// can be used only if using filter panel => presentation/components/FilterPanel
export const buildFilter = (
  filters: Record<string, Record<string, string>[]>,
  customFilterName: Record<string, string>
) => {
  const filterParts: string[] = [];

  Object.entries(filters).forEach(([key, values]) => {
    if (values?.length > 0) {
      const formattedValues = values
        .map((data) => `"${data?.value}"`)
        .join(',');
      const filterPart = `${customFilterName[key]} in (${formattedValues})`;
      filterParts.push(filterPart);
    }
  });

  return filterParts.join(' ');
};
