import copyTextToClipboard from './copyClipboard';

describe('copyTextToClipboard', () => {
  it('should call clipboard.writeText with the string passed', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const response = await copyTextToClipboard('Copy This Text');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'Copy This Text'
    );
    expect(response).toBeTruthy();
  });

  it('should return false when copying to clipboard fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest
          .fn()
          .mockImplementation(() =>
            Promise.reject(new Error('DOM not focused'))
          ),
      },
    });

    const response = await copyTextToClipboard('Copy This Text');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'Copy This Text'
    );
    expect(response).toBeFalsy();
  });

  it('should return false when clipboard api is not loaded or doesnt have permission', async () => {
    Object.assign(navigator);
    const response = await copyTextToClipboard('Copy This Text');
    expect(response).toBeFalsy();
  });
});
