import { useAddBrandDistributors } from "@/api/distributors/add-brand-distributors";
import { Button, Group, Modal, Select, Checkbox } from "@mantine/core";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { selectStyles } from "../Shared/Styles";
import ExitIcon from "../Icons/ExitIcon";
import { getBrands } from "@/api/get-brands";
import { getBillingList } from "@/api/billingList/get-billing-list";
import { getPricingList } from "@/api/pricingList/get-pricing-list";

interface AddBrandFormProps {
  opened: boolean;
  close: () => void;
  distributorId: string;
  category: string;
  onSuccess?: () => void;
}

const coefficientOptions = [
  { value: "co-efficient", label: "Co-efficient" },
  { value: "billing", label: "Billing" },
];

export function AddBrandForm({
  opened,
  close,
  distributorId,
  category,
  onSuccess,
}: AddBrandFormProps) {
  const [brandId, setBrandId] = useState("");
  const [type, setType] = useState("");
  const [productId, setProductId] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  // Fetch all brands
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["allBrandsForAddBrandForm"],
    queryFn: async () => {
      const response = await getBrands({ do_not_paginate: 1 });
      return response.data;
    },
  });
  const brandOptions =
    brandsData?.map((brand) => ({
      value: brand.id.toString(),
      label: brand.name,
    })) || [];

  // Fetch products for selected brand and type
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["productsForBrandType", brandId, type],
    queryFn: async () => {
      if (!brandId || !type) return [];
      if (type === "billing") {
        const res = await getBillingList({
          page_size: 50,
        });
        // Map billing lists to match productOptions structure
        return res.data.map((b) => ({
          id: b.id,
          material_description: b.name,
        }));
      } else {
        const res = await getPricingList({
          page_size: 50,
        });
        // Map pricing lists to match productOptions structure
        return res.data.map((p) => ({
          id: p.id,
          material_description: p.name,
        }));
      }
    },
    enabled: !!brandId && !!type,
  });
  const productOptions =
    productsData?.map((p) => ({
      value: p.id.toString(),
      label: p.material_description,
    })) || [];

  console.log({ productsData });

  const mutation = useAddBrandDistributors({
    mutationConfig: {
      onSuccess: () => {
        setBrandId("");
        setType("");
        setProductId("");
        setIsApproved(false);
        close();
        onSuccess?.();
      },
    },
  });

  function toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/\s+/g, "_")
      .toLowerCase();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      distributorId,
      data: {
        brands: [
          {
            category: toSnakeCase(category),
            brand_id: Number(brandId),
            approved: isApproved,
            proof: [],
            type,
            pricing_id: Number(productId),
          },
        ],
      },
    });
  }

  return (
    <Modal.Root
      opened={opened}
      onClose={close}
      withinPortal={false}
      trapFocus={false}
      className={opened ? "absolute top-0 left-0 h-full w-full" : "hidden"}
    >
      <Modal.Overlay
        bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
        blur={3}
      />
      <Modal.Content className="!items-center min-w-[40%]">
        <Modal.Body>
          <div className="bg-white rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">
              Add Brand
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Select
                value={brandId}
                onChange={(val) => {
                  setBrandId(val || "");
                  setProductId("");
                }}
                data={brandOptions}
                label="Brand"
                placeholder={isLoadingBrands ? "Loading..." : "Select brand"}
                classNames={selectStyles}
                required
                searchable
                disabled={isLoadingBrands}
              />
              <Select
                value={type}
                onChange={(val) => {
                  setType(val || "");
                  setProductId("");
                }}
                data={coefficientOptions}
                label="Type"
                placeholder="Select type"
                classNames={selectStyles}
                required
              />
              <Select
                value={productId}
                onChange={(val) => setProductId(val || "")}
                data={productOptions}
                label="Product"
                placeholder={
                  isLoadingProducts ? "Loading..." : "Select product"
                }
                classNames={selectStyles}
                required
                searchable
                disabled={!brandId || !type || isLoadingProducts}
              />
              <Checkbox
                checked={isApproved}
                onChange={(e) => setIsApproved(e.currentTarget.checked)}
                label="Approved"
              />
              <Group justify="flex-end" mt="xl" gap={10}>
                <Button
                  variant="outline"
                  className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  leftSection={<ExitIcon />}
                  onClick={close}
                  disabled={mutation.isPending}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 transition-all ease-in-out duration-300"
                  loading={mutation.isPending}
                  type="submit"
                  disabled={!brandId || !type || !productId}
                >
                  Add
                </Button>
              </Group>
            </form>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
