import { getInnovations } from "@/api/innovations/get-innovations";
import { InnovationWithStatus } from "@/components/Distributor-forcasts/types/types"
import { ApiResponse } from "@/components/Distributor-forcasts/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useInnovationsWithOfferrings = (activePage: number, itemsPerPage: number, activeTab: string | null) => {
    const { data: innovationsData, isLoading: isInnovationsLoading } = useQuery<ApiResponse>({
        queryKey: ['innovations'],
        queryFn: getInnovations
    });
    const filteredData = useMemo(() => {
        if (!innovationsData?.data) return [];
        
        return innovationsData.data.filter((innovation: InnovationWithStatus) => {
            if (activeTab === "upcoming") {
                return innovation.status === "active" || innovation.status === "pre-active";
            } else if (activeTab === "archived") {
                return innovation.status === "archived" || innovation.status === "cancelled" || innovation.status === "completed";
            }
            return true;
        });
    }, [innovationsData?.data, activeTab]);

    const paginatedData = useMemo(() => {
        const startIndex = (activePage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, activePage, itemsPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredData.length / itemsPerPage);
    }, [filteredData.length, itemsPerPage]);

    return {
        innovationsData: { ...innovationsData, data: paginatedData },
        isLoading: isInnovationsLoading,
        totalPages
    };
};