import { useState } from "react";
import { Modal, Button } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { PriceBenchmarkSection } from "./PriceBenchmarkSection";
import { getBrands } from "@/api/get-brands";
import { getCategories } from "@/api/listManagement/coreCategories/get-categories";
import { getProducts } from "@/api/products/get-products";
import { useUpdateOfferingProduct } from "@/api/innovations/offerings/products/update-product";
import { PriceBenchmark } from "@/types";
import { CreateOfferingProductDTO } from "@/api/innovations/offerings/products/create-product";

interface PriceBenchmarkModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (benchmark: PriceBenchmark) => void;
  initialValue?: PriceBenchmark | null;
  productId: number;
  innovationId: number | string;
  offeringId: number | string;
  isEditMode?: boolean;
  productData?: Partial<CreateOfferingProductDTO>;
}

export function PriceBenchmarkModal({
  opened,
  onClose,
  onSave,
  initialValue,
  productId,
  innovationId,
  offeringId,
  isEditMode = false,
  productData = {},
}: PriceBenchmarkModalProps) {
  const [localValue, setLocalValue] = useState<PriceBenchmark | null>(
    initialValue || null
  );
  const { data: brandsResp } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands({ do_not_paginate: 1 }),
  });
  const { data: categoriesResp } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ page_size: 9999 }),
  });
  const { data: productsResp } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ page_size: 9999 }),
  });
  const brandsData = brandsResp?.data || [];
  const categoriesData = categoriesResp?.data || [];
  const productsListData = productsResp?.data || [];
  const updateProduct = useUpdateOfferingProduct();

  function handleSave() {
    if (!localValue) return;
    if (isEditMode) {
      updateProduct.mutate(
        {
          innovationId,
          offeringId,
          id: productId,
          data: {
            ...productData,
            irc: productData.irc ?? "",
            icp_cost: productData.icp_cost ?? 0,
            price: productData.price ?? 0,
            currency: productData.currency ?? "USD",
            brand_id: productData.brand_id ?? "",
            product_type: productData.product_type ?? "saleable",
            pref: productData.pref ?? "pref",
            grouping: productData.grouping ?? "1",
            price_benchmark: localValue,
          },
        },
        {
          onSuccess: () => {
            onSave(localValue);
            onClose();
          },
        }
      );
    } else {
      onSave(localValue);
      onClose();
    }
  }

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
              Set Price Benchmark
            </h2>
            <PriceBenchmarkSection
              value={localValue}
              onChange={setLocalValue}
              brandsData={{ data: brandsData as any }}
              productsListData={{ data: productsListData as any }}
              categoriesData={{ data: categoriesData as any }}
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
                onClick={handleSave}
                className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
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
