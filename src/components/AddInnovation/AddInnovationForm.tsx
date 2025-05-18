import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { useAddInnovation } from "@/api/innovations/add-innovation";
import { queryClient } from "@/main";
import { Product } from "@/types";
import { Button, Grid, Group, Select, TextInput } from "@mantine/core";
import { DateInput, YearPickerInput } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { FormField } from "../Shared/Form/Field";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { InnovationProductsTable } from "./InnovationProductsTable";
import { getProducts } from "@/api/products/get-products";
import { useInnovationBulkEdit } from "./useInnovationBulkEdit";
import { useState, useRef } from "react";
import { PriceBenchmarkModal } from "../AddProduct/PriceBenchmarkModal";

const AddInnovationForm = ({
  setOfferingOpen,
  form,
}: {
  setOfferingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  form: UseFormReturnType<{
    brand_id: string;
    sub_brand_id: string;
    year: Date;
    format: string;
    launch_name: string;
    other_name: string;
    document: string;
    forecast_deadline: Date;
    offerings?: {
      number: string;
      icw: Date;
      ocd: Date;
      type: string;
      deck: string;
      market_deck: string;
      products: Array<
        Partial<Product> & {
          currency: string;
        }
      >;
    }[];
  }>;
}) => {
  const [{ data: brandsData }, { data: brandPillarsData }] = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: () => getBrands() },
      {
        queryKey: ["brandPillars"],
        queryFn: () =>
          getBrandPillars({ filter: { brand_id: form.getValues().brand_id } }),
        enabled: !!form.getValues().brand_id,
      },
    ],
  });
  const navigate = useNavigate();

  const addInnovationMutation = useAddInnovation({ mutationConfig: {} });

  // Fetch products from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", {}],
    queryFn: () =>
      getProducts({
        cursor: 1,
        page_size: 20,
        filter: {
          search: "",
          region_id: "",
          market_id: "",
          brand_id: "",
          sub_brand_id: "",
          distributor_id: "",
          division: "",
        },
      }),
  });

  const [isEdit, setIsEdit] = useState(false);
  const tableRef = useRef<{
    getChangedProducts: () => { products: Partial<Product>[] };
  }>(null);

  const {
    mutate: bulkEdit,
    isPending: isBulkEditing,
    isSuccess: isBulkEditSuccess,
    isError: isBulkEditError,
  } = useInnovationBulkEdit({
    onSuccess: () => setIsEdit(false),
  });

  const [isBenchmarkModalOpen, setBenchmarkModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  form.watch("brand_id", () => {
    queryClient.invalidateQueries({
      queryKey: ["brandPillars"],
      exact: false,
      refetchType: "all",
    });
    form.setFieldValue("sub_brand_id", "");
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (Object.keys(form.validate().errors).length === 0) {
          form.validate();
          const { year, forecast_deadline, offerings, ...toSubmit } = values;
          addInnovationMutation.mutate(
            {
              data: {
                ...toSubmit,
                forecast_deadline: forecast_deadline
                  .toISOString()
                  .split("T")[0],
                year: year?.getFullYear().toString(),
                offerings: offerings?.map((offering) => {
                  return {
                    ...offering,
                    icw: offering.icw.toISOString().split("T")[0],
                    ocd: offering.ocd.toISOString().split("T")[0],
                  };
                }),
              },
            },
            {
              onSuccess: () => navigate({ to: "/innovations" }),
            }
          );
        }
      })}
    >
      <DateInput
        {...form.getInputProps("forecast_deadline")}
        label="Forecast deadline"
        valueFormat="YYYY MMM DD"
        placeholder="Select date"
        className="sm:max-w-[50%]"
        classNames={textInputStyles}
      />
      <FormSection title="General Details">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("brand_id")}
              placeholder="Select brand"
              data={
                brandsData?.data?.map((brand) => ({
                  value: brand.id.toString(),
                  label: brand.name,
                })) || []
              }
              rightSection={<ChevronDownIcon />}
              classNames={selectStyles}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("sub_brand_id")}
              placeholder="Select brand Pillar"
              disabled={
                form.getValues().brand_id === "" ||
                brandPillarsData?.data.length === 0
              }
              data={
                brandPillarsData?.data?.map((pillar) => ({
                  value: pillar.id.toString(),
                  label: pillar.name,
                })) || []
              }
              rightSection={<ChevronDownIcon />}
              classNames={selectStyles}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <YearPickerInput
              {...form.getInputProps("year")}
              placeholder="Pick Year"
              valueFormat="YYYY"
              classNames={selectStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <Select
              {...form.getInputProps("format")}
              placeholder="Select Format"
              data={[
                { label: "format", value: "format1" },
                { label: "unformat", value: "format2" },
              ]}
              rightSection={<ChevronDownIcon />}
              classNames={selectStyles}
              clearable
              searchable
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Custom Details">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("launch_ref")}
              label="Launch ref"
              placeholder="000000"
              classNames={textInputStyles}
              disabled
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("launch_id")}
              label="Launch ID"
              placeholder="Brand-SubBrand-Year-Format-LaunchName"
              classNames={textInputStyles}
              disabled
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("launch_name")}
              label="Launch Name"
              placeholder="Enter Name"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col
            span={{
              sm: 6,
              base: 12,
            }}
          >
            <TextInput
              {...form.getInputProps("other_name")}
              label="Other reference names"
              placeholder="Enter reference name"
              classNames={textInputStyles}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            {isLoading ? (
              <div className="p-6 bg-white rounded-lg flex justify-center">
                <span>Loading products...</span>
              </div>
            ) : error ? (
              <div className="p-6 bg-white rounded-lg text-red-500">
                Error loading products. Please try again later.
              </div>
            ) : (
              <>
                <InnovationProductsTable
                  ref={tableRef}
                  products={data?.data ?? []}
                  isEdit={isEdit}
                  setIsEdit={setIsEdit}
                  onBulkSave={(changed) => {
                    bulkEdit({ data: changed });
                  }}
                  onOpenBenchmarkModal={(product: Product) => {
                    setSelectedProduct(product);
                    setBenchmarkModalOpen(true);
                  }}
                />
                {isBulkEditing && (
                  <div className="text-blue-600 text-sm mt-2">
                    Saving changes...
                  </div>
                )}
                {isBulkEditError && (
                  <div className="text-red-500 text-sm mt-2">
                    {"Failed to update products."}
                  </div>
                )}
                {isBulkEditSuccess && (
                  <div className="text-green-600 text-sm mt-2">
                    Products updated successfully!
                  </div>
                )}
              </>
            )}
          </Grid.Col>
          <Grid.Col
            span={{
              lg: 6,
              base: 12,
            }}
          >
            <FormField label="Add new offering">
              <Button
                variant="outline"
                className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                leftSection={<PlusIcon size={24} />}
                onClick={() => {
                  if (form.getValues().offerings?.length) {
                    form.insertListItem("offerings", {
                      number: "",
                      icw: new Date(),
                      ocd: new Date(),
                      type: "",
                      deck: "",
                      market_deck: "",
                      products: [],
                    });
                  } else {
                    form.setFieldValue("offerings", [
                      {
                        number: "",
                        icw: new Date(),
                        ocd: new Date(),
                        type: "",
                        deck: "",
                        market_deck: "",
                        products: [],
                      },
                    ]);
                  }
                  setOfferingOpen(true);
                }}
              >
                Add Offering
              </Button>
            </FormField>
          </Grid.Col>
          <Grid.Col
            span={{
              lg: 6,
              base: 12,
            }}
          >
            <FileUploadSection
              form={form}
              id="offering_file"
              multiple={true}
              accept="application/vnd.ms-excel, text/csv"
            />
          </Grid.Col>
        </Grid>
      </FormSection>
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
      {selectedProduct && (
        <PriceBenchmarkModal
          opened={isBenchmarkModalOpen}
          onClose={() => setBenchmarkModalOpen(false)}
          onSave={() => setBenchmarkModalOpen(false)}
          form={{}}
          brandsData={
            (brandsData?.data ?? []).map((brand) => ({
              id: brand.id,
              brand_type_id: brand.brand_type_id ?? 0,
              name: brand.name,
              active: brand.active ?? true,
              type: "Mass",
              created_at: brand.created_at ?? "",
              updated_at: brand.updated_at ?? "",
              deleted_at: brand.deleted_at ?? null,
              pivot: { distributor_id: 0, brand_id: brand.id },
            })) as import("@/types").Brand[]
          }
          productsListData={data?.data ?? []}
          categoriesData={[]}
        />
      )}
    </form>
  );
};

export default AddInnovationForm;
