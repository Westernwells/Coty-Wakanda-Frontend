import {
  bindProductInput,
  useUpdateProductBinding,
} from "@/api/bindProducts/update-binding";
import { getProducts } from "@/api/products/get-products";
import { BindingFilters, Product, ProductBindingPricing } from "@/types";
import { Button, Group, Modal, NumberInput, Select } from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import ExitIcon from "../Icons/ExitIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { FormValues } from "./AddDistributorForm";
import FilterBindings from "./FilterBindings";

function ProductBindingForm({
  opened,
  close,
  data,
  distributorId,
  form,
}: {
  opened: boolean;
  close: () => void;
  data?: ProductBindingPricing | null;
  distributorId?: number;
  form?: UseFormReturnType<FormValues>;
}) {
  const [filter, setFilter] = useState<BindingFilters>({
    brand_id: "",
    sub_brand_id: "",
    brand_type: "",
    pref: "",
    grouping: "",
    product_type: "",
  });

  const [{ data: productsData }] = useQueries({
    queries: [
      {
        queryKey: ["products", filter],
        queryFn: () => getProducts({ page_size: 200000, filter: filter }),
      },
    ],
  });
  const updateProductBinding = useUpdateProductBinding({});

  const productForm = useForm<
    bindProductInput & { product_id: number | string }
  >({});

  useEffect(() => {
    if (data) {
      productForm.setValues({
        ...data,
        product_id: data.product_id?.toString(),
      });
    }
  }, [data]);

  const handleSubmit = (
    values: bindProductInput & { product_id: string | number }
  ) => {
    const { product_id, ...data } = values;
    if (!distributorId) {
      form?.insertListItem("products", data);
      close();
      return;
    }
    updateProductBinding.mutate({
      data: values,
      distributorId: distributorId || 0,
      productId: product_id,
    });
    close();
  };
  return (
    <div>
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
        <Modal.Content className="!items-center min-w-[70%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h2 className="text-xl font-semibold mb-6 text-primary">
                Bind Product
              </h2>
              <div className="space-y-6">
                <FilterBindings setFilters={setFilter} />
                {!productsData?.data?.length && (
                  <p>
                    No Product Matches These Filters Please try changing them
                  </p>
                )}
                <Select
                  {...productForm.getInputProps("product_id")}
                  disabled={!productsData?.data?.length}
                  defaultValue={data?.product_id?.toString()}
                  label="Product"
                  placeholder="Select product"
                  data={
                    productsData?.data?.map((product: Product) => ({
                      value: product?.id.toString(),
                      label: product?.id.toString(),
                    })) || []
                  }
                  rightSection={<ChevronDownIcon />}
                  classNames={selectStyles}
                  clearable
                  searchable
                />

                <NumberInput
                  {...productForm.getInputProps("icp_eur")}
                  label="ICP EUR"
                  classNames={textInputStyles}
                  hideControls
                  allowDecimal={false}
                  allowNegative={false}
                />
                <NumberInput
                  {...productForm.getInputProps("icp_usd")}
                  label="ICP USD"
                  classNames={textInputStyles}
                  hideControls
                  allowDecimal={false}
                  allowNegative={false}
                />
                <NumberInput
                  {...productForm.getInputProps("french_eur")}
                  label="French EUR"
                  classNames={textInputStyles}
                  hideControls
                  allowDecimal={false}
                  allowNegative={false}
                />
                <NumberInput
                  {...productForm.getInputProps("french_usd")}
                  label="French USD"
                  classNames={textInputStyles}
                  hideControls
                  allowDecimal={false}
                  allowNegative={false}
                />
                <NumberInput
                  {...productForm.getInputProps("rrsp")}
                  label="RRSP"
                  classNames={textInputStyles}
                  hideControls
                  allowDecimal={false}
                  allowNegative={false}
                />
                <NumberInput
                  {...productForm.getInputProps("regional_billing_price")}
                  label="Regional Billing Price"
                  classNames={textInputStyles}
                  hideControls
                  allowDecimal={false}
                  allowNegative={false}
                />
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                    onClick={close}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftSection={<RefreshIcon />}
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    disabled={updateProductBinding.isPending}
                    loading={updateProductBinding.isPending}
                    onClick={() => {
                      const data = productForm.getValues();
                      handleSubmit(data);
                    }}
                  >
                    {data ? "Update" : "Add"}
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}

export default ProductBindingForm;
