import { Lead } from 'shared/types/lead';

import {
  deleteCouponRules,
  updateConnectedCustomerRules,
  updateHealthConnectedCustomerRules,
} from './rules';

export interface PatchParam {
  path: string;
  op: 'add' | 'remove' | 'replace';
  value?: any;
}

export interface UpdateRule {
  name: string;
  catchParams: string[];
  catchOp: 'add' | 'remove';
  updates: {
    condition: (lead: Lead, value: PatchParam['value']) => boolean;
    path: string;
    op: 'add' | 'remove';
    value: (lead: Lead, value: PatchParam['value']) => any;
  }[];
}

export type ExternalRules = {
  name: string;
  paths: string[];
  ops: PatchParam['op'][];
  condition: (value: string | number, lead: Lead) => boolean;
  getValue?: (value: string | number, lead: Lead) => any;
}[];

export const generatePayloadFromRules = (
  patches: PatchParam[],
  lead: Lead,
  UpdateRules: UpdateRule[]
) => {
  let extraPatches: PatchParam[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const patch of patches) {
    // eslint-disable-next-line no-loop-func
    UpdateRules.forEach((rule) => {
      if (rule.catchParams.includes(patch.path) && rule.catchOp === patch.op) {
        extraPatches = extraPatches.concat(
          rule.updates
            .filter((u) => u.condition(lead, patch.value))
            .map((u) => ({
              path: u.path,
              op: u.op,
              value: u.value(lead, patch.value),
            }))
        );
      }
    });
  }
  return extraPatches;
};

export const shouldDeleteCoupon = (
  path: string,
  value: string | number,
  op: PatchParam['op'],
  lead: Lead
) =>
  deleteCouponRules.filter(
    (rule) =>
      rule.paths.includes(path) &&
      rule.condition(value, lead) &&
      rule.ops.includes(op)
  ).length > 0;

export const getUpdateCustomerPayload = (
  path: string,
  value: string | number,
  op: PatchParam['op'],
  lead: Lead,
  connectedCustomer?: unknown | null,
  isHealth: boolean = false
) => {
  if (connectedCustomer) {
    return (
      isHealth
        ? updateHealthConnectedCustomerRules
        : updateConnectedCustomerRules
    )
      .filter(
        (rule) =>
          rule.paths.includes(path) &&
          rule.condition(value, lead) &&
          rule.ops.includes(op)
      )
      .reduce((p, v) => ({ ...p, ...v.getValue?.(value, lead) }), {});
  }
  return {};
};
