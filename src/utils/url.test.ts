import { buildUrl } from './url';

describe('test buildUrl', () => {
  it('concat url correctly', () => {
    expect(buildUrl('https://example.com', { path: 'post' })).toEqual(
      'https://example.com/post'
    );
  });

  it('concat url correctly if path contains a slash', () => {
    expect(buildUrl('https://example.com', { path: '/post' })).toEqual(
      'https://example.com/post'
    );
  });

  it('concat url correctly if domain contains a path', () => {
    expect(buildUrl('https://example.com/dev/.org', { path: '/post' })).toEqual(
      'https://example.com/dev/.org/post'
    );
  });
});
