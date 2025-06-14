import { getForecastDetails } from "@/api/forecasts/get-forecast-details";
import { getOfferings } from "@/api/innovations/offerings/get-offerings";
import { useOfferingProducts } from "./use-offering-products";
import { useQuery } from "@tanstack/react-query";

export const useForecastData = (forecastId: string) => {
    const { data: forecastResponse, isLoading: isForecastLoading, error: forecastError } = useQuery({
      queryKey: ['forecast-details', forecastId],
      queryFn: () => getForecastDetails(forecastId)
    });
  
    const { data: offerings, isLoading: isOfferingsLoading } = useQuery({
      queryKey: ['offerings', forecastId],
      queryFn: () => getOfferings(Number(forecastId))
    });
  
    const { offeringProducts, isLoading: isProductsLoading, isError: isProductsError } = 
      useOfferingProducts(forecastId, offerings);
  
    return {
      forecastResponse,
      offerings,
      offeringProducts,
      isLoading: isForecastLoading || isOfferingsLoading || isProductsLoading,
      error: forecastError || isProductsError
    };
  };
  