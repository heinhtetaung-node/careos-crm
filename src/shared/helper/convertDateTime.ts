const MONTH_RANGE = 10;
const HOUR_RANGE = 12;

export const formatTime12Hours = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const second = date.getSeconds();
  const ampm = hours >= HOUR_RANGE ? 'PM' : 'AM';
  if (hours > HOUR_RANGE) {
    hours %= HOUR_RANGE;
    hours = hours || HOUR_RANGE;
  }

  const minutesStr = minutes < MONTH_RANGE ? `0${minutes}` : minutes;
  const secondStr = second < MONTH_RANGE ? `0${second}` : second;

  const strTime = `${hours}:${minutesStr}:${secondStr} ${ampm}`;

  return strTime;
};

export const convertDateDDMMYY = (date: Date) => {
  // INFO: getMonth function start with number 0 => add 1 to every month.
  let month = String(date.getMonth() + 1);
  let day = String(date.getDate());
  const year = String(date.getFullYear());

  // INFO: 2 is length of month that > September and day that > 9.
  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return `${day}/${month}/${year}`;
};

export const convertDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  const time = formatTime12Hours(new Date(isoDate));

  const result = `${convertDateDDMMYY(date)} (${time})`;

  return result;
};
