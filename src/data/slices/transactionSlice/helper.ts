export const fileSizeConstants = {
  SMALL: 2097152, // 2MB
  MEDIUM: 5242880, // 5MB
  LARGE: 10485760, // 10MB
  EXTRA_LARGE: 20971520, // 20MB
};

export const findFileSize = (size: number) => {
  if (size <= fileSizeConstants.SMALL) {
    return 'SMALL';
  }
  if (size <= fileSizeConstants.MEDIUM) {
    return 'MEDIUM';
  }
  if (size <= fileSizeConstants.LARGE) {
    return 'LARGE';
  }
  return 'EXTRA_LARGE';
};
