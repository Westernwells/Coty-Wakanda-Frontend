import { axios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

export type FileResponse = {
  public_url: string;
  url: string; // presigned URL for upload
  title: string;
};

export type ApiResponseFiles = {
  data: {
    message: string;
    data: FileResponse;
  };
};

// Step 1: Get presigned URL from backend
export const getPresignedUrl = async ({
  data,
}: {
  data: FormData;
}): Promise<ApiResponseFiles> => {
  try {
    const response = await axios.post(`/aws-presigned-url`, data);
    return response;
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw new Error("Failed to get upload URL");
  }
};

// Step 2: Upload file to S3 using presigned URL
export const uploadToS3 = async (
  presignedUrl: string,
  file: File,
  contentType: string
): Promise<void> => {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": contentType,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to storage");
  }
};

type UseFileUploadOptions = {
  mutationConfig?: MutationConfig<typeof getPresignedUrl>;
};

export const useFileUpload = ({
  mutationConfig,
}: UseFileUploadOptions = {}) => {
  const { onSuccess, onError, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: async ({ data }: { data: FormData }) => {
      try {
        // Step 1: Get presigned URL
        const presignedUrlResponse = await getPresignedUrl({ data });

        if (!presignedUrlResponse?.data?.data?.url) {
          throw new Error("No presigned URL received from server");
        }

        const file = data.get("file");
        if (!file || !(file instanceof File)) {
          throw new Error("No valid file found in form data");
        }

        const contentType = file.type || "application/octet-stream";

        // Step 2: Upload to S3
        await uploadToS3(presignedUrlResponse.data.data.url, file, contentType);

        // Return the response which should contain the public_url
        return presignedUrlResponse;
      } catch (error) {
        console.error("File upload error:", error);
        throw error;
      }
    },
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    onError: (error, variables, context) => {
      console.error("Mutation error:", error);
      onError?.(error, variables, context);
    },
    ...restConfig,
  });
};
