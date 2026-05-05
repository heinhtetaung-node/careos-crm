/**
 * Order `data` segment keys (without `data/` prefix) → lead JSON patch paths.
 * Used to build {@link ORDER_DATA_JSON_PATH_TO_LEAD_PATH} and default vehicle-field sync.
 */
const DATA_FIELD_TO_LEAD_PATH: Readonly<Record<string, string>> = {
  registeredProvince: '/registeredProvince',
  carLicensePlate: '/carLicensePlate',
  chassisNumber: '/chassisNumber',
  engineNumber: '/vehicleIdNumber',
  vehicleColor: '/carColor',
  carUsageType: '/carUsageType',
};

/**
 * Maps order `data/...` JSON-patch paths (QC forms) to lead JSON patch paths.
 */
export const ORDER_DATA_JSON_PATH_TO_LEAD_PATH: Readonly<
  Record<string, string>
> = Object.fromEntries(
  Object.entries(DATA_FIELD_TO_LEAD_PATH).map(([field, leadPath]) => [
    `data/${field}`,
    leadPath,
  ])
);

type LeadSyncRule = {
  leadPath: string;
  transform?: (value: unknown) => unknown;
};
const asTruthyString = (v: unknown) => v === true || v === 'true';

/**
 * Vehicle order `data` field names (order detail) → lead path + optional value transform.
 * Defaults come from {@link DATA_FIELD_TO_LEAD_PATH}; overrides add coercion / special cases.
 */
const VEHICLE_ORDER_FIELD_TO_LEAD: Readonly<Record<string, LeadSyncRule>> = {
  ...Object.fromEntries(
    Object.entries(DATA_FIELD_TO_LEAD_PATH).map(([field, leadPath]) => [
      field,
      { leadPath },
    ])
  ),
  isRedPlate: {
    leadPath: '/carLicensePlate',
    transform: (v) => (asTruthyString(v) ? 'redplate' : ''),
  },
  vehicleColor: {
    leadPath: '/carColor',
    transform: (v) => (Array.isArray(v) ? v : []),
  },
  carDashCam: {
    leadPath: '/carDashCam',
    transform: asTruthyString,
  },
  carModified: {
    leadPath: '/carModified',
    transform: asTruthyString,
  },
};
export type OrderDataJsonPatch = { path: string; value: unknown };

/**
 * After building order JSON patches, mirror vehicle fields onto the lead (QC CommonForm).
 */
export async function syncOrderDataPatchesToLead(
  patches: OrderDataJsonPatch[],
  updateLead: (path: string, value: unknown) => Promise<void>
): Promise<void> {
  const tasks = patches
    .map(({ path, value }) => {
      const leadPath = ORDER_DATA_JSON_PATH_TO_LEAD_PATH[path];
      if (leadPath == null || value == null) return null;
      return updateLead(leadPath, value);
    })
    .filter((task): task is Promise<void> => task != null);
  await Promise.all(tasks);
}
type LeadUpdater = (path: string, value: unknown) => Promise<void>;

/**
 * Mirrors one order `data` field change onto the lead (order detail vehicle section).
 * Unknown `fieldName` values are ignored for lead sync; order update still runs in the caller.
 */
export async function syncVehicleOrderFieldToLead(
  updateLead: LeadUpdater,
  fieldName: string,
  value: unknown
): Promise<void> {
  const rule = VEHICLE_ORDER_FIELD_TO_LEAD[fieldName];
  if (!rule) return;
  const leadValue = rule.transform ? rule.transform(value) : value;
  await updateLead(rule.leadPath, leadValue);
}
