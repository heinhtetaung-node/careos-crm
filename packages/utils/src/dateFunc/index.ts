export const getAgeByBirthday = (date: string) => {
  const today = new Date();
  const birthDate = new Date(date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

export const getBornYearByAge = (age: number) => {
  const currentYear = new Date().getFullYear();
  return currentYear - age;
};

export const getBornDateRangeByAge = (age: number) => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - age;
  return {
    startDate: new Date(`${minYear}-01-01`),
    endDate: new Date(`${minYear}-12-31`),
  };
};
