import { axios } from "@/lib/axios";
import { Coefficient } from "@/types";

export async function getDistributorCoefficients(
  distributorId: number
): Promise<{ data: Coefficient[] }> {
  const response = await axios.get(
    `/distributors/${distributorId}/coefficients`
  );
  return { data: response.data?.data ?? response.data ?? [] };
}
