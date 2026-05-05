import transformDetails from './transformDetails';
import transformLogo from './transformLogo';

class Transformer {
  lang: string;

  constructor(lang: string) {
    this.lang = lang;
  }

  transformApiResponse(response: any) {
    return response.map((apiPackage: any) =>
      this.transformApiPackage(apiPackage as any)
    );
  }

  transformApiPackage(apiPackage: any) {
    const packageData = apiPackage?.package || apiPackage;
    return {
      id: packageData.id,
      logo: transformLogo(packageData.insurer),
      title:
        this.lang === 'en'
          ? packageData.displayNameEn
          : packageData.displayNameTh,
      subtitle:
        this.lang === 'en'
          ? packageData.productNameEn
          : packageData.productNameTh,
      premium: packageData.premium,
      installments: 10,
      rating: packageData.annotations.rating,
      hotDeal: packageData.hotDeal,
      category: `health:categories.${packageData.category}`,
      plan: packageData.plan,
      product: packageData.product,
      features: packageData.features,
      online_sale: true,
      details: transformDetails(packageData, this.lang),
      insurer: packageData.insurer,
      paymentFlag: packageData.paymentFlag,
    };
  }
}

export default Transformer;
