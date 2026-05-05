// eslint-disable-next-line import/prefer-default-export
export const getErrorMessageFromErrorObj = (responseData: Record<any, any>) => {
  if (responseData.errors) {
    return Object.entries(responseData.errors)
      .map(([key, value]: any) => `${key} : ${value.join(', ')}`)
      .join('\n');
  }
  return responseData.message;
};
