import { OfferingProductData } from '@/api/products/get-offering-products';
import { ForecastDetailsData, Offering, TransformedForecast } from '@/components/Distributor-forcasts/types/types';
import { formatMonthYear } from '@/utils/date';
import { useMemo } from 'react';

export const useForecastTransform = (
  offerings: Offering[] = [],
  offeringProducts: Record<string, OfferingProductData[]> = {},
  forecastData?: ForecastDetailsData,
  selectedType: string = 'all'
) => {
  const months = useMemo(() => {
    if (!forecastData?.unit_forecast) return [];

    return Object.keys(forecastData.unit_forecast).map(month => {
      return formatMonthYear(month);
    });
  }, [forecastData]);

  const transformedForecasts = useMemo<TransformedForecast[]>(() => {
    if (!offerings || !forecastData) return [];

    const originalMonths = Object.keys(forecastData.unit_forecast);
    const formattedMonths = originalMonths.map(formatMonthYear);

    return offerings.map((offering) => {
      const products = offeringProducts[offering.id!] || [];

      const filteredProducts = products.filter(product => {
        if (selectedType === "all") return true;
        return product.product_type?.toLowerCase() === selectedType.toLowerCase();
      });

      return {
        offeringNumber: offering.number,
        data: filteredProducts.map(product => ({
          brand: product.brand?.name || product.brand_pillar?.brand?.name || 'N/A',
          pillar: product.brand_pillar?.name || 'N/A',
          sku: product.sku || 'N/A',
          launchId: product.offering_number?.toString() || 'N/A',
          cost: product.price?.toString() || 'N/A',
          ...originalMonths.reduce((acc, month, index) => ({
            ...acc,
            [formattedMonths[index]]: forecastData.unit_forecast[month]?.value?.toString() || '0'
          }), {})
        }))
      };
    });
  }, [offerings, offeringProducts, forecastData, selectedType]);

  const sortedForecasts = useMemo(() => {
    return [...transformedForecasts].sort((a, b) => Number(b.offeringNumber) - Number(a.offeringNumber));
  }, [transformedForecasts]);

  return {
    months,
    transformedForecasts: sortedForecasts
  };
}; 