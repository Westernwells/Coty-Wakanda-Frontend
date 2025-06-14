import { axios } from "@/lib/axios";


export const getOfferings = async (id: number) => {
  const response = await axios.get(`/innovations/${id}/offerings`);
  return response.data.data
};
