import { axios } from "@/lib/axios";
import { LoginValues } from "@/types";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

export type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
};

type ApiResponse = {
  data: {
    message: string;
    data: { token: string; user: User };
  };
};

export const userLogin = ({
  data,
}: {
  data: LoginValues;
}): Promise<ApiResponse> => {
  return axios.post(`/login`, data);
};

type UseUserLoginOptions = {
  mutationConfig?: MutationConfig<typeof userLogin>;
};

export const useUserLogin = ({ mutationConfig }: UseUserLoginOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      Cookies.set("token", args[0].data.data.token)
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: userLogin,
  });
};
