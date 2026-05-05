import DiscountMockData from '@alphafounders/mock-data/json/discountPage.json';
import mockDocuments from '@alphafounders/mock-data/json/uploadedCustomerDocuments.json';
import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import getApiEndpoint from 'utils/endpointHelper';

import { ApprovalStatusTypes } from './types';

import { apiSlice } from '../apiSlice';

import {
  useLazyGetCampaignsQuery,
  useLazyGetVouchersQuery,
  useUpdateVoucherMutation,
  useCreateVoucherMutation,
  useUpdateVoucherStatusMutation,
  useDeactivateCampaignMutation,
  useActivateCampaignMutation,
  useCreateCampaignMutation,
  useLazyGetDiscountsRequestQuery,
  useDiscountApprovalMutation,
  useEditCampaignMutation,
  useGetAllCampaignsQuery,
  useLazyGetDiscountRequestDocumentsQuery,
} from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const DemoVoucherResponse = {
  vouchers: DiscountMockData.vouchers,
  nextPageToken: DiscountMockData.nextPageToken,
};
const DemoCampaignResponse = {
  campaigns: [DiscountMockData.campaigns[0]],
  nextPageToken: DiscountMockData.nextPageToken,
};
const DemoDiscountResponse = {
  requests: DiscountMockData.discounts,
  total: 1,
};

describe.skip('Testing Discount Query API ', () => {
  beforeEach(() => {
    server.use(
      http.get(
        getApiEndpoint(`/api/discount/v1alpha1/campaigns`),
        ({ params }) => {
          const nextPageToken = params.pageToken as string;

          return HttpResponse.json({
            ...DemoCampaignResponse,
            nextPageToken: nextPageToken ? '' : 'token123',
          });
        }
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/campaigns`,
        () =>
          HttpResponse.json({
            ...DemoCampaignResponse.campaigns[0],
          })
      ),
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/campaigns/f016c4f1-f6f4-4d77-baab-1e9f50cf22be`,
        () =>
          HttpResponse.json({
            ...DemoCampaignResponse.campaigns[0],
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/vouchers`,
        () =>
          HttpResponse.json({
            ...DemoVoucherResponse,
          })
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/vouchers`,
        () =>
          HttpResponse.json({
            ...DemoVoucherResponse.vouchers[0],
          })
      ),
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/vouchers`,
        () => HttpResponse.json(DemoVoucherResponse.vouchers[0])
      ),
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/${DemoVoucherResponse.vouchers[0].name}`,
        () => HttpResponse.json(DemoVoucherResponse.vouchers[0])
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/campaigns/name:undelete`,
        () => HttpResponse.json({ success: true })
      ),
      http.delete(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/campaigns/name`,
        () => HttpResponse.json({ success: true })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/discountRequests`,
        () =>
          HttpResponse.json({
            ...DemoDiscountResponse,
          })
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/${DiscountMockData.discounts[0].request.name}:decide`,
        () =>
          HttpResponse.json({
            name: 'name',
            createTime: '2023-02-27T08:19:21.286397Z',
            updateTime: '2023-03-14T04:32:09.340809Z',
            deleteTime: null,
            status: 'REJECTED',
            createBy: 'users',
            decideBy: 'users',
            percentage: 690,
            maxPercentage: 800,
            source: 'source',
            approver: 'users',
            remark: 'demo rejected reason',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`,
        () =>
          HttpResponse.json({
            insurers: [
              {
                name: 'insurers/42',
                displayName: 'FPG Insurance',
                displayNameTh: 'เอฟพีจี ประกันภัย',
                shortnameEn: 'FPG',
                shortnameTh: 'เอฟพีจี',
                rating: 0,
                order: 0,
                logo: '',
                phone: '0-2231-2640',
                website: 'https://www.fpgins.com/ ',
              },
            ],
          })
      ),
      http.get(
        getApiEndpoint(
          `/api/discount/v1alpha1/requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2/documents`
        ),
        () =>
          HttpResponse.json({
            documents: [mockDocuments.documents[0]],
            nextPageToken: '',
          })
      ),
      http.get(
        getApiEndpoint(
          `/api/document/v1alpha1/documents/f8302b2c-9018-4a99-ae05-fef3fc976aab`
        ),
        () => HttpResponse.json(mockDocuments.documents[0])
      )
    );
  });

  test('Test GetCampaigns API', async () => {
    const { result } = renderHook(() => useLazyGetCampaignsQuery({}), {
      wrapper,
    });
    const [getCampaigns] = result.current;

    await act(async () => {
      await getCampaigns({
        tableType: 'discountsCampaign',
        listPageToken: [],
        queryParams: { filter: '' },
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        imports: [
          {
            ...DemoCampaignResponse.campaigns[0],
            discountPercentage: 1.75,
            endDate: '31/03/2023',
            startDate: '03/02/2023',
            approver: 'manager',
          },
        ],
        filter: '',
        listPageToken: [{ page: 1, token: 'token123' }],
        nextPageToken: 'token123',
        pageIndex: undefined,
      });
    });
  });
  test('Test GetAllCampaigns API', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useGetAllCampaignsQuery({}),
      {
        wrapper,
      }
    );

    expect(result.current.isLoading).toBeTruthy();

    await waitForNextUpdate();

    await waitFor(() => {
      expect(result.current.data).toEqual({
        campaigns: [
          ...DemoCampaignResponse.campaigns,
          DemoCampaignResponse.campaigns[0],
        ],
        nextPageToken: '',
      });
    });
  });
  test('Test CreateCampaign API', async () => {
    const { result } = renderHook(() => useCreateCampaignMutation({}), {
      wrapper,
    });
    const [createCampaign] = result.current;

    await act(async () => {
      await createCampaign({
        body: DemoCampaignResponse.campaigns[0],
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(DemoCampaignResponse.campaigns[0]);
    });
  });
  test('Test EditCampaign API', async () => {
    const { result } = renderHook(() => useEditCampaignMutation({}), {
      wrapper,
    });
    const [editCampaign] = result.current;

    await act(async () => {
      await editCampaign({
        body: DemoCampaignResponse.campaigns[0],
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(DemoCampaignResponse.campaigns[0]);
    });
  });
  test('Test GetVouchers API', async () => {
    const { result } = renderHook(() => useLazyGetVouchersQuery({}), {
      wrapper,
    });
    const [getVouchers] = result.current;

    await act(async () => {
      await getVouchers({
        tableType: 'discountsVoucher',
        listPageToken: [],
        queryParams: { filter: '' },
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        imports: [
          {
            ...DemoVoucherResponse.vouchers[0],
            percentDiscount: 10,
            price: 690,
            endTime: '10/04/2023',
            startTime: '01/02/2023',
          },
        ],
        filter: '',
        listPageToken: [{ page: 1, token: '' }],
        nextPageToken: '',
        pageIndex: undefined,
      });
    });
  });
  test('Test CreateVoucher API', async () => {
    const { result } = renderHook(() => useCreateVoucherMutation({}), {
      wrapper,
    });
    const [createVoucher] = result.current;

    await act(async () => {
      await createVoucher({
        body: DemoVoucherResponse.vouchers[0],
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(DemoVoucherResponse.vouchers[0]);
    });
  });
  test('Test UpdateVoucherStatus API', async () => {
    const { result } = renderHook(() => useUpdateVoucherStatusMutation({}), {
      wrapper,
    });
    const [updateVoucherStatus] = result.current;

    await act(async () => {
      await updateVoucherStatus({
        code: 'ABC',
        action: 'revert',
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(DemoVoucherResponse.vouchers[0]);
    });
  });
  test('Test UpdateVoucher API', async () => {
    const { result } = renderHook(() => useUpdateVoucherMutation({}), {
      wrapper,
    });
    const [updateVoucher] = result.current;

    await act(async () => {
      await updateVoucher({
        body: DemoVoucherResponse.vouchers[0],
        updateMask: 'active',
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(DemoVoucherResponse.vouchers[0]);
    });
  });
  test('Test activateCampaign API', async () => {
    const { result } = renderHook(() => useActivateCampaignMutation({}), {
      wrapper,
    });
    const [activateCampaign] = result.current;

    await act(async () => {
      await activateCampaign({
        name: 'campaigns/name',
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({ success: true });
    });
  });
  test('Test deactivateCampaign API', async () => {
    const { result } = renderHook(() => useDeactivateCampaignMutation(), {
      wrapper,
    });
    const [deactivateCampaign] = result.current;

    await act(async () => {
      await deactivateCampaign({
        name: 'campaigns/name',
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({ success: true });
    });
  });
  test('Test getDiscountsRequest API', async () => {
    const { result } = renderHook(() => useLazyGetDiscountsRequestQuery(), {
      wrapper,
    });

    const [getDiscountsRequest] = result.current;

    await act(async () => {
      await getDiscountsRequest({
        tableType: 'discountsApproval',
        listPageToken: [],
        queryParams: { filter: '' },
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        imports: [
          {
            name: 'requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
            agentName: 'SalesAgentRole -',
            configId:
              'leads/79e8b6f2-4766-4262-8a19-1cc2ab800c72/renewalPackages/e6cdc351-ea65-4716-afcc-324edca4b035/requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
            description: 'test discount',
            discount: 'percentage',
            discountType: 'match-price',
            insuranceType: '',
            insurer: '',
            leadId: 'L9898200',
            leadName: 'leads/79e8b6f2-4766-4262-8a19-1cc2ab800c72',
            maxDiscount: 8,
            leadType: 'leadTypeFilter.renewal',
            priceAfterDiscount: 11.172,
            priceBeforeDiscount: 12,
            requestDiscount: '6.9%',
            requestTime: '',
            approver: 'first last',
            approvalTime: '',
            status: 'PENDING',
            approvalReason: 'test discount',
            index: 1,
          },
        ],
        total: 1,
      });
    });
  });
  test('Test discountApproval API', async () => {
    const { result } = renderHook(() => useDiscountApprovalMutation(), {
      wrapper,
    });
    const [discountApproval] = result.current;

    await act(async () => {
      await discountApproval({
        name: DiscountMockData.discounts[0].request.name,
        body: {
          status: ApprovalStatusTypes.REJECTED,
          approverRemark: 'demo rejected reason',
        },
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        approver: 'users',
        createBy: 'users',
        createTime: '2023-02-27T08:19:21.286397Z',
        decideBy: 'users',
        deleteTime: null,
        maxPercentage: 800,
        name: 'name',
        percentage: 690,
        remark: 'demo rejected reason',
        source: 'source',
        status: 'REJECTED',
        updateTime: '2023-03-14T04:32:09.340809Z',
      });
    });
  });
  test('Test getDiscountRequestDocuments API', async () => {
    const { result } = renderHook(
      () => useLazyGetDiscountRequestDocumentsQuery(),
      {
        wrapper,
      }
    );

    const [getDiscountsRequestDocuments] = result.current;

    await act(async () => {
      await getDiscountsRequestDocuments({
        name: 'requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        documents: [mockDocuments.documents[0]],
        nextPageToken: '',
      });
    });
  });
});
