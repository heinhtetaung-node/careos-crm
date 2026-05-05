import MuiGrid from '@material-ui/core/Grid';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { useLocalStorageState } from 'ahooks';
import _camelCase from 'lodash/camelCase';
import _has from 'lodash/has';
import _unset from 'lodash/unset';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useGetAllOrderDocumentsByStreamingQuery } from 'data/slices/orderSlice';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { useGetQCAnswersQuery } from 'data/slices/qcSlice';
import {
  QC_QUESTIONS_KEY,
  qcUpdateAnswers,
  qcUpdateCountdown,
  saveQcAnswers,
  saveQcPackageAnswers,
} from 'data/slices/qcSlice/reducer';
import { useGetQcDetail } from 'data/slices/qcSlice/selector';
import { IUploadedDocument } from 'presentation/components/ActivityOrderSection/DocumentSection';
import { QcQuestion } from 'presentation/components/common/QcInputContainer/QcInputContainer';
import AccordionSection from 'presentation/components/common/SectionWrapper/AccordionSection';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { MotoTypes, OrderQcStatus } from 'shared/constants/orderType';
import { questionGroups, Questions } from '../config';

import QcContainerList from './QcContainerList';

import {
  flattenAnswersFromApi,
  formatSavedAnswers,
  generateQuestionConfig,
  questionConfigFromAnswers,
} from '../helpers/question';
import usePackagesInfo from '../hooks/usePackagesInfo';
import usePremium from '../hooks/usePremium';
import useQuestionConfigAddons from 'presentation/components/QcDetailPage/hooks/useQuestionConfigAddons';
import usePolicyHolderInfo from 'presentation/components/QcDetailPage/hooks/usePolicyHolderInfo';
import useAddress from 'presentation/components/QcDetailPage/hooks/useAddress';
import useCustomer from 'presentation/components/QcDetailPage/hooks/useCustomer';
import SalesNeedsToFix from 'presentation/components/modal/Qc/SalesNeedsToFix';
import UpdateDataMyself from 'presentation/components/modal/Qc/UpdateDataMyself/UpdateDataMyself';
import { documentByQuestion } from 'presentation/components/QcDetailPage/helpers/utils';

// => ['introduction', 'Introduction']
const questionConfigGroup = Object.entries(questionGroups).map(([_, group]) => [
  group.id,
  group.label,
]);

const useStyles = makeStyles({
  infoPanels: {
    padding: '0 40px 0 20px',
    '& > :not(.MuiGrid-item:last-child)': {
      marginBottom: '1.25rem',
    },
  },
});

const Grid = withStyles({
  root: {
    scrollMarginTop: '146px', // to overcome header hiding scrolled element
  },
})(MuiGrid);

function QcInfoPanel({ setTab }: { setTab?: (payload: string) => void }) {
  const [selectedQuestion, setSelectedQuestion] = useState<QcQuestion>(
    {} as QcQuestion
  );
  const [selectedDocument, setSelectedDocument] = useState<IUploadedDocument>();
  const {
    orderDetail: sliceOrderDetail,
    countdown: sliceCountdown,
    answers: sliceAnswers,
  } = useGetQcDetail();

  const { orderId } = useParams();
  const reduxDispatch = useDispatch();
  const addOnsQcDetail = false;

  const orderDetail: any = sliceOrderDetail;
  const countdown = sliceCountdown;
  const answers = sliceAnswers;

  const [openSalesFix, setOpenSalesFix] = useState(false);
  const [openPackageDetails, setOpenPackageDetails] = useState(false);
  const [openUpdateMySelf, setOpenUpdateMySelf] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<MotoTypes>(
    MotoTypes.MOTOR_TYPE_1
  );
  const { data: { documents: uploadedDocuments } = {} } =
    useGetAllOrderDocumentsByStreamingQuery(
      {
        orderId: `orders/${orderId}`,
        queryParams: 'pageSize=50',
      },
      {}
    );
  const [sidebarCount, setSidebarCount] = useState(countdown);
  const [wrongAnswersList, setWrongAnswersList] = useState<Array<string>>([]);
  const isCompany = orderDetail?.order?.data?.policyHolder?.isCompany;
  const wrongAnswerIgnored = [
    Questions.COMPANY_AGENT_INTRO,
    Questions.NOTIFY_BROKER_LICENSE,
    Questions.NOTIFY_RECORD_CONVERSATION,
    Questions.GOODBYE,
    Questions.ASKED_AVAILIBITY,
  ];
  const [localStorage, setLocalStorage] = useLocalStorageState<
    Record<string, any>
  >(QC_QUESTIONS_KEY, {
    defaultValue: {},
  });
  const { data: user } = useGetAuthenticateQuery();
  const {
    data: fetchQuestionData,
    isSuccess: loadAnswersSuccess,
    isLoading: loadAnswersInprogress,
  } = useGetQCAnswersQuery({
    orderId: orderId!,
  });

  const addonQuestionConfig = useQuestionConfigAddons(
    addOnsQcDetail,
    loadAnswersInprogress
  );

  const questionConfig = useMemo(() => {
    /**
     * if questions are already answered, return all question no matter what FF is.
     * otherwise, agent will stuck when they working with old data
     * which don't have dob question from the start.
     */
    if (fetchQuestionData?.healthAnswerSheet && !isCompany) {
      return generateQuestionConfig(orderDetail as OrderDataResponse);
    }

    if (isCompany) {
      const policyholder = generateQuestionConfig(
        orderDetail as any
      ).policyholder.filter((p) => p.qId !== Questions.DOB_OF_THE_POLICYHOLDER);
      const config = generateQuestionConfig(orderDetail as OrderDataResponse);
      config.policyholder = policyholder;
      return config;
    }

    return generateQuestionConfig(orderDetail as OrderDataResponse);
  }, [fetchQuestionData?.healthAnswerSheet, isCompany, orderDetail]);

  const dispatchQuestions = (
    question: Record<string, any>,
    groupName: string
  ) => {
    const answer = question?.answer ?? true;
    if (question.name || question.item) {
      const packageAnswerPayload = {
        groupId: groupName,
        isCritical: question.isCritical,
        packageId: question.name,
        qId: question.qId,
        answer,
      };
      reduxDispatch(saveQcPackageAnswers(packageAnswerPayload));
    } else {
      const answerPayload = {
        groupId: groupName,
        qId: question.qId,
        isCritical: question.isCritical,
        answer,
        questionConfig,
      };
      reduxDispatch(saveQcAnswers(answerPayload));
    }
  };

  const isSaleAgent = user?.role === UserRoleID.SalesAgent;
  const questionAlreadyCheck = (selection: any, answer: boolean) => {
    const { qId, name: packageId } = selection;
    if (packageId) {
      const pkgQuestionExists = _has(answers, `${packageId}.${qId}`);
      return pkgQuestionExists && answers[packageId][qId].answer === answer;
    }
    return _has(answers, qId) && answers[qId].answer === answer;
  };

  const saveAnswerToLocal = (selection: any, answer: boolean) => {
    // Skip local storage if answers is response from API to prevent conflict logic
    if (loadAnswersSuccess) return;
    const { qId, name: packageId } = selection;
    // Get answers saved for the order
    const qcAnswerStorage = localStorage?.[orderId!] || {};
    // Update answer
    if (packageId) {
      // Package questions
      if (questionAlreadyCheck(selection, answer)) {
        _unset(qcAnswerStorage, `${packageId}.${qId}`);
      } else {
        qcAnswerStorage[packageId] = {
          ...qcAnswerStorage[packageId],
          [qId]: answer,
        };
      }
      setLocalStorage({
        ...localStorage,
        [orderId!]: qcAnswerStorage,
      });
      return;
    }

    // Normal questions
    if (questionAlreadyCheck(selection, answer)) {
      _unset(qcAnswerStorage, qId);
    } else {
      qcAnswerStorage[qId] = answer;
    }

    // Save to localstorage
    setLocalStorage({
      ...localStorage,
      [orderId!]: qcAnswerStorage,
    });
  };

  const handleQuestionReject = (selection: any) => {
    setSelectedQuestion(selection);
    if (!questionAlreadyCheck(selection, false)) {
      setOpenSalesFix(true);
      return;
    }
    const { groupId, ...selectQuestion } = selection;
    saveAnswerToLocal(selection, false);
    dispatchQuestions(selectQuestion, groupId);
  };

  const handleQuestionApprove = (selection: any) => {
    setSelectedQuestion(selection);
    saveAnswerToLocal(selection, true);
    if (selection.name || selection.item) {
      const packageAnswerPayload = {
        groupId: selection.groupId,
        isCritical: selection.isCritical,
        packageId: selection.name,
        qId: selection.qId,
        answer: true,
      };
      reduxDispatch(saveQcPackageAnswers(packageAnswerPayload));
    } else {
      const answerPayload = {
        groupId: selection.groupId,
        qId: selection.qId,
        isCritical: selection.isCritical,
        answer: true,
        questionConfig,
      };

      reduxDispatch(saveQcAnswers(answerPayload));
    }
  };

  const handleQuestionEdit = (selection: any) => {
    setOpenUpdateMySelf(true);
    setSelectedQuestion(selection);
  };

  const handleOptionSwitch = (type: string) => {
    let setUpdaterFunction: React.Dispatch<React.SetStateAction<boolean>> =
      setOpenUpdateMySelf;
    if (type === 'salesFix') setUpdaterFunction = setOpenSalesFix;

    setTimeout(() => {
      setUpdaterFunction(true);
    }, 300);
  };

  const classes = useStyles();

  const infoPanels: Record<string, any> = {
    ...usePolicyHolderInfo(orderDetail, false),
    ...usePackagesInfo(orderDetail, false),
    ...useAddress(orderDetail, false),
    ...usePremium(orderDetail, false),
    ...useCustomer(orderDetail, false),
  };

  const isRejected = orderDetail.order?.qcStatus === OrderQcStatus.REJECTED;
  const isPending = orderDetail.order?.qcStatus === OrderQcStatus.PENDING;

  useEffect(() => {
    if (!addonQuestionConfig || addonQuestionConfig?.length <= 0) return;
    questionConfig.addOns = addonQuestionConfig;

    if (!sidebarCount?.addOns) {
      setSidebarCount({
        ...sidebarCount,
        addOns: addonQuestionConfig,
      });
    }

    if (loadAnswersSuccess || fetchQuestionData?.healthAnswerSheet) return;
    const qcAnswerStorage = localStorage?.[orderId!];
    reduxDispatch(
      qcUpdateAnswers(formatSavedAnswers(qcAnswerStorage, addonQuestionConfig))
    );
    const addonsCountDown = addonQuestionConfig
      .map((addon: Record<string, any>) => {
        if (!_has(qcAnswerStorage, addon.qId)) {
          return addon;
        }
        return false;
      })
      .filter(Boolean);

    reduxDispatch(
      qcUpdateCountdown({
        addOns: addonsCountDown,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addonQuestionConfig,
    fetchQuestionData?.healthAnswerSheet,
    loadAnswersSuccess,
    isCompany,
    orderDetail,
  ]);

  useEffect(() => {
    if (addOnsQcDetail && !addonQuestionConfig) return;
    if (loadAnswersSuccess && fetchQuestionData?.healthAnswerSheet) {
      // Load answers from API and parse to the UI when QC status is rejected
      questionConfigFromAnswers(
        flattenAnswersFromApi(
          fetchQuestionData?.healthAnswerSheet,
          addonQuestionConfig
        ),
        orderDetail,
        (answersObject: Record<string, any>, groupName: string) => {
          if (
            isSaleAgent &&
            !answersObject.answer &&
            !wrongAnswerIgnored.includes(answersObject.qId) &&
            isRejected
          ) {
            setWrongAnswersList((prev) => [...prev, answersObject.qId]);
          }
          dispatchQuestions(answersObject, groupName);
        },
        addonQuestionConfig
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loadAnswersSuccess,
    fetchQuestionData,
    isSaleAgent,
    isRejected,
    addonQuestionConfig,
  ]);

  useEffect(() => {
    if (setTab && selectedQuestion?.group) {
      setTab(_camelCase(selectedQuestion.group));
    }
    setSelectedDocument(undefined);
    const { groupId } = selectedQuestion ?? {};
    if (!uploadedDocuments || uploadedDocuments.length <= 0) return;
    if (!groupId) return;
    if (groupId === questionGroups.policyholder.id && isCompany) return;
    setSelectedDocument(documentByQuestion(groupId, uploadedDocuments));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuestion, uploadedDocuments]);

  const sections = Object.keys(sidebarCount);
  return (
    <>
      <SalesNeedsToFix
        question={selectedQuestion}
        open={openSalesFix}
        handleOptionSwitch={handleOptionSwitch}
        toggleOpen={() => setOpenSalesFix(!openSalesFix)}
        saveAnswerToLocal={saveAnswerToLocal}
      />
      <UpdateDataMyself
        modalToggle={openUpdateMySelf}
        order={orderDetail}
        question={selectedQuestion}
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={() => setOpenUpdateMySelf(false)}
        selectedDocument={selectedDocument}
      />
      <Grid container alignContent="center" className={classes.infoPanels}>
        {questionConfigGroup.map(([groupId, question]) => {
          if (sections.includes(groupId)) {
            return (
              <Grid key={question} item xs={12} id={groupId}>
                <AccordionSection
                  removePadding
                  isCollapsible={false}
                  summary={question}
                  details={
                    <QcContainerList
                      infoPanels={infoPanels}
                      questionList={questionConfig[groupId]}
                      wrongAnswersList={wrongAnswersList}
                      shouldReadonly={!isPending}
                      setOpenPackageDetails={setOpenPackageDetails}
                      setSelectedPackage={setSelectedPackage}
                      handleQuestionReject={handleQuestionReject}
                      handleQuestionApprove={handleQuestionApprove}
                      handleQuestionEdit={handleQuestionEdit}
                    />
                  }
                  hideBadge
                />
              </Grid>
            );
          }
          return null;
        })}
      </Grid>
    </>
  );
}

export default React.memo(QcInfoPanel);
