import { useRef, useState } from "react";
import { useFileUpload } from "@/api/products/upload-document";
import { Loader } from "@mantine/core";
import { useAddBrandDistributors } from "@/api/distributors/add-brand-distributors";
import { useQueryClient } from "@tanstack/react-query";

type BrandProof = { name: string; url: string };

interface Brand {
  category: string;
  brand_id: number;
  approved: boolean;
  proof: BrandProof[];
  type: string;
  pricing_id: number | null;
}

interface BrandProofUploadProps {
  distributorId: number | string;
  brand: Brand;
  onSuccess?: () => void;
}

type UploadError = Error | { message: string } | null;

export function BrandProofUpload({
  distributorId,
  brand,
  onSuccess,
}: BrandProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useFileUpload({
    mutationConfig: {
      onError: (error: UploadError) => {
        console.error("Upload error:", error);
        setUploadError(error?.message || "Upload failed");
      },
    },
  });

  const addBrandDistributors = useAddBrandDistributors({});
  const queryClient = useQueryClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", file.name);
      formData.append("file_type", file.type);

      await uploadFile.mutateAsync(
        { data: formData },
        {
          onSuccess: async (res) => {
            console.log("File upload response:", res);
            const url = res.data.data.public_url;
            const name = file.name;

            // Prepare the brand data for the API
            const brandForApi = {
              category: brand.category,
              brand_id: brand.brand_id,
              approved: brand.approved,
              proof: [...brand.proof, { name, url }],
              type: brand.type,
              // Ensure pricing_id is a number or default to 0
              pricing_id: brand.pricing_id || 0,
            };

            await addBrandDistributors.mutateAsync(
              {
                distributorId,
                data: { brands: [brandForApi] },
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["brands", distributorId],
                  });
                  onSuccess?.();
                },
                onError: (error: UploadError) => {
                  console.error("Error updating brand:", error);
                  setUploadError("Failed to update brand information");
                },
              }
            );
          },
        }
      );
    } catch (error) {
      const err = error as UploadError;
      console.error("Upload process error:", err);
      setUploadError(err?.message || "Upload process failed");
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const isLoading = uploadFile.isPending || addBrandDistributors.isPending;
  const error = uploadError || uploadFile.error || addBrandDistributors.error;

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <button
        type="button"
        className="bg-primary rounded-md text-white p-1 text-sm min-w-[90px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
      >
        {isLoading ? <Loader size="xs" color="white" /> : "Upload proof"}
      </button>
      {error && (
        <span className="text-xs text-red-500 ml-2">
          {typeof error === "string" ? error : "Upload failed"}
        </span>
      )}
    </div>
  );
}
