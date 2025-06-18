import { useQueries } from '@tanstack/react-query';
import { getOfferingProducts } from '@/api/products/get-offering-products';
import { Offering } from '@/components/AddInnovation/Offering/types';
import { OfferingProductData } from '@/api/products/get-offering-products';

export interface OfferingProductsMap {
  [key: string]: OfferingProductData[];
}

interface UseOfferingProductsResult {
  offeringProducts: OfferingProductsMap ;
  isLoading: boolean;
  isError: boolean;
  errors: (Error | null)[];
  queries: ReturnType<typeof useQueries>;
}

export const useOfferingProducts = (innovationId: string, offerings: Offering[] = []): UseOfferingProductsResult => {

  const offeringQueries = useQueries({
    queries: offerings?.map((offering) => ({
      queryKey: ['offering-products', innovationId, offering.id],
      queryFn: () => getOfferingProducts(innovationId, offering.id!),
      enabled: !!innovationId && !!offering.id,
    })) || [],
  });

  const isLoading = offeringQueries.some((query) => query.isLoading);
  const isError = offeringQueries.some((query) => query.isError);
  const errors = offeringQueries.map((query) => query.error).filter(Boolean);

  const offeringProducts = offerings?.reduce<OfferingProductsMap>((acc, offering, index) => {
    const queryResult = offeringQueries[index]?.data
    if (queryResult?.data?.products) {
      acc[offering.id!] = queryResult.data.products
    }
    return acc;
  }, {});

  return {
    offeringProducts,
    isLoading,
    isError,
    errors,
    queries: offeringQueries,
  };
};