// eslint-disable-next-line import/prefer-default-export
export const dataURItoFile = async (dataURL: string) => {
  const response = await fetch(dataURL);
  const blob = await response.blob();

  return new File([blob], 'fileName.jpg', {
    type: 'image/png',
    lastModified: new Date().getTime(),
  });
};
