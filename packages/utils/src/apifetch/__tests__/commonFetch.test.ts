import { commonFetch } from '../commonFetch';
import { mockFetch } from '../test-utils';

describe('commonFetch', () => {
  test('success', async () => {
    const mockFn = mockFetch({ name: 'names/uuid' });
    const res = await commonFetch('Url', { method: 'post', body: 'body' });
    expect(mockFn).toBeCalledWith('Url', { body: 'body', method: 'post' });
    expect(res).toEqual({ name: 'names/uuid' });
  });

  test('error', async () => {
    const mockFn = mockFetch({}, 404);
    await expect(async () =>
      commonFetch('Url', { method: 'post', body: 'body' })
    ).rejects.toThrow();
    expect(mockFn).toBeCalledWith('Url', { body: 'body', method: 'post' });
  });
});
