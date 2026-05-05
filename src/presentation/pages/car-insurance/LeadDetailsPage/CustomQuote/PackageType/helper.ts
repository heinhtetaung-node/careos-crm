import { getString } from 'presentation/theme/localization';
import { Lead } from 'shared/types/lead';

// eslint-disable-next-line import/prefer-default-export
export const getPackageTypes = (leadType: Lead['type']) => [
  {
    id: 'STANDARD',
    label: getString('customQuote.packageTypes.standard'),
    value: 'STANDARD',
  },
  ...(leadType === 'LEAD_TYPE_RENEWAL'
    ? [
        {
          id: 'RENEWAL',
          label: getString('customQuote.packageTypes.renewal'),
          value: 'RENEWAL',
        },
      ]
    : []),
  {
    id: 'TRANSFER_CODE',
    label: getString('customQuote.packageTypes.transfer'),
    value: 'TRANSFER_CODE',
  },
];
