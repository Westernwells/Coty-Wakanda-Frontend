import { OfferingProductData } from '@/api/products/get-offering-products';
import {
  ForecastDetailsData,
  Offering,
  TransformedForecast,
} from '@/components/Distributor-forcasts/types/types';
import { useMemo } from 'react';

export const useForecastTransform = (
  offerings: Offering[] = [],
  offeringProducts: Record<string, OfferingProductData[]> = {},
  savedForecasts: any[] = [],
  forecastData?: ForecastDetailsData,
  selectedType: string = 'all'
) => {
  const months = useMemo(() => {
    if (!forecastData?.unit_forecast) return [];
    return Object.keys(forecastData.unit_forecast);
  }, [forecastData]);

  const transformedForecasts = useMemo<TransformedForecast[]>(() => {
    if (!forecastData) return [];

    return offerings.map((offering) => {
      const prods = offeringProducts[offering.id!] || [];
      const filtered = prods.filter((p) =>
        selectedType === 'all'
          ? true
          : p.product_type?.toLowerCase() === selectedType.toLowerCase()
      );

      const data = filtered.map((product) => {
        const saved = savedForecasts.find((f) => f.product.id === product.id);

        const items: Record<string, { value: number; is_closed: boolean }> = {};

        // for (const month of months) {
        //   if (saved && saved.items[month] != null) {
        //     items[month] = {
        //       value: saved.items[month].value,
        //       is_closed: saved.items[month].is_closed,
        //     };
        //   } else {
        //     const def = forecastData.unit_forecast[month];
        //     items[month] = {
        //       value: def?.value ?? 0,
        //       is_closed: def?.is_closed ?? false,
        //     };
        //   }
        // }
        for (const month of months) {
          const valueRaw =
            saved?.items[month]?.value ??
            forecastData.unit_forecast[month]?.value ??
            0;

          const numericValue =
            typeof valueRaw === 'string' ? parseFloat(valueRaw) : valueRaw;

          items[month] = {
            value: numericValue,
            is_closed:
              saved?.items[month]?.is_closed ??
              forecastData.unit_forecast[month]?.is_closed ??
              false,
          };
        }

        return {
          id: product.id,
          brand: product.brand?.name || 'N/A',
          pillar: product.brand_pillar?.name || 'N/A',
          brand_pillar: {
            id: product.brand_pillar?.id || 0,
            name: product.brand_pillar?.name || 'N/A',
          },
          sku: product.sku || 'N/A',
          launchId: product.offering_number?.toString() || 'N/A',
          cost: product.price?.toString() || '0',
          items,
        };
      });

      return {
        offeringNumber: offering.number.toString(),
        data,
      };
    });
  }, [
    offerings,
    offeringProducts,
    forecastData,
    savedForecasts,
    months,
    selectedType,
  ]);

  const sorted = transformedForecasts.sort(
    (a, b) => Number(b.offeringNumber) - Number(a.offeringNumber)
  );

  return { months, transformedForecasts: sorted };
};
