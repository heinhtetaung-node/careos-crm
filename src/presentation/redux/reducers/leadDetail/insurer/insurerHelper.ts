import { findLongInsurerName } from 'presentation/redux/reducers/leads/lead-assignment';

export interface IInsurerItem {
  displayName: string;
  name: string;
  order: number;
  id?: number;
}

export const formatDataListInsurers = (list: any) => {
  if (list) {
    const insurerList = list.insurers || [];
    return {
      insurers: insurerList.map((insurer: IInsurerItem) => {
        const newInsurer = { ...insurer };
        newInsurer.id = Number(newInsurer.name.replace('insurers/', ''));
        newInsurer.displayName = findLongInsurerName(
          newInsurer.name,
          newInsurer.displayName
        ) as string;
        return newInsurer;
      }),
    };
  }
  return {
    insurers: [],
  };
};
