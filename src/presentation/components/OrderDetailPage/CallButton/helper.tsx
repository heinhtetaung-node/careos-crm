const primaryPhoneToFirst = (phoneNumbers: any, primaryPhoneIndex: number) => {
  if (!phoneNumbers || phoneNumbers?.length <= 0) return [];
  const newList = phoneNumbers.filter(
    (phone: any) => phone.name !== phoneNumbers[primaryPhoneIndex].name
  );
  newList.unshift(phoneNumbers[primaryPhoneIndex]);
  return newList;
};

export default primaryPhoneToFirst;
