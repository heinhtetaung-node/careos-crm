import { forkJoin, of } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';

import LeadDetailRepository from 'data/repository/leadDetail';
import { AddressUsage } from 'presentation/components/modal/LeadDetailsModal/AddressModal/helper';
import { executeWithPayloadFn } from 'shared/interfaces/common';

import { IUseCaseObservable } from '../../../shared/interfaces/common/usecase';

export default class AddAddressToLeadsUseCase implements IUseCaseObservable {
  private leadDetailRepository: LeadDetailRepository;

  constructor() {
    this.leadDetailRepository = new LeadDetailRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (data) => {
    const payload = {
      ...data.policy,
      id: data.id,
      addressUsage: [AddressUsage.POLICY],
    };

    if (data.shipmentAddressIsSame) {
      payload.addressUsage.push(AddressUsage.SHIPPING);
    }
    if (data.billingAddressIsSame) {
      payload.addressUsage.push(AddressUsage.BILLING);
    }

    const request = [
      this.leadDetailRepository.addAddressToLeads(payload).pipe(
        pluck('data'),
        map((value) => ({ type: AddressUsage.POLICY, value })),
        catchError((error) =>
          of({ type: AddressUsage.POLICY, failed: true, error })
        )
      ),
    ];
    if (!data.shipmentAddressIsSame) {
      const payloadShiping = {
        ...data.shipping,
        id: data.id,
        addressUsage: [AddressUsage.SHIPPING],
      };
      request.push(
        this.leadDetailRepository.addAddressToLeads(payloadShiping).pipe(
          pluck('data'),
          map((value) => ({ type: AddressUsage.SHIPPING, value })),
          catchError((error) =>
            of({ type: AddressUsage.SHIPPING, failed: true, error })
          )
        )
      );
    }

    if (!data.billingAddressIsSame) {
      const payloadBilling = {
        ...data.billing,
        id: data.id,
        addressUsage: [AddressUsage.BILLING],
      };
      request.push(
        this.leadDetailRepository.addAddressToLeads(payloadBilling).pipe(
          pluck('data'),
          map((value) => ({ type: AddressUsage.BILLING, value })),
          catchError((error) =>
            of({ type: AddressUsage.BILLING, failed: true, error })
          )
        )
      );
    }
    return forkJoin(request);
  };
}
