import { downloadfileFromLink } from './downloadDocumentHelper';

describe('downloadfileFromLink', () => {
  it('should open new page and download', () => {
    const mockLink = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn(),
    };
    jest
      .spyOn(document, 'createElement')
      .mockImplementation(() => mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(jest.fn());
    downloadfileFromLink('link');
    expect(mockLink.setAttribute).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.remove).toHaveBeenCalled();
  });
});
