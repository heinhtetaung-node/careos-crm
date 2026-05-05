// eslint-disable-next-line import/prefer-default-export
export const mockFetch = (value: any, status?: number) =>
  jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(
      new Response(
        new Blob([JSON.stringify(value)]),
        status ? { status } : undefined
      )
    );
