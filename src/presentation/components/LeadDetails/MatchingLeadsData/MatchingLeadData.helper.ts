function flattenObject(obj: any, result: any = {}) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenObject(obj[key], result);
    } else {
      // eslint-disable-next-line no-param-reassign
      result[key] = obj[key];
    }
  });
  return result;
}

// eslint-disable-next-line import/prefer-default-export
export { flattenObject };
