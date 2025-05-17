import { useRef } from "react";
import { useFileUpload } from "@/api/products/upload-document";
import { Loader } from "@mantine/core";
import { useAddBrandDistributors } from "@/api/distributors/add-brand-distributors";
import { useQueryClient } from "@tanstack/react-query";

interface BrandProofUploadProps {
  distributorId: number | string;
  brand: {
    category: string;
    brand_id: number;
    approved: boolean;
    proof: { name: string; url: string }[];
    type: string;
    pricing_id: number;
  };
  onSuccess?: () => void;
}

export function BrandProofUpload({
  distributorId,
  brand,
  onSuccess,
}: BrandProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useFileUpload({ mutationConfig: {} });
  const addBrandDistributors = useAddBrandDistributors({});
  const queryClient = useQueryClient();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file_name", file.name);
    formData.append("file_type", file.type);
    formData.append("file", file);
    uploadFile.mutate(
      { data: formData },
      {
        onSuccess: (res) => {
          const url = res.data.data.url;
          const name = file.name;
          const updatedBrand = {
            ...brand,
            proof: [...brand.proof, { name, url }],
          };
          addBrandDistributors.mutate(
            {
              distributorId,
              data: { brands: [updatedBrand] },
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({
                  queryKey: ["brands", distributorId],
                });
                onSuccess?.();
              },
            }
          );
        },
      }
    );
  }

  const isLoading = uploadFile.isPending || addBrandDistributors.isPending;

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
        className="bg-primary rounded-md text-white p-1 text-sm min-w-[90px] flex items-center justify-center"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
      >
        {isLoading ? <Loader size="xs" color="white" /> : "Upload proof"}
      </button>
    </div>
  );
}
