import { ForecastData, ForecastDetailsData, Product } from '@/types';
import { convertToBrand } from './brand-converter';

export const createBaseForecast = (
  data: ForecastDetailsData,
  product: Product
): ForecastData => {
  return {
    product: {
      id: product.id,
      brand: convertToBrand(product.brand),
      sku: product.sku,
      material_description: product.material_description || '',
      offering_number: Number(product.offering_number) || 0,
      brand_pillar: product.brand_pillar || {},
    },
    cost: 0,
    monthly_total: 0,
    sub_total: 0,
    items: data.unit_forecast || {},
  };
};

export const createProductForecast = (
  baseForecast: ForecastData,
  product: any
): ForecastData => {
  return {
    ...baseForecast,
    product: {
      id: product.id,
      brand: convertToBrand(product.brand || product.brand_pillar?.brand),
      sku: product.sku,
      material_description: product.material_description || '',
      offering_number: Number(product.offering_number) || 0,
      brand_pillar: product.brand_pillar || {},
    },
  };
};
