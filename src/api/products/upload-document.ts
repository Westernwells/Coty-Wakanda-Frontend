import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

export type File = {
  url: string;
  title: string;
};

export type ApiResponseFiles = {
    data: {
      message: string;
      data: File;
    };
};

export const fileUpload = ({
  data,
}: {
  data: FormData;
}): Promise<ApiResponseFiles> => {
  return axios.post(`/aws-presigned-url`, data);
};

type UseFileUploadOptions = {
  mutationConfig?: MutationConfig<typeof fileUpload>;
};

export const useFileUpload = ({ mutationConfig }: UseFileUploadOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: fileUpload,
  });
};
