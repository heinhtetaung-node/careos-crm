import React, { useEffect, useState } from 'react';

import { useGetQcDetail } from 'data/slices/qcSlice/selector';
import DetailPageDrawer from 'presentation/components/common/DetailPageDrawer';
import { questionGroups, Questions } from '../config';

import QcInfoPanel from './QcInfoPanel';

function QcTabs() {
  const { orderDetail: sliceOrderDetail, countdown: sliceCountdown } =
    useGetQcDetail();

  const orderDetail = sliceOrderDetail;
  const [countdown, setCountDown] = useState<any>();

  const [tab, setTab] = React.useState('');
  const [nav, setNav] = React.useState<any | null>(null);
  const isCompany = orderDetail?.order?.data?.policyHolder?.isCompany;

  useEffect(() => {
    if (countdown) {
      const items: any = {};
      Object.entries(questionGroups).forEach(([key, value]) => {
        if (countdown[key]) {
          items[key] = value;
        }
      });
      if (items) {
        setNav(items);
      } else {
        setNav(questionGroups);
      }
    }
  }, [countdown]);

  // console.log(countdown);

  useEffect(() => {
    const conditionalCountdown = sliceCountdown;
    const copyCountDown = { ...conditionalCountdown };
    // after feature ORDER-1733 is stable move this logic to reducer
    if (isCompany) {
      // countdown can be empty in the context
      const policyholder = copyCountDown?.policyholder?.filter(
        (p: any) => p.qId !== Questions.DOB_OF_THE_POLICYHOLDER
      );
      copyCountDown.policyholder = policyholder;
    }
    setCountDown(copyCountDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliceCountdown, isCompany]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {nav && (
        <DetailPageDrawer
          nav={nav}
          badges={countdown}
          dataTestId="qc"
          tab={tab}
        >
          <QcInfoPanel setTab={setTab} />
        </DetailPageDrawer>
      )}
    </>
  );
}

export default QcTabs;
