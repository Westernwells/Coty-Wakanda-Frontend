import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { queryClient } from "@/main";
import { ForecastSubmitInput } from "@/types";
import { useMutation } from "@tanstack/react-query";


export const submitOrder = ({
  data,
  type
}: {
  data: {order: ForecastSubmitInput[]};
  type: "submit" | "save"
}): Promise<Comment> => {
  return axios.post(
    `/orders/${type}`,
    data
  );
};

type useSubmitOrderOptions = {
  mutationConfig?: MutationConfig<typeof submitOrder>;
};

export const useSubmitOrder = ({
  mutationConfig,
}: useSubmitOrderOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: submitOrder,
  });
};
