import _camelCase from 'lodash/camelCase';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useLazyGetQCAddOnsQuery } from 'data/slices/qcSlice';
import {
  Questions,
  questionGroups,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getString } from 'presentation/theme/localization';

export default function useQuestionConfigAddons(
  addOnsQcDetail: boolean,
  loadAnswersInprogress: boolean
) {
  const { orderId } = useParams();
  const [getAddOns, { data: addOnsResponse, isSuccess }] =
    useLazyGetQCAddOnsQuery();
  const [addonQuestionConfig, setAddonQuestionConfig] = useState<any>();

  useEffect(() => {
    if (!addOnsQcDetail) return;

    getAddOns({ orderId: orderId! });

    if (!addOnsResponse || loadAnswersInprogress) return;

    const addonsDataEmpty =
      !addOnsResponse?.addons || addOnsResponse?.addons?.length <= 0;
    if (isSuccess && addonsDataEmpty) {
      setAddonQuestionConfig([]);
      return;
    }

    const extraQuestionConfig = addOnsResponse?.addons.map((addon) => {
      const addonsValue = getString(`qc.addOns.${_camelCase(addon.addonType)}`);
      return {
        qId: Questions[`ADD_ONS_${addon.addonType}` as keyof typeof Questions],
        isEditable: false,
        groupId: questionGroups.addOns.id,
        label: `text.addOnName`,
        value: addonsValue,
        isCritical: true,
        group: questionGroups.addOns.label,
      };
    });
    if (extraQuestionConfig && extraQuestionConfig?.length > 0) {
      setAddonQuestionConfig(extraQuestionConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOnsQcDetail, addOnsResponse, loadAnswersInprogress]);
  return addonQuestionConfig;
}
