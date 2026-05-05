import { getDocByType, formatDoc } from './documentHelper';

const mockDocument = [
  {
    name: 'orders/ace318bf-d065-4659-85fe-f26926d1657f/documents/bbb36451-2a02-4ea6-9d38-d42cb6357fdf',
    createTime: '2023-12-19T09:48:19.895969Z',
    updateTime: '2023-12-19T09:48:19.895969Z',
    deleteTime: null,
    createBy: '',
    document: 'documents/aefd6aca-23a9-4b77-938b-2d74d8ab4a92',
    type: 'DOCUMENT_TYPE_ID_CARD',
    label: 'idCard-Screenshot from 2023-12-08 12-06-37.png',
  },
  {
    name: 'orders/ace318bf-d065-4659-85fe-f26926d1657f/documents/b71acffd-dae0-4925-8ff6-a8f7a05e07b0',
    createTime: '2023-12-19T09:48:19.746702Z',
    updateTime: '2023-12-19T09:48:19.746702Z',
    deleteTime: null,
    createBy: '',
    document: 'documents/ddec6423-0549-4669-838f-f013954e0f0d',
    type: 'DOCUMENT_TYPE_VEHICLE_REGISTRATION',
    label: 'vehicleRegistration-Screenshot from 2023-12-07 17-19-27.png',
  },
];

describe('getDocByType', () => {
  it('returns document by type', () => {
    const result = getDocByType({
      label: 'idCard',
      type: 'DOCUMENT_TYPE_ID_CARD',
      documents: mockDocument,
    });

    expect(result).toEqual({
      documentType: 'DOCUMENT_TYPE_ID_CARD',
      file: 'documents/aefd6aca-23a9-4b77-938b-2d74d8ab4a92',
      fileName: 'idCard-Screenshot from 2023-12-08 12-06-37.png',
      name: 'orders/ace318bf-d065-4659-85fe-f26926d1657f/documents/bbb36451-2a02-4ea6-9d38-d42cb6357fdf',
    });
  });

  it('returns document by label', () => {
    const result = getDocByType({
      label: 'vehicleRegistration',
      type: 'DOCUMENT_TYPE_VEHICLE_REGISTRATION',
      documents: mockDocument,
    });

    expect(result).toEqual({
      documentType: 'DOCUMENT_TYPE_VEHICLE_REGISTRATION',
      file: 'documents/ddec6423-0549-4669-838f-f013954e0f0d',
      fileName: 'vehicleRegistration-Screenshot from 2023-12-07 17-19-27.png',
      name: 'orders/ace318bf-d065-4659-85fe-f26926d1657f/documents/b71acffd-dae0-4925-8ff6-a8f7a05e07b0',
    });
  });

  it('returns empty string when the label or type dont match', () => {
    const result = getDocByType({
      label: 'dashCamPicture',
      type: 'DOCUMENT_TYPE_VEHICLE_DASHCAM_PICTURE',
      documents: mockDocument,
    });

    expect(result).toEqual('');
  });
});

describe('formatDoc', () => {
  it('returns formatted document', () => {
    const result = formatDoc(mockDocument[0]);
    expect(result).toEqual({
      documentType: 'DOCUMENT_TYPE_ID_CARD',
      file: 'documents/aefd6aca-23a9-4b77-938b-2d74d8ab4a92',
      fileName: 'idCard-Screenshot from 2023-12-08 12-06-37.png',
      name: 'orders/ace318bf-d065-4659-85fe-f26926d1657f/documents/bbb36451-2a02-4ea6-9d38-d42cb6357fdf',
    });
  });
});
