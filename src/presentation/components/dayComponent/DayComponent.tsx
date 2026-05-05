import {
  Card,
  CardActions,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useMemo } from 'react';

import { dayComponent } from 'models/DayComponent';
import { getString } from 'presentation/theme/localization';
import { format } from 'utils/datetime';

import TimeUtils from '../../../shared/helper/TimeUtils';
import './DayComponent.scss';

interface IProps {
  readonly data: dayComponent;
  onSelect: (dayData: dayComponent) => any;
  readonly isLoading: boolean;
  readonly isDisabled: boolean;
}

const useStyles = makeStyles((theme) => ({
  titleSkeletonDays: {
    margin: '0 auto',
  },
  skeletonTextMargin: {
    margin: '10px 0',
  },
  dayActive: {
    border: `4px solid ${theme.palette.primary.main} !important`,
    borderRadius: '7px !important',
  },
}));

function DayComponent({ data, onSelect, isLoading, isDisabled }: IProps) {
  const classes = useStyles();

  const isToday = (): boolean => {
    const today = format(new Date(), 'dd-MM-yyyy');
    const dateData = format(new Date(data.date), 'dd-MM-yyyy');

    return dateData === today;
  };

  const getDayLabel = () =>
    !isToday()
      ? getString(
          `weekDay.${TimeUtils.formatCustomOption(
            data.date,
            'EEE'
          ).toLowerCase()}`
        ).toUpperCase()
      : getString('text.today').toUpperCase();

  const getDayHeader = useMemo(() => {
    if (isLoading) {
      return (
        <>
          <Skeleton
            variant="text"
            width="60%"
            className={classes.titleSkeletonDays}
          />
          <Skeleton variant="text" />
        </>
      );
    }
    return (
      <>
        <Typography
          data-testid={getDayLabel()}
          className="title"
          color="textPrimary"
          gutterBottom
        >
          {getDayLabel()}
        </Typography>
        <Typography
          className="sub-title"
          variant="caption"
          data-testid={`day-${TimeUtils.formatCustomOption(data.date, 'd')}`}
          gutterBottom
        >
          {`${TimeUtils.formatCustomOption(
            data.date,
            'do'
          )} - ${TimeUtils.formatCustomOption(data.date, 'MMM')}`}
        </Typography>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isToday, data.date, isLoading]);

  const handleSelected = (dayData: any) => {
    if (isDisabled) {
      return;
    }
    onSelect(dayData);
  };

  const isPropExists = (prop: string): boolean => Object.hasOwn(data, prop);

  return (
    <Grid
      container
      className={`${
        isDisabled ? ' app-day-component-disabled ' : ''
      }app-day-component unittest-app-day-component`}
      onClick={() => handleSelected(data)}
    >
      <Card
        className={`app-day-component__container ${
          data.isActive && !isLoading ? classes.dayActive : ''
        }`}
      >
        <CardContent
          className={`app-day-component__container__header ${
            isLoading ? 'day-loading' : ''
          }`}
        >
          {getDayHeader}
        </CardContent>
        {!isLoading ? (
          <CardActions className="app-day-component__container__action unittest-day-component-exists">
            <div className="app-day-component__item">
              <small>{getString('text.free')}</small>
              {isPropExists('paymentCalls') && (
                <small>{getString('text.paymentCall')}</small>
              )}
              {isPropExists('urgentCalls') && (
                <small>{getString('text.urgentCall')}</small>
              )}
              <small>{getString('text.appointment')}</small>
            </div>
            <div className="app-day-component__item">
              <small>{data.freeSlots}</small>
              {isPropExists('paymentCalls') && (
                <small className="text-red">{data.paymentCalls}</small>
              )}
              {isPropExists('urgentCalls') && (
                <small className="text-red">{data.urgentCalls}</small>
              )}
              <small className="text-green">{data.appointmentCalls}</small>
            </div>
          </CardActions>
        ) : (
          <div className={classes.skeletonTextMargin}>
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </div>
        )}
      </Card>
    </Grid>
  );
}

export default DayComponent;
