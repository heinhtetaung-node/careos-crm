import { DataSchema } from './interface';

type DataPatchType = {
  name: string;
  patches: Record<string, any>;
  showPenIcon?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export const setValuesToDataSchema = (
  dataSchema: DataSchema,
  dataPatch: DataPatchType[]
) => {
  const newDataSchema = { ...dataSchema };

  dataPatch.forEach(({ name, patches }) => {
    if (newDataSchema[name]?.inputProps) {
      newDataSchema[name].inputProps = {
        ...newDataSchema[name].inputProps,
        ...patches,
      };
    }
  });

  return newDataSchema;
};
