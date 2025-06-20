import { getForecastDetails } from "@/api/forecasts/get-forecast-details";
import { getInnovation } from "@/api/innovations/get-innovation";
import { getOfferings } from "@/api/innovations/offerings/get-offerings";
import { useOfferingProducts } from "./use-offering-products";
import { useQuery } from "@tanstack/react-query";

export const useForecastData = (id: string) => {

  const { data: innovation, isLoading: isInnovationLoading, error: innovationError } = useQuery({
    queryKey: ['innovation', id],
    queryFn: () => getInnovation(id),
    enabled: !!id
  });

  const { data: forecastResponse, isLoading: isForecastLoading, error: forecastError } = useQuery({
    queryKey: ['forecast-details', innovation?.data?.id],
    queryFn: () => getForecastDetails(innovation?.data?.id?.toString() || ''),
    enabled: !!innovation?.data?.id
  });

  const { data: offerings, isLoading: isOfferingsLoading } = useQuery({
    queryKey: ['offerings', innovation?.data?.id],
    queryFn: () => getOfferings(Number(innovation?.data?.id)),
    enabled: !!innovation?.data?.id
  });

  const { offeringProducts, isLoading: isProductsLoading, isError: isProductsError } =
    useOfferingProducts(innovation?.data?.id?.toString() || '', offerings);

  return {
    forecastResponse,
    offerings,
    offeringProducts,
    isLoading: isForecastLoading || isOfferingsLoading || isProductsLoading,
    error: forecastError || isProductsError
  };
};
