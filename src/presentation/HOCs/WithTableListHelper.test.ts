import { getCustomAction } from './WithTableListHelper';

describe('getCustomAction', () => {
  it('creates anchor tag, adds the link to href and when clicked open the passed link on a new window', () => {
    const mContainer = { appendChild: jest.fn() };
    const mLink = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn(),
    };
    document.createElement = jest.fn().mockImplementation(() => mLink);
    document.body.appendChild = jest.fn().mockImplementation(() => mContainer);

    getCustomAction('https://www.google.com/', 'package');

    expect(mLink.setAttribute.mock.calls[0]).toEqual(['target', '_blank']);
    expect(mLink.setAttribute.mock.calls[1]).toEqual([
      'href',
      'https://www.google.com/',
    ]);
  });
});
