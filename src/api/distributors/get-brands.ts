import { axios } from "@/lib/axios";

export interface Proof {
  url: string;
  name: string;
}

export interface Pricing {
  id: number;
  name: string;
  type: string;
  description: string | null;
  createdAt: string;
}

export interface Brand {
  id: number;
  name: string;
  type: string;
  category: string;
  approved: boolean;
  proof: Proof[];
  pricing: Pricing;
}

export interface BrandsResponse {
  message: string;
  data: Brand[];
}

export async function getDistributorBrands(
  distributorId: number
): Promise<{ data: Brand[] }> {
  const response = await axios.get(`/distributors/${distributorId}/brands`);
  return { data: response.data?.data ?? response.data ?? [] };
}
