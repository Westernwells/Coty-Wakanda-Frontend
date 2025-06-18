import { Brand } from "@/types";

export type OfferingBrand = {
  id: number;
  name: string;
  type: string;
  created_at: string;
} | null;

export const convertToBrand = (brand?: OfferingBrand): Brand => {
  if (!brand) {
    return {
      id: 0,
      brand_type_id: 0,
      name: 'Unknown Brand',
      active: true,
      type: 'Mass',
      created_at: '',
      updated_at: '',
      deleted_at: null,
      pivot: {
        distributor_id: 0,
        brand_id: 0
      }
    };
  }
  
  return {
    id: brand.id || 0,
    brand_type_id: 0,
    name: brand.name || 'Unknown Brand',
    active: true,
    type: brand.type as "Luxury" | "Mass",
    created_at: brand.created_at || '',
    updated_at: brand.created_at || '',
    deleted_at: null,
    pivot: {
      distributor_id: 0,
      brand_id: brand.id || 0
    }
  };
}; 