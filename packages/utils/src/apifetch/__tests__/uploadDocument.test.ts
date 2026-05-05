import { mockFetch } from '../test-utils';
import { SizeLimit, uploadDocumentViaDocumentService } from '../uploadDocument';

describe('uploadDocument', () => {
  test.each([
    SizeLimit.SMALL,
    SizeLimit.MEDIUM,
    SizeLimit.LARGE,
    SizeLimit.EXTRA_LARGE,
  ])('error', async (size: SizeLimit) => {
    const testImageFile = new File(['hello'], 'hello.png', {
      type: 'image/png',
    });
    Object.defineProperty(testImageFile, 'size', {
      value: size,
    });

    mockFetch({}, 404);
    await expect(async () =>
      uploadDocumentViaDocumentService('Url', testImageFile)
    ).rejects.toThrow();
  });

  test.each([
    SizeLimit.SMALL,
    SizeLimit.MEDIUM,
    SizeLimit.LARGE,
    SizeLimit.EXTRA_LARGE,
  ])('success', async (size: SizeLimit) => {
    const testImageFile = new File(['hello'], 'hello.png', {
      type: 'image/png',
    });
    Object.defineProperty(testImageFile, 'size', {
      value: size,
    });

    mockFetch({ success: true }, 200);
    // eslint-disable-next-line no-unused-expressions
    expect(() => uploadDocumentViaDocumentService('Url', testImageFile))
      .resolves;
  });
});
