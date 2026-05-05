import { http, HttpResponse } from 'msw';
import { StateObservable } from 'redux-observable';
import { of, Subject } from 'rxjs';

import { server } from '__mocks__/server';

import { getUploadedLeadDocumentEpic } from './index';

describe('lead epics', () => {
  it("should call both root and retainer's documents if lead type is retainer lead", (done) => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/root-lead-name/documents`,
        () => HttpResponse.json({ documents: [{ name: 'rootLeadDocuments' }] })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead-name/documents`,
        () => HttpResponse.json({ documents: [{ name: 'leadDocuments' }] })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/root-lead-name`,
        () =>
          HttpResponse.json({
            name: 'leads/root-lead-name',
            type: 'LEAD_TYPE_NEW',
          })
      )
    );
    const state = {
      leadsDetailReducer: {
        lead: {
          payload: {
            type: 'LEAD_TYPE_RETAINER',
            root: 'leads/root-lead-name',
            name: 'leads/lead-name',
          },
        },
      },
    };
    const action = {
      type: '[Leads] GET_DOCUMENTS_LEADS',
      payload: 'lead-name',
    };
    const return$ = getUploadedLeadDocumentEpic(
      of(action),
      new StateObservable(new Subject(), state)
    );
    return$.subscribe((res: any) => {
      try {
        expect(res.payload).toStrictEqual(
          expect.objectContaining({
            documents: [
              { name: 'leadDocuments' },
              { name: 'rootLeadDocuments' },
            ],
          })
        );
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should not call root documents if lead type is new lead', (done) => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/root-lead-name/documents`,
        () => HttpResponse.json({ documents: [{ name: 'rootLeadDocuments' }] })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/lead-name/documents`,
        () => HttpResponse.json({ documents: [{ name: 'leadDocuments' }] })
      )
    );
    const state = {
      leadsDetailReducer: {
        lead: {
          payload: {
            type: 'LEAD_TYPE_NEW',
            root: 'root-lead-name',
            name: 'lead-name',
          },
        },
      },
    };
    const action = {
      type: '[Leads] GET_DOCUMENTS_LEADS',
      payload: 'lead-name',
    };
    const return$ = getUploadedLeadDocumentEpic(
      of(action),
      new StateObservable(new Subject(), state)
    );
    return$.subscribe((res: any) => {
      try {
        expect(res.payload).toStrictEqual(
          expect.objectContaining({
            documents: [{ name: 'leadDocuments' }],
          })
        );
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
