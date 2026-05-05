export const matchParamsAndLink = (
  useQueryParams: boolean,
  baseUrl: string,
  queryParams: { [key: string]: any },
  concatRccidOnly: boolean = false
): string => {
  if (
    !useQueryParams ||
    !queryParams ||
    (Object.keys(queryParams).length === 0 && !concatRccidOnly)
  ) {
    return baseUrl;
  }

  const utmQuery: { [key: string]: any } = {};
  const randomRccidString = `rccid=${Math.random().toString(36).substring(2, 11)}`;

  // Concat Rccid only for specific page
  if (concatRccidOnly) {
    return baseUrl.concat(`?${randomRccidString}`);
  }

  // Populate utmQuery only with keys not equal to 'slug'
  Object.entries(queryParams).forEach(([key, value]) => {
    if (key !== 'slug') {
      utmQuery[key] = value;
    }
  });

  // Return the base URL if utmQuery is empty
  if (Object.keys(utmQuery).length === 0) {
    const { origin, pathname, search } = new URL(baseUrl);
    const separator = search ? '&' : '?';
    return `${origin}${pathname}${search}${separator}${randomRccidString}`;
  }

  const buttonURLObj = new URL(baseUrl);
  const params = new URLSearchParams(buttonURLObj.search);
  const paramsObj: { [key: string]: any } = {};

  // Convert URLSearchParams to an object
  params.forEach((value, key) => {
    paramsObj[key] = value;
  });

  // Merge existing params with utmQuery
  const mergeQuery = { ...paramsObj, ...utmQuery };

  // Convert final query object to a query string
  const mergeQueryString = Object.entries(mergeQuery)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');

  // Update the URL search params
  buttonURLObj.search = mergeQueryString.concat(`&${randomRccidString}`);

  return buttonURLObj.toString();
};
