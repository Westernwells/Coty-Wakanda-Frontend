import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/react-query";
import { axios } from "@/lib/axios";
import { User } from "@/types";

type ApiResponse = {
  data: {
    message: string;
    data: User;
  };
};

export const getUser = (): Promise<ApiResponse> => {
  return axios.get(`/user`);
};

export const getUserQueryOptions = () => {
  return queryOptions({
    queryKey: ["user"],
    queryFn: getUser,
  });
};

type UseUsersOptions = {
  queryConfig?: QueryConfig<typeof getUserQueryOptions>;
};

export const useUser = ({ queryConfig }: UseUsersOptions = {}) => {
  return useQuery({
    ...getUserQueryOptions(),
    ...queryConfig,
  });
};
