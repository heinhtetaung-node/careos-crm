export const getCustomerIdFromMapResource = (name: string) => {
  const parts = name.split('/');
  if (parts.length < 4) {
    return '';
  }
  return parts.slice(0, 2).join('/');
};

export const getLeadResourceIdFromOrderLead = (name?: string | null) => {
  const parts = name?.split('/') ?? [];
  if (parts.length < 2) {
    return '';
  }
  return parts[1];
};
