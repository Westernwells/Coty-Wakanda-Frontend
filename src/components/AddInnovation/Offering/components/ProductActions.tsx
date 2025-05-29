import React from "react";
import { Button, Group } from "@mantine/core";
import { PlusIcon } from "lucide-react";

interface ProductActionsProps {
  onAddProduct: () => void;
  isDeleteMode: boolean;
  setIsDeleteMode: (isDeleteMode: boolean) => void;
  onDeleteProducts: () => Promise<void>;
  hasSelectedProducts: boolean;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  onAddProduct,
  isDeleteMode,
  setIsDeleteMode,
  onDeleteProducts,
  hasSelectedProducts,
}) => {
  return (
    <Group mt="md" mb="lg">
      <Button
        leftSection={<PlusIcon size={16} />}
        className="bg-primary text-white hover:bg-primary/90 rounded-lg"
      >
        Bulk product upload
      </Button>
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
