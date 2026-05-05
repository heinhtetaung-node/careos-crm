const CarModel = {
  name: 'model_name',
  brandId: 'brand_id',
};

export const importCarModelTemplate = [CarModel.name, CarModel.brandId];

export const importCarModelRequireColumn = [CarModel.name, CarModel.brandId];

export const importCarModelTemplateWithType = [
  {
    name: CarModel.name,
    dataType: 'string',
  },
  {
    name: CarModel.brandId,
    dataType: 'number',
  },
];

export const importCarModelMaximumRows = 100;
