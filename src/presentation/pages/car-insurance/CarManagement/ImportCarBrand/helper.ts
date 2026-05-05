export const importCarBrandMaximumUpload = 100;

const CarBrand = {
  id: 'brand_id',
  name: 'brand_name',
};

export const importCarBrandTemplate = [CarBrand.id, CarBrand.name];

export const importCarBrandRequireColumn = [CarBrand.name];

export const importCarBrandTemplateWithType = [
  {
    name: CarBrand.name,
    dataType: 'string',
  },
];
