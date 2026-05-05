// eslint-disable-next-line import/prefer-default-export
export const jsonToBase64 = (obj: object) => {
  const objJsonStr = JSON.stringify(obj);
  const objJsonB64 = Buffer.from(objJsonStr).toString('base64');
  return objJsonB64;
};
