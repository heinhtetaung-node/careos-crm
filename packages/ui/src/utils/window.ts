import { RefObject } from 'react';
import moment from 'moment';
import { CarDetails } from 'package/interfaces';

export function isElementInViewport(el: RefObject<HTMLDivElement>) {
  if (el.current == null) {
    return false;
  }
  const rect = el.current.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < document.documentElement.clientHeight;
}

export const formatFieldResponse = (field: string, value: string | number) => {
  switch (field) {
    case 'doors':
      return `(${value} Doors)`;
    case 'month':
      return moment()
        .month((value as number) - 1)
        .format('MMMM');
    case 'engineSize':
      return `${value} CC`;
    default:
      return value;
  }
};

type CarFieldType = keyof CarDetails;
type linesType = string | number;

export const getCarName = (carData: CarDetails & { isCurated: boolean }) => {
  if (!Object.keys(carData).length) return null;

  const firstLineOrder: CarFieldType[] = carData.isCurated
    ? ['year', 'brand', 'model']
    : ['year', 'brand', 'model', 'month'];
  const secondLineOrder: CarFieldType[] = carData.isCurated
    ? ['engineSize', 'doors', 'cabType', 'submodelName', 'description']
    : [
        'fuelType',
        'engineSize',
        'transmissionType',
        'doors',
        'secondaryBadgeDescription',
        'type',
      ];

  const firstLine: linesType[] = [];
  const secondLine: linesType[] = [];

  firstLineOrder.forEach((order) => {
    if (carData[order]) {
      const formattedResponse: linesType = formatFieldResponse(
        order,
        carData[order] as linesType
      );
      firstLine.push(formattedResponse);
    }
  });

  secondLineOrder.forEach((order) => {
    if (carData[order]) {
      const formattedResponse: linesType = formatFieldResponse(
        order,
        carData[order] as linesType
      );
      secondLine.push(formattedResponse);
    }
  });

  return {
    top: firstLine.join(' '),
    bottom: secondLine.join(' '),
  };
};
