import { HttpResponse, http } from 'msw';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';

import { useGetInstallmentOptionsQuery } from '.';

const mockGffHandler = jest.fn();

describe.skip('useGetPaymentOptionQuery', () => {
  beforeEach(() => {
    mockGffHandler.mockClear();
    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leadId:paymentOptions`,
        () => HttpResponse.json(mockGffHandler())
      )
    );
  });

  it('should call go bff if flag is on', async () => {
    mockGffHandler.mockReturnValue({
      paymentOptions: [{ installments: 1 }, { installments: 2 }],
    });
    const { result } = renderHook(() =>
      useGetInstallmentOptionsQuery('leadId')
    );
    await waitFor(() => expect(mockGffHandler).toHaveBeenCalled());
    expect((result.current as any).data).toEqual([
      { id: 1, title: 'text.installment', value: 1 },
      { id: 2, title: 'text.installments', value: 2 },
    ]);
  });
});
