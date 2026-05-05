import {
  displayDuration,
  displayTimestamp,
  formatDurationData,
  downloadFile,
} from './helper';

describe('displayTimestamp', () => {
  it('returns formatted date value', () => {
    const value = new Date('1 January 1970');
    const result = displayTimestamp({ value });
    expect(result).toEqual('01/01/1970 (12:00:00 AM)');
  });

  it('returns the passed date in correct format', () => {
    const value = new Date('2024-01-03T06:38:07.603510Z');
    const result = displayTimestamp({ value });
    expect(result).toEqual('03/01/2024 (01:38:07 PM)');
  });

  it('returns the passed date in correct format', () => {
    const result = displayTimestamp({
      value: '2022-06-28T12:00:44.289684Z' as unknown as Date,
    });
    expect(result).toEqual('28/06/2022 (07:00:44 PM)');
  });
});

describe('formatDurationData', () => {
  it('returns formatted duration', () => {
    const result = formatDurationData({ minutes: 10, seconds: 10 });
    expect(result).toEqual('10:10 text.minutesAcronym');
  });

  it('returns formatted duration', () => {
    const result = formatDurationData({ seconds: 39 });
    expect(result).toEqual('0:39 text.minutesAcronym');
  });
});

describe('displayDuration', () => {
  it('returns formatted duration', () => {
    const result = displayDuration({
      duration: { minutes: 1 },
      communicationType: 'call',
    } as any);

    expect(result).toEqual('1:00 text.minutesAcronym');
  });

  it('returns formatted duration', () => {
    const result = displayDuration({
      duration: { minutes: 30, seconds: 55 },
      communicationType: 'call',
    } as any);

    expect(result).toEqual('30:55 text.minutesAcronym');
  });
});

describe('downloadFile', () => {
  let mockFetch: jest.Mock;
  let mockCreateElement: jest.Mock;
  let mockAppendChild: jest.Mock;
  let mockRemoveChild: jest.Mock;
  let mockClick: jest.Mock;
  let mockCreateObjectURL: jest.Mock;
  let mockRevokeObjectURL: jest.Mock;
  let mockAnchorElement: any;

  beforeEach(() => {
    mockClick = jest.fn();
    mockAnchorElement = {
      setAttribute: jest.fn(),
      href: '',
      click: mockClick,
    };

    mockCreateElement = jest.fn(() => mockAnchorElement);
    mockAppendChild = jest.fn();
    mockRemoveChild = jest.fn();

    document.createElement = mockCreateElement;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('successfully downloads file with provided fileName', async () => {
    const mockBlob = new Blob(['test content'], { type: 'text/plain' });
    const mockResponse = {
      ok: true,
      url: 'https://storage.googleapis.com/bucket/file.txt',
      blob: jest.fn().mockResolvedValue(mockBlob),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await downloadFile(
      'https://example.com/redirect',
      'test.txt'
    );

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/redirect', {
      method: 'get',
      mode: 'cors',
      referrerPolicy: 'no-referrer',
      redirect: 'follow',
      credentials: 'same-origin',
    });
    expect(mockResponse.blob).toHaveBeenCalled();
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAnchorElement.setAttribute).toHaveBeenCalledWith(
      'download',
      'test.txt'
    );
    expect(mockAnchorElement.setAttribute).toHaveBeenCalledWith(
      'target',
      '_blank'
    );
    expect(mockAppendChild).toHaveBeenCalledWith(mockAnchorElement);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchorElement);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('successfully downloads file without fileName, extracting from URL', async () => {
    const mockBlob = new Blob(['test content'], { type: 'text/plain' });
    const mockResponse = {
      ok: true,
      url: 'https://storage.googleapis.com/bucket/document.pdf',
      blob: jest.fn().mockResolvedValue(mockBlob),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await downloadFile('https://example.com/redirect');

    expect(result).toBe(true);
    expect(mockAnchorElement.setAttribute).toHaveBeenCalledWith(
      'download',
      'document.pdf'
    );
  });

  it('uses "download" as default fileName when URL has no filename', async () => {
    const mockBlob = new Blob(['test content'], { type: 'text/plain' });
    const mockResponse = {
      ok: true,
      url: 'https://storage.googleapis.com/bucket/',
      blob: jest.fn().mockResolvedValue(mockBlob),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await downloadFile('https://example.com/redirect');

    expect(result).toBe(true);
  });

  it('handles URL with query parameters', async () => {
    const mockBlob = new Blob(['test content'], { type: 'text/plain' });
    const mockResponse = {
      ok: true,
      url: 'https://storage.googleapis.com/bucket/file.pdf?token=abc123',
      blob: jest.fn().mockResolvedValue(mockBlob),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await downloadFile('https://example.com/redirect');

    expect(result).toBe(true);
    expect(mockAnchorElement.setAttribute).toHaveBeenCalledWith(
      'download',
      'file.pdf'
    );
  });

  it('returns false when response is not ok', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      blob: jest.fn(),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await downloadFile(
      'https://example.com/redirect',
      'test.txt'
    );

    expect(result).toBe(false);
    expect(mockResponse.blob).not.toHaveBeenCalled();
    expect(mockCreateElement).not.toHaveBeenCalled();
  });

  it('returns false and logs error when fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Network error');
    mockFetch.mockRejectedValue(error);

    const result = await downloadFile(
      'https://example.com/redirect',
      'test.txt'
    );

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error downloading file from redirect URL:',
      error
    );
    expect(mockCreateElement).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('returns false and logs error when blob conversion fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockResponse = {
      ok: true,
      url: 'https://storage.googleapis.com/bucket/file.txt',
      blob: jest.fn().mockRejectedValue(new Error('Blob conversion failed')),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await downloadFile(
      'https://example.com/redirect',
      'test.txt'
    );

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockCreateElement).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
