const srcSet = ['https://storage.googleapis.com/skillful-rush/__id__.png'];

export default (insurerCode) =>
  srcSet.map((logo) => logo.replace('__id__', insurerCode)).join(', ');
