import { useCallback } from 'react';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';

export const useCarFilterLogic = ({
  leadData,
  setCurrentData,
  carLicensePlate,
  setCurrentMultipleData,
}: {
  leadData: any;
  setCurrentData: (key: string, value: any) => void;
  carLicensePlate?: string;
  setCurrentMultipleData: (obj: { [key: string]: any }) => void;
}) => {
  const { updateLead } = useLeadUpdater(leadData?.name);
  const keyMap = {
    carSubModelYear: '/carSubModelYear',
    province: '/registeredProvince',
    modification: '/carModified',
    dashCam: '/carDashCam',
    drivingPurpose: '/carUsageType',
  };
  const transformValue = useCallback((value: string) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (['PERSONAL', 'COMMERCIAL'].includes(value)) return value?.toLowerCase();
    return value;
  }, []);
  const handleChange = useCallback(
    (key: string, value: any) => {
      if (key === 'carSubModelYear' && value === '0') {
        setCurrentMultipleData({ subModelText: '', carSubModelYear: value });
        return;
      }
      if (key === 'brand' || key === 'model' || key === 'year') {
        setCurrentData(key, value);
        return;
      }
      if (key === 'province' && carLicensePlate) {
        updateLead('/carLicensePlate', '', 'remove');
        setCurrentMultipleData({ carLicensePlate: '', [key]: value });
      } else {
        setCurrentData(key, value);
      }
      updateLead(keyMap[key as keyof typeof keyMap], transformValue(value));
    },
    [setCurrentData, updateLead, transformValue]
  );
  return {
    handleChange,
    transformValue,
    keyMap,
  };
};
