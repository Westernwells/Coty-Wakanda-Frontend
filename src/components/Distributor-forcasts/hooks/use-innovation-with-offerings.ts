import { getInnovations } from "@/api/innovations/get-innovations";
import  {InnovationWithStatus} from "@/components/Distributor-forcasts/types/types"
import { ApiResponse, InnovationWithOfferings, Offering } from "@/components/Distributor-forcasts/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getOfferings } from "@/api/innovations/offerings/get-offerings";

export const useInnovationsWithOfferrings = (activePage: number, itemsPerPage: number, activeTab: string | null) => {

    const { data: innovationsData, isLoading: isInnovationsLoading } = useQuery<ApiResponse>({
        queryKey: ['innovations',],
        queryFn: getInnovations
    });

    const { data: offeringsData, isLoading: isOfferingsLoading } = useQuery({
        queryKey: ['offerings', innovationsData?.data],
        queryFn: async () => {
            if (!innovationsData?.data) return [];
            const offerings = await Promise.all(
                innovationsData.data.map((innovation: InnovationWithStatus) => getOfferings(innovation.id))
            );
            return offerings;
        },
        enabled: !!innovationsData?.data
    });

    const combinedData = useMemo(() => {
        if (!innovationsData?.data || !offeringsData) return [];
        return innovationsData.data.map((innovation: InnovationWithStatus, index: number) => ({
            ...innovation,
            offerings: offeringsData[index]
        }));
    }, [innovationsData?.data, offeringsData]);

    const flatData = useMemo(() => {
        if (!combinedData) return [];
        return combinedData.flatMap((innovation: InnovationWithOfferings) =>
            (innovation.offerings || []).map((offering: Offering) => ({
                ...offering,
                brand: innovation.brand,
                status: innovation.status,
                innovationId: innovation.id,
            }))
        );
    }, [combinedData]);


    const totalPages = innovationsData?.meta?.total 
        ? Math.ceil(innovationsData.meta.total / Number(itemsPerPage))
        : 0;

    return {
        flatData,
        isLoading: isInnovationsLoading || isOfferingsLoading,
        totalPages
    }
};