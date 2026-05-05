export type Option = {
  id: string | number;
  value: string | number;
  title: string;
};

export const defaultSelectedValueResolver = (
  options: Option[] | null,
  value: string | number | (string | number)[] | undefined,
  multiple: boolean
) => {
  if (multiple) {
    return (options ?? []).filter((opt) =>
      (value as (string | number)[])?.includes(opt.value)
    );
  }
  return options && options.find((option: Option) => option.value === value);
};
