const ShipmentMock = {
  documents: [
    {
      documentType: 'DOCUMENT_TYPE_POLICY',
      required: true,
    },
    {
      documentType: 'DOCUMENT_TYPE_POLICY_COPY',
      required: false,
    },
    {
      documentType: 'DOCUMENT_TYPE_INSURER_RECEIPT',
      required: true,
    },
    {
      documentType: 'DOCUMENT_TYPE_STICKER',
      required: false,
    },
    {
      documentType: 'DOCUMENT_TYPE_CARD',
      required: false,
    },
    {
      documentType: 'DOCUMENT_TYPE_ENDORSEMENT',
      required: true,
    },
  ],
};

export default ShipmentMock;
