import { CreateOfferingProductDTO } from "@/api/innovations/offerings/products/create-product";
import { useUpdateOfferingProduct } from "@/api/innovations/offerings/products/update-product";
import { PriceBenchmark } from "@/types";
import { Button, Modal } from "@mantine/core";
import { useState } from "react";
import { PriceBenchmarkSection } from "./PriceBenchmarkSection";
import { Product } from "@/types/InnovationOfferProduct";

interface PriceBenchmarkModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (benchmark: PriceBenchmark) => void;
  initialValue?: PriceBenchmark | null;
  isEditMode?: boolean;
  productData?: Partial<CreateOfferingProductDTO> & {
    product_id?: string;
  };
  productListData?: Product[]; // Optional prop for product list data
  brandOptions?: Array<{ value: string; label: string }>;
}

export function PriceBenchmarkModal({
  opened,
  onClose,
  onSave,
  initialValue,
  isEditMode = false,
  productData = {},
  productListData = [],
  brandOptions = [],
}: PriceBenchmarkModalProps) {
  const [localValue, setLocalValue] = useState<PriceBenchmark | null>(
    initialValue
      ? {
          ...initialValue,
          brand_id: initialValue.brand?.id || productData.brand_id || "",
          product_id: initialValue.product_id || productData.product_id || "",
        }
      : null
  );

  const updateProduct = useUpdateOfferingProduct();

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      withinPortal={false}
      trapFocus={false}
      className={opened ? "absolute top-0 right-80 h-full w-full" : "hidden"}
    >
      <Modal.Overlay
        bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
        blur={3}
      />
      <Modal.Content className="!items-center min-w-[50%]">
        <Modal.Body>
          <div className="bg-white rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">
              Set Price Benchmarkx
            </h2>
            <PriceBenchmarkSection
              value={localValue}
              onChange={setLocalValue}
              productsListData={{ data: productListData }}
              brandOptions={brandOptions}
            />
            <div className="flex justify-end gap-4 mt-8">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                onClick={() => {
                  onSave(localValue as PriceBenchmark);
                }}
                className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300 hover:text-primary"
                disabled={!localValue}
                loading={isEditMode && updateProduct.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
