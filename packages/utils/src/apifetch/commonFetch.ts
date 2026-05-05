// eslint-disable-next-line import/prefer-default-export
export const commonFetch = async (url: string, option?: RequestInit) =>
  fetch(url, option).then((r) => {
    if (r.ok) {
      return r.json();
    }
    throw Error('api error');
  });
