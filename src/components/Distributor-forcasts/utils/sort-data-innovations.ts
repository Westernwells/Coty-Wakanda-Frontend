import { FlattenedOffering } from "@/components/Distributor-forcasts/types/types";
import { SortBy } from "@/enums/sortBy";

export const sortData = (data: FlattenedOffering[], sortBy: string | null, direction: 'asc' | 'desc') => {
    if (!sortBy) return data;

    const dir = direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
        const getValue = (item: FlattenedOffering) => {
            switch (sortBy) {
                case SortBy.Brand: return item.brand?.name?.toLowerCase() || "";
                case SortBy.OfferingNumber: return Number(item.number) || 0;
                case SortBy.Status: return item.status?.toLowerCase() || "";
                default: return "";
            }
        };
        const valA = getValue(a);
        const valB = getValue(b);
        if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * dir;
        }
        return 0;
    });
};
