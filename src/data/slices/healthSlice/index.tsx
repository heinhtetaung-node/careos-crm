import { apiSlice, basePaths, baseUrls } from 'data/slices/apiSlice';

import { getAgeByBirthday } from '@careos/utils';
import districts from 'data/addresses/districts.json';
import provinces from 'data/addresses/province.json';
import subdistricts from 'data/addresses/subdistricts.json';
import _camelCase from 'lodash/camelCase';
import get from 'lodash/get';
import has from 'lodash/has';
import {
  customerGender,
  customerLeadStatus,
  customerLeadType,
  findShortInsurerName,
} from 'presentation/redux/reducers/leads/lead-assignment';
import { getString } from 'presentation/theme/localization';
import { getValidAppointmentDate } from 'shared/helper/AppointmentLogicHelper';
import {
  formatDDMMYYYYHHMMSS,
  formatTimeAgo,
  getYesNoOptions,
  modelValidationField,
  NewDateFormatters,
} from 'shared/helper/utilities';
import { buildUrl } from 'utils/url';
import getFormattedURL from '../helper';
import { showRemark } from '../leadSearchSlice/helper';

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['HEALTH_LEADS'] });
const provincesArr = provinces as any;
const subdistrictsArr = subdistricts as any;
const districtArr = districts as any;

const getPreferredCallDateTime = (callAvailability: any) => {
  if (callAvailability?.day) {
    const day = modelValidationField(callAvailability.day).toString();
    const dayString = getString(`weekDayFull.${day}`);
    const interval = modelValidationField(callAvailability.interval);
    return `${dayString} ${interval}`;
  }
  if (callAvailability?.asap === true) {
    return getString('healthLead.asap');
  }
  return '-';
};

export function transformLeadsResponse(response: any) {
  const enTh = getString('text.yes') === 'Yes' ? 'nameEn' : 'nameTh';
  if (response?.leads?.length) {
    const { DDMMYYYY: DDMMYYYYBkk } = NewDateFormatters('Asia/Bangkok');
    const data = response.leads.map((item: any) => ({
      id: item.lead.name,
      configId: item.lead.name,
      leadStatus: getString(customerLeadStatus(item?.lead?.status)),
      agentName: `${modelValidationField(
        item?.assigned?.firstName
      )} ${modelValidationField(item?.assigned?.lastName)}`,
      assignmentResourceName: item?.attributes.assignmentResourceName || '',
      leadId: modelValidationField(item?.lead?.humanId),
      leadType: getString(customerLeadType(item?.lead?.type)),
      leadSource: item?.source?.source ?? '-',
      callOnSundayHoliday: has(item, 'attributes.sundayContactable')
        ? getString(getYesNoOptions(get(item, 'attributes.sundayContactable')))
        : '',
      preferredCallDateTime: getPreferredCallDateTime(
        item?.lead?.data?.callAvailability
      ),
      refId: item?.lead?.reference,
      isRejected: item?.lead.isRejected,
      rejections: item?.rejections,
      customerTitle: item?.lead?.data?.customer?.title,
      customerFirstName: item?.lead?.data?.customer?.firstName,
      customerLastName: item?.lead?.data?.customer?.lastName,
      customerGender: customerGender(item?.lead?.data?.customer?.gender, true),
      customerDOB: DDMMYYYYBkk(item?.lead?.data?.customer?.dob),
      customerAge: modelValidationField(
        getAgeByBirthday(item?.lead?.data?.customer?.dob)
      ),
      customerLanguage: item?.lead?.data?.policyHolder?.locale?.split('-')?.[1],
      customerPhoneNumber: has(item, 'lead.data.customer.primaryPhoneIndex')
        ? item.lead.data.customer?.phoneNumbers?.[
            item.lead.data.customer?.primaryPhoneIndex
          ]?.phone
        : '-',
      customerEmail:
        item.lead.data.customer?.emails &&
        item.lead.data.customer?.emails.length > 0
          ? item.lead.data.customer?.emails[
              item.lead.data.customer?.emails?.length - 1
            ]
          : '-',
      consentTerms: item.lead?.data?.marketingConsent?.termsAndConditions
        ? getString('text.yes')
        : getString('text.no'),
      consentOffers: item.lead?.data?.marketingConsent?.personalizedOffers
        ? getString('text.yes')
        : getString('text.no'),
      consentBusinessPartners: item.lead?.data?.marketingConsent
        ?.offerFromBusinessPartners
        ? getString('text.yes')
        : getString('text.no'),
      consentDataAnalytics: item.lead?.data?.marketingConsent?.dataAnalytics
        ? getString('text.yes')
        : getString('text.no'),
      policyHolderTitle: item.lead?.data?.policyHolder?.title,
      policyHolderFirstName: item.lead?.data?.policyHolder?.firstName,
      policyHolderLastName: item.lead?.data?.policyHolder?.lastName,
      policyHolderGender: customerGender(
        item.lead?.data?.policyHolder?.gender,
        true
      ),
      policyHolderDOB: DDMMYYYYBkk(item.lead?.data?.policyHolder?.dob),
      policyHolderAge: modelValidationField(
        getAgeByBirthday(item.lead?.data?.policyHolder?.dob)
      ),
      policyHolderRace: item?.lead?.data?.policyHolder?.race,
      policyHolderNationalId: item?.lead?.data?.policyHolder?.nationalId,
      policyHolderPassport: item.lead?.data?.policyHolder?.passport,
      policyHolderOccupation: item.lead?.data?.policyHolder?.occupation,
      policyHolderJobDescription: item.lead?.data?.policyHolder?.jobDescription,
      policyHolderPhoneNumber: '-', // !important Leong said not to have it for now
      policyHolderEmail: '-', // !important Leong said not to have it for now
      beneficiaryTitle: item?.lead?.data?.beneficiaries?.[0]?.title,
      beneficiaryFirstName: item?.lead?.data?.beneficiaries?.[0]?.firstName,
      beneficiaryLastName: item?.lead?.data?.beneficiaries?.[0]?.lastName,
      beneficiaryGender: customerGender(
        item.lead?.data?.beneficiaries?.[0]?.gender,
        true
      ),
      beneficiaryRelationship:
        item?.lead?.data?.beneficiaries?.[0]?.relationship,
      beneficiaryPhoneNumber: item?.lead?.data?.beneficiaries?.[0]?.phone,
      beneficiaryEmail: item?.lead?.data?.beneficiaries?.[0]?.email,
      currentInsurer: findShortInsurerName(
        item?.insurance?.currentInsurerId?.replace('insurers/', ''),
        item?.insurance?.currentInsurer
      ),
      preferredInsurer: findShortInsurerName(
        item?.insurance?.preferredInsurerId?.replace('insurers/', ''),
        item?.insurance?.preferredInsurer
      ),
      preferredProductCategory: item?.lead?.data?.insurance?.category
        ? getString(
            `healthPackageFilter.productCategoryValue.${item?.lead?.data?.insurance?.category}`
          )
        : '-',
      subCategory: item?.lead?.data?.insurance?.subCategory
        ? getString(
            `healthPackageFilter.productSubCategory.${item?.lead?.data?.insurance?.subCategory}`
          )
        : '-',
      preferredProductType: item?.lead?.data?.insurance?.type
        ? getString(
            `healthPackageFilter.possibleValue.plan.${item?.lead?.data?.insurance?.type}`
          )
        : '-',
      preferredCoverageItems: item?.lead?.data?.insurance?.coverages
        ? item?.lead?.data?.insurance?.coverages
            ?.map((coverage: any) =>
              getString(
                `healthPackageFilter.possibleValue.coverageType.${coverage}`
              )
            )
            .join(', ')
        : '-',
      preferredPolicyStartDate: DDMMYYYYBkk(item?.insurance?.policyStartDate),
      deliveryOption: item?.lead?.data?.checkout?.deliveryOption
        ? getString(
            `qc.${_camelCase(item?.lead?.data?.checkout?.deliveryOption.split('/')[1])}`
          )
        : '-',
      underwritingStatus: item?.attributes?.underwritingStatus
        ? getString(
            `underwritingStatus.${item?.attributes?.underwritingStatus.replace('ITEM_UNDERWRITING_STATUS_', '')}`
          )
        : '-',
      insurancePhoneNumber: item?.insuree?.phone?.join(', ') || '-',
      insuranceEmail: item?.insuree?.email,
      policyAddress: item?.lead?.data?.policyAddresses?.[0]?.address,
      policyProvince:
        provincesArr?.[item?.lead?.data?.policyAddresses?.[0]?.province]?.[
          enTh
        ],
      policyDistrict:
        districtArr?.[item?.lead?.data?.policyAddresses?.[0]?.district]?.[enTh],
      policySubDistrict:
        subdistrictsArr?.[
          item?.lead?.data?.policyAddresses?.[0]?.subDistrict
        ]?.[enTh],
      policyPostalCode: item?.lead?.data?.policyAddresses?.[0]?.postCode,
      billingAddress: item?.lead?.data?.billingAddresses?.[0]?.address,
      billingProvince:
        provincesArr?.[item?.lead?.data?.billingAddresses?.[0]?.province]?.[
          enTh
        ],
      billingDistrict:
        districtArr?.[item?.lead?.data?.billingAddresses?.[0]?.district]?.[
          enTh
        ],
      billingSubDistrict:
        subdistrictsArr?.[
          item?.lead?.data?.billingAddresses?.[0]?.subDistrict
        ]?.[enTh],
      billingPostalCode: item?.lead?.data?.billingAddresses?.[0]?.postCode,
      shippingAddress: item?.lead?.data?.shippingAddresses?.[0]?.address,
      shippingProvince:
        provincesArr?.[item?.lead?.data?.shippingAddresses?.[0]?.province]?.[
          enTh
        ],
      shippingDistrict:
        districtArr?.[item?.lead?.data?.shippingAddresses?.[0]?.district]?.[
          enTh
        ],
      shippingSubDistrict:
        subdistrictsArr?.[
          item?.lead?.data?.shippingAddresses?.[0]?.subDistrict
        ]?.[enTh],
      shippingPostalCode: item?.lead?.data?.shippingAddresses?.[0]?.postCode,
      remark: showRemark(item?.lead?.annotations?.remark),
      insurerProduct:
        item?.lead?.annotations?.['@immutable/leadgen/insurer_product'] ?? '-',
      createTime: formatDDMMYYYYHHMMSS(item?.lead?.createTime) ?? '-',
      isThaiNational: item?.lead?.data?.customer?.isThaiNational
        ? getString('text.yes')
        : getString('text.no'),
      appointmentDate: item?.appointments?.length
        ? getValidAppointmentDate(item.appointments)
        : '',
      callAttempts: item?.attributes?.callAttempts ?? '0',
      lastCallDate:
        formatDDMMYYYYHHMMSS(item?.attributes?.lastCallTimestamp) ?? '-',
      daysSinceLastCall: formatTimeAgo(item?.attributes?.lastCallTimestamp),
    }));
    return {
      imports: data,
      total: response.total,
    };
  }
  return [];
}

export const healthSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getAllLeads: build.query<any, any>({
      query: ({ queryParams }) => {
        const params = getFormattedURL({
          queryParams,
        });
        return {
          url: buildUrl(baseUrls.salesFlow, {
            path: basePaths.searchSvc,
          }),
          params,
          method: 'GET',
        };
      },
      providesTags: ['HEALTH_LEADS'],
      transformResponse: transformLeadsResponse,
    }),
  }),
});

export const { useGetAllLeadsQuery, useLazyGetAllLeadsQuery } = healthSlice;
