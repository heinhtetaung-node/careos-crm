export const hideAgentAddLeadButton =
  Boolean(process.env.VITE_HIDE_AGENT_ADD_LEAD_BUTTON) ?? true;

export const isCustomerInformation =
  Boolean(process.env.VITE_CUSTOMER_INFORMATION) ?? true;

export const hideTeamsInsurerFilter =
  Boolean(process.env.VITE_HIDE_TEAMS_INSURER_FILTER) ?? true;

export const websocketEnabled =
  Boolean(process.env.VITE_WEBSOCKET_ENABLED) ?? true;

export const showQuotationHistoryButton =
  Boolean(process.env.VITE_SHOW_QUOTATION_HISTORY) ?? true;

export const showSubModelYearImport =
  Boolean(process.env.VITE_SHOW_SUB_MODEL_YEAR_IMPORT) ?? true;
