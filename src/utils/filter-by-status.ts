import { Innovation } from "@/types";

export const filterByStatus =  (data: Innovation[], activeTab: string | null) => {
    if (!data) return [];

return data.filter((innovation: Innovation) => {
    if (activeTab === "upcoming") {
        return innovation.status === "active" || innovation.status === "pre-active";        
    } else if (activeTab === "archived") {
        return innovation.status === "archived" || innovation.status === "cancelled" || innovation.status === "completed";
    }
    return true;
});
}