interface QueryObjectType {
  [key: string]: string | number | null;
}

const generateQueryParams = (queryObj: QueryObjectType) => {
  const params = new URLSearchParams();

  Object.keys(queryObj).forEach((key: string) => {
    if (queryObj[key] && queryObj[key] !== '') {
      params.append(`${key}`, `${queryObj[key]}`);
    }
  });
  return params.toString();
};

export default generateQueryParams;
