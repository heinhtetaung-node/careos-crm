import { getString } from 'presentation/theme/localization';

export enum DocumentType {
  DOCUMENT_TYPE_ID_CARD = 'DOCUMENT_TYPE_ID_CARD',
  DOCUMENT_TYPE_FIRST_NAMED_DRIVING_LICENCE = 'DOCUMENT_TYPE_FIRST_NAMED_DRIVING_LICENCE',
  DOCUMENT_TYPE_SECOND_NAMED_DRIVING_LICENCE = 'DOCUMENT_TYPE_SECOND_NAMED_DRIVING_LICENCE',
  DOCUMENT_TYPE_VEHICLE_REGISTRATION = 'DOCUMENT_TYPE_VEHICLE_REGISTRATION',
  DOCUMENT_TYPE_VEHICLE_PICTURE_FRONT = 'DOCUMENT_TYPE_VEHICLE_PICTURE_FRONT',
  DOCUMENT_TYPE_VEHICLE_PICTURE_BACK = 'DOCUMENT_TYPE_VEHICLE_PICTURE_BACK',
  DOCUMENT_TYPE_VEHICLE_PICTURE_RIGHT = 'DOCUMENT_TYPE_VEHICLE_PICTURE_RIGHT',
  DOCUMENT_TYPE_VEHICLE_PICTURE_LEFT = 'DOCUMENT_TYPE_VEHICLE_PICTURE_LEFT',
  DOCUMENT_TYPE_VEHICLE_DASHCAM_PICTURE = 'DOCUMENT_TYPE_VEHICLE_DASHCAM_PICTURE',
  DOCUMENT_TYPE_PAYMENT_SLIP = 'DOCUMENT_TYPE_PAYMENT_SLIP',
  DOCUMENT_TYPE_BOOK_BANK = 'DOCUMENT_TYPE_BOOK_BANK',
  DOCUMENT_TYPE_OTHERS = 'DOCUMENT_TYPE_OTHERS',
  // PolicyDocumentType
  DOCUMENT_TYPE_SCAN_OF_POLICY = 'DOCUMENT_TYPE_SCAN_OF_POLICY',
  DOCUMENT_TYPE_POLICY = 'DOCUMENT_TYPE_POLICY',
  DOCUMENT_TYPE_POLICY_COPY = 'DOCUMENT_TYPE_POLICY_COPY',
  DOCUMENT_TYPE_INSURER_RECEIPT = 'DOCUMENT_TYPE_INSURER_RECEIPT',
  DOCUMENT_TYPE_STICKER = 'DOCUMENT_TYPE_STICKER',
  DOCUMENT_TYPE_CARD = 'DOCUMENT_TYPE_CARD',
  DOCUMENT_TYPE_ENDORSEMENT = 'DOCUMENT_TYPE_ENDORSEMENT',
  DOCUMENT_TYPE_KNOCK_KNOCK = 'DOCUMENT_TYPE_KNOCK_KNOCK',
  // Health Document
  DOCUMENT_TYPE_APPLICATION_FORM = 'DOCUMENT_TYPE_APPLICATION_FORM',
  DOCUMENT_TYPE_MEDICAL_EXAMINATION = 'DOCUMENT_TYPE_MEDICAL_EXAMINATION',
}

export interface DocumentConfigType {
  title: string;
  value: DocumentType;
  label: string;
  isRequired?: boolean;
}

export const docTypes = (): DocumentConfigType[] => [
  {
    title: getString('leadDetailFields.idCard'),
    value: DocumentType.DOCUMENT_TYPE_ID_CARD,
    label: 'idCard',
    isRequired: true,
  },
  {
    title: getString('leadDetailFields.firstNamedDriverLicense'),
    value: DocumentType.DOCUMENT_TYPE_FIRST_NAMED_DRIVING_LICENCE,
    label: 'firstNamedDriverLicense',
    isRequired: false,
  },
  {
    title: getString('leadDetailFields.secondNamedDriverLicense'),
    value: DocumentType.DOCUMENT_TYPE_SECOND_NAMED_DRIVING_LICENCE,
    label: 'secondNamedDriverLicense',
    isRequired: false,
  },
  {
    title: getString('leadDetailFields.vehicleRegistration'),
    value: DocumentType.DOCUMENT_TYPE_VEHICLE_REGISTRATION,
    label: 'vehicleRegistration',
    isRequired: true,
  },
  {
    title: getString('leadDetailFields.vehiclePictureFront'),
    value: DocumentType.DOCUMENT_TYPE_VEHICLE_PICTURE_FRONT,
    label: 'vehiclePictureFront',
    isRequired: false,
  },
  {
    title: getString('leadDetailFields.vehiclePictureBack'),
    value: DocumentType.DOCUMENT_TYPE_VEHICLE_PICTURE_BACK,
    label: 'vehiclePictureBack',
    isRequired: false,
  },
  {
    title: getString('leadDetailFields.vehiclePictureRight'),
    value: DocumentType.DOCUMENT_TYPE_VEHICLE_PICTURE_RIGHT,
    label: 'vehiclePictureRight',
    isRequired: false,
  },
  {
    title: getString('leadDetailFields.vehiclePictureLeft'),
    value: DocumentType.DOCUMENT_TYPE_VEHICLE_PICTURE_LEFT,
    label: 'vehiclePictureLeft',
    isRequired: false,
  },
  {
    title: getString('leadDetailFields.dashCamPicture'),
    value: DocumentType.DOCUMENT_TYPE_VEHICLE_DASHCAM_PICTURE,
    label: 'dashCamPicture',
    isRequired: false,
  },
  {
    title: getString('documentSection.paySlip'),
    value: DocumentType.DOCUMENT_TYPE_PAYMENT_SLIP,
    label: 'paySlip',
    isRequired: false,
  },
  {
    title: getString('documentSection.bookBank'),
    value: DocumentType.DOCUMENT_TYPE_BOOK_BANK,
    label: 'bookBank',
    isRequired: false,
  },
];
export const healthDocTypes = (
  isHealthOrderDetail: boolean = false
): DocumentConfigType[] => [
  {
    title: getString('leadDetailFields.idCard'),
    value: DocumentType.DOCUMENT_TYPE_ID_CARD,
    label: 'idCard',
    isRequired: true,
  },
  {
    title: getString('documentSection.applicationForm'),
    value: DocumentType.DOCUMENT_TYPE_APPLICATION_FORM,
    label: 'applicationForm',
    isRequired: true,
  },
  {
    title: getString('documentSection.medicalExamination'),
    value: DocumentType.DOCUMENT_TYPE_MEDICAL_EXAMINATION,
    label: 'medicalExamination',
    isRequired: false,
  },
  ...(!isHealthOrderDetail
    ? [
        {
          title: getString('documentSection.policy'),
          value: DocumentType.DOCUMENT_TYPE_POLICY,
          label: 'policy',
          isRequired: false,
        },
      ]
    : []),
];

export const policyDocTypes = (): DocumentConfigType[] => [
  {
    title: getString('documentSection.scanOriginal'),
    value: DocumentType.DOCUMENT_TYPE_SCAN_OF_POLICY,
    label: 'policyScan',
  },
  {
    title: getString('documentSection.policy'),
    value: DocumentType.DOCUMENT_TYPE_POLICY,
    label: 'policyCertificate',
    isRequired: true,
  },
  {
    title: getString('documentSection.copyOfPolicyCertificate'),
    value: DocumentType.DOCUMENT_TYPE_POLICY_COPY,
    label: 'copyPolicyCertificate',
  },
  {
    title: getString('documentSection.receipt'),
    value: DocumentType.DOCUMENT_TYPE_INSURER_RECEIPT,
    label: 'receipt',
  },
  {
    title: getString('documentSection.sticker'),
    value: DocumentType.DOCUMENT_TYPE_STICKER,
    label: 'sticker',
  },
  {
    title: getString('documentSection.card'),
    value: DocumentType.DOCUMENT_TYPE_CARD,
    label: 'card',
  },
  {
    title: getString('documentSection.endorsement'),
    value: DocumentType.DOCUMENT_TYPE_ENDORSEMENT,
    label: 'endorsement',
  },
  {
    title: getString('documentSection.knockForKnock'),
    value: DocumentType.DOCUMENT_TYPE_KNOCK_KNOCK,
    label: 'knockForKnock',
  },
];
