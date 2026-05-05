import type { FileRejection } from 'react-dropzone';

// eslint-disable-next-line import/prefer-default-export
export const decodeFileDropErrors = (errors: readonly FileRejection[]) => {
  const errorMessages = errors.reduce(
    (p, v) => p.concat(v.errors.map((x) => x.message)),
    [] as string[]
  );
  return errorMessages.join('\n');
};
