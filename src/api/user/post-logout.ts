import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

type ApiResponse = {
  data: {
    message: string;
  };
};

export const userLogout = (): Promise<ApiResponse> => {
  return axios.post(`/logout`);
};

type UseUserLogoutOptions = {
  mutationConfig?: MutationConfig<typeof userLogout>;
};

export const useUserLogout = ({ mutationConfig }: UseUserLogoutOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      Cookies.remove("token");
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: userLogout,
  });
};
