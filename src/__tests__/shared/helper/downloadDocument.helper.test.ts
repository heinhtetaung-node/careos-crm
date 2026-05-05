import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

describe('downloadFileFromBlobURL', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('will create iframe tag append it to body', () => {
    const documentName = 'document/fakeDocumentResourceID';

    const createElementSpy = jest.spyOn(window.document, 'createElement');
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');

    downloadFileFromBlobURL(documentName);

    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(document.createElement).toHaveBeenCalledWith('iframe');
    expect(document.body.appendChild).toHaveBeenCalledTimes(1);

    appendChildSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});
