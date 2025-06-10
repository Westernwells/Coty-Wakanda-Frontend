import React, { useRef } from "react";
import { Button, Group } from "@mantine/core";
import { PlusIcon, DownloadIcon, UploadIcon } from "lucide-react";
import { downloadSampleProductCsv } from "@/lib/utils/downloadSampleProductCsv";

interface ProductActionsProps {
  onAddProduct: () => void;
  isDeleteMode: boolean;
  setIsDeleteMode: (isDeleteMode: boolean) => void;
  onDeleteProducts: () => Promise<void>;
  hasSelectedProducts: boolean;
  onBulkProductUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  onAddProduct,
  isDeleteMode,
  setIsDeleteMode,
  onDeleteProducts,
  hasSelectedProducts,
  onBulkProductUpload,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onBulkProductUpload(e);
    }
  };

  const triggerFileUpload = () => {
    inputRef.current?.click();
  };

  return (
    <Group mt="md" mb="lg">
      <Button
        leftSection={<DownloadIcon size={16} />}
        className="bg-primary text-white hover:bg-primary/90 rounded-lg"
        onClick={downloadSampleProductCsv}
      >
        Download Sample
      </Button>
      <Button
        leftSection={<UploadIcon size={16} />}
        className="bg-primary text-white hover:bg-primary/90 rounded-lg"
        onClick={triggerFileUpload}
      >
        Bulk product upload
      </Button>
      <input
        type="file"
        accept=".csv"
        ref={inputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <Button
        leftSection={<PlusIcon size={16} />}
        className="bg-primary text-white hover:bg-primary/90 rounded-lg"
        onClick={onAddProduct}
      >
        Add single product
      </Button>
      <Button
        variant="outline"
        className="border-primary text-primary hover:bg-primary/10 rounded-lg"
        onClick={() => {
          if (isDeleteMode) {
            if (hasSelectedProducts) {
              onDeleteProducts();
            }
            setIsDeleteMode(false);
          } else {
            setIsDeleteMode(true);
          }
        }}
      >
        {isDeleteMode ? "Cancel Delete" : "Delete product list"}
      </Button>
    </Group>
  );
};

export default ProductActions;
