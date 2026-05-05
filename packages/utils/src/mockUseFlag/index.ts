import {
  IFlags,
  IFlagsmithFeature,
  IFlagsmithTrait,
  ITraits,
} from 'flagsmith/types';

interface FlagsCustom {
  name: string;
  enabled: boolean;
}
const getFlagValue = (flag: string | FlagsCustom) => {
  const flagObject = typeof flag === 'object';
  return {
    name: flagObject ? flag.name : flag,
    enabled: flagObject ? flag.enabled : true,
  };
};

const getFlagObject = (
  flags: string[] | FlagsCustom[],
  initialFlags: (IFlags & ITraits) | undefined = undefined
) => {
  const result: Record<string, any> | (IFlags & ITraits) = initialFlags ?? {};
  flags?.forEach((flag) => {
    const flagVal = getFlagValue(flag);
    result[flagVal.name] = {
      enabled: flagVal.enabled ?? true,
    } as IFlagsmithFeature & IFlagsmithTrait;
  });
  return result;
};

/**
 * Mocks all feature flags passed into the useFlags function and leaves
 * them disabled by default. Any feature flag in the enabled param will be
 * enabled by the function.
 *
 * @param enabled A list of enabled flags or a list of flags with custom enabled values.
 * [{ name: 'flagName', enabled: true/false }]
 */
export const mockUseFlags = (
  flagsmith: any,
  flagsmithCore: any,
  flags?: string[] | FlagsCustom[]
) => {
  jest.spyOn(flagsmith, 'useFlags').mockImplementation((keys: any) => {
    // Creates an object with flags that are disabled by default.
    const initialFlags = keys.reduce(
      (o: any, flag: any) => ({ ...o, [flag]: { enabled: false } }),
      {}
    ) as IFlags & ITraits;
    return getFlagObject(flags ?? [], initialFlags);
  });

  jest
    .spyOn(flagsmithCore, 'getAllFlags')
    .mockReturnValue(getFlagObject(flags ?? []) as IFlags & ITraits);
};

export const mockHasfeature = (flagsmithCore: any) => {
  jest.spyOn(flagsmithCore, 'hasFeature').mockReturnValue(true);
};
