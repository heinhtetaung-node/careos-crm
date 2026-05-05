/** Raw OIC option value (e.g. 110, E11) → order.data.oicCode (TYPE_110, TYPE_E11). */
export function formatOicCodeForOrder(raw: string): string {
  if (!raw) return '';
  return raw === 'E11' ? 'TYPE_E11' : `TYPE_${raw}`;
}

/** order.data.oicCode → value for OIC Select (110, E11, …). */
export function parseOicCodeForSelect(oicCode?: string | null): string {
  if (oicCode == null || oicCode === '') return '';
  return String(oicCode).replace(/^TYPE_/, '');
}
