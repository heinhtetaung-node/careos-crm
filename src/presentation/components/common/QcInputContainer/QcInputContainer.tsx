/* eslint-disable react/forbid-component-props */

import { EditIcon as CustomEditIcon } from '@alphafounders/icons';
import Box from '@material-ui/core/Box';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import clsx from 'clsx';
import React, { MouseEventHandler } from 'react';

import SquareIconButton from 'presentation/components/SquareIconButton';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getString } from 'presentation/theme/localization';
import { Color } from 'presentation/theme/variants';

import IconButton from '../Button/IconButton';
import Chip from '../Chip';
import PackageTypeBadge from '../PackageTypeBadge';

export interface QcQuestion {
  qId: string;
  groupId?: string;
  name?: string;
  hideQcCheck?: boolean;
  label?: string;
  description?: string;
  isCritical?: boolean;
  isEditable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  value?: any;
  coverageList?: any[];
  helperText?: string;
  actionButton?: (
    handler: MouseEventHandler<HTMLButtonElement>
  ) => React.ReactNode;
  group?: string;
  answer?: boolean;
  chip?: string;
  packageTypeLabel?: string | null;
}

interface QcInputContainerProps {
  question: QcQuestion;
  handleQuestionReject?: (payload: any) => void;
  handleQuestionApprove?: (payload: any) => void;
  handleQuestionEdit?: (payload: QcQuestion) => void;
}

const QcContainer = withStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'start',
      padding: `${theme.spacing(2)}px`,
      borderBottom: `1px solid ${theme.palette.grey[200]}`,
      '&:last-child': {
        borderBottom: 'none',
      },
    },
  })
)(Box);

const QcCheck = withStyles(() =>
  createStyles({
    root: {
      marginRight: '0.625rem',
      minWidth: '3.25rem',
      '& button:last-child': {
        marginLeft: '0.25rem',
      },
    },
  })
)(Box);

const Label = withStyles(() =>
  createStyles({
    root: {
      lineHeight: 1,
      marginBottom: '0.625rem',
      display: 'flex',
      alignItems: 'start',
    },
  })
)(Box);

const TextLight = withStyles((theme) =>
  createStyles({
    root: {
      fontSize: '0.6875rem',
      fontWeight: 400,
      lineHeight: '1rem',
      color: theme.palette.grey[800],
    },
  })
)(Typography);

const EditIcon = withStyles(() =>
  createStyles({
    root: {
      display: 'inline-block',
      marginLeft: 'auto',
    },
  })
)(Box);

export const TextSemibold = withStyles((theme) =>
  createStyles({
    root: {
      fontWeight: 600,
      color: theme.palette.grey[800],
      lineHeight: 1.25,
      fontSize: '0.875rem',
    },
  })
)(Typography);

const HelperText = withStyles((theme) =>
  createStyles({
    root: {
      fontSize: '0.6875rem',
      fontWeight: 400,
      color: theme.palette.grey[400],
      marginTop: '0.375rem',
    },
  })
)(Typography);

const Description = withStyles((theme) =>
  createStyles({
    root: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: theme.palette.grey[800],
    },
  })
)(Typography);

const useStyles = makeStyles({
  increaseInsurerPadding: {
    paddingTop: '0.625rem',
    paddingBottom: '0.625rem',
  },
});

function QcCoverageDetail({ coverageList }: any) {
  return coverageList.map(([coverage, covered]: any) => (
    <Box key={coverage} display="flex" alignItems="center">
      <span className="min-w-[110px] mr-2.5">
        <TextLight>{coverage}</TextLight>
      </span>
      <TextSemibold>{covered}</TextSemibold>
    </Box>
  ));
}
function QcInputContainer({
  question,
  handleQuestionReject,
  handleQuestionApprove,
  handleQuestionEdit,
}: QcInputContainerProps) {
  const { answer } = question;

  const handleApprove = React.useCallback(() => {
    if (handleQuestionApprove) {
      handleQuestionApprove(question);
    }
  }, [handleQuestionApprove, question]);

  const handleReject = React.useCallback(() => {
    if (handleQuestionReject) {
      handleQuestionReject(question);
    }
  }, [handleQuestionReject, question]);

  const handleUpdate = React.useCallback(() => {
    if (handleQuestionEdit) {
      handleQuestionEdit(question);
    }
  }, [handleQuestionEdit, question]);

  const handleQcAction: MouseEventHandler<HTMLButtonElement> = () => {
    console.log('action trigger', question.qId);
  };

  const getCheckBgColor = (icon: string) => {
    if (icon === 'readOnly') {
      return answer ? Color.GREY_800 : '';
    }
    return answer ? Color.SUCCESS : '';
  };

  const getCrossBgColor = (icon: string) => {
    if (icon === 'readOnly') {
      return answer === false ? Color.GREY_800 : '';
    }
    return answer === false ? Color.RED : '';
  };

  const getIconColor = (icon: string) => {
    if (icon === 'check') {
      return answer ? Color.WHITE : '';
    }
    if (icon === 'check_disabled') {
      return answer ? Color.GREY_MEDIUM : '';
    }
    return answer === false ? Color.WHITE : '';
  };

  const checkForError = [
    Questions.VEHICLE_LICENSE,
    Questions.CHASSIS_NUM,
    Questions.ENGINE_NUM,
    Questions.VEHICLE_COLOR,
    Questions.CORRECT_ID_NUMBER,
    Questions.DOCUMENT_TYPE_SPECIFIED,
    Questions.PREFERRED_DELIVERY,
    Questions.HAS_CUSTOMER_EMAIL,
  ];
  let questionError = false;
  let questionValue = question.value;
  if (checkForError.includes(question.qId as Questions)) {
    // Custom case for some special questions
    if (question.qId === Questions.VEHICLE_LICENSE) {
      questionValue = questionValue?.charAt(0) || '';
    }
    questionError = questionValue === '' || questionValue === '-';
  }

  const {
    actionButton,
    hideQcCheck = false,
    disabled = false,
    readOnly = false,
  } = question;
  const classes = useStyles();

  const checkBgColor = readOnly ? 'readOnly' : 'check';
  const crossBgColor = readOnly ? 'readOnly' : 'clear';
  const packageTypeLabelDefaultMap = {
    coverageDetailCorrect: getString('packageListing.packageType.standard'),
  };

  return (
    <QcContainer
      className={clsx(
        hideQcCheck && classes.increaseInsurerPadding,
        questionError && `bg-fieldHighlight`
      )}
    >
      {/* qccheck */}
      {!hideQcCheck ? (
        <QcCheck>
          <SquareIconButton
            data-testid="qc-approve-btn"
            disabled={disabled}
            readOnly={readOnly}
            onClick={handleApprove}
            backgroundColor={getCheckBgColor(checkBgColor)}
            iconColor={
              !disabled ? getIconColor('check') : getIconColor('check_disabled')
            }
          >
            <CheckIcon
              data-testid={`approved-${question.qId}`}
              fontSize="small"
            />
          </SquareIconButton>
          <SquareIconButton
            data-testid="qc-reject-btn"
            disabled={disabled}
            readOnly={readOnly}
            onClick={handleReject}
            backgroundColor={getCrossBgColor(crossBgColor)}
            iconColor={getIconColor('clear')}
          >
            <ClearIcon
              data-testid={`reject-${question.qId}`}
              fontSize="small"
            />
          </SquareIconButton>
        </QcCheck>
      ) : null}
      <Box flexGrow={1}>
        {question.label && (
          <Label component="div">
            <TextLight>{getString(question.label)}</TextLight>
            {question.isEditable && (
              <EditIcon data-testid="qc-edit-input">
                <IconButton
                  iconSize="xs"
                  isDisabled={readOnly ? true : disabled}
                  handleClick={handleUpdate}
                  icon={<CustomEditIcon />}
                />
              </EditIcon>
            )}
          </Label>
        )}
        {(question.value || question.coverageList) && (
          <div>
            {question.coverageList ? (
              <QcCoverageDetail coverageList={question.coverageList} />
            ) : (
              <TextSemibold>
                {getString(question.value)}
                <PackageTypeBadge
                  label={
                    question?.packageTypeLabel ??
                    packageTypeLabelDefaultMap?.[
                      question.qId as keyof typeof packageTypeLabelDefaultMap
                    ] ??
                    ''
                  }
                />
                {question?.chip && (
                  <Chip
                    text={question?.chip}
                    data-testid="qc-question-chip"
                    color="danger"
                    className="ml-2 font-medium"
                  />
                )}
              </TextSemibold>
            )}
          </div>
        )}
        {question.description && (
          <Description
            dangerouslySetInnerHTML={{
              __html: getString(question.description),
            }}
          />
        )}
        {actionButton && actionButton(handleQcAction)}
        {question.helperText && (
          <HelperText>{getString(question.helperText)}</HelperText>
        )}
      </Box>
    </QcContainer>
  );
}

export default QcInputContainer;
