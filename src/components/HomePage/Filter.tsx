import { getDistributors } from "@/api/distributors/get-distributors";
import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { getRegions } from "@/api/get-regions";
import { getMarkets } from "@/api/listManagement/markets/get-markets";
import { Filters } from "@/types";
import {
  CloseButton,
  Divider,
  Group,
  TextInput,
  Title,
  Checkbox,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import SearchIcon from "../Icons/SearchIcon";
import ExitIcon from "../Icons/ExitIcon";
import { CustomSelect } from "./CustomSelect";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const distributorKeys = ["search", "region_id", "market_id"] as const;
const productKeys = [
  "brand_id",
  "sub_brand_id",
  "distributor_id",
  "search",
  "division",
  "brand_type",
] as const;
const Filter = ({
  setFilters,
  isProductsPage = false,
  filters
}: {
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  isProductsPage?: boolean;
  filters?: Filters;
}) => {
  // const isDistributor = useUserStore((state) => state.user?.role === "admin");
  // Transform data for select components
  const form =  useForm<Filters> ({
    initialValues: !isProductsPage ? {
      search: filters?.search || "",
      region_id: filters?.region_id || "",
      market_id: filters?.market_id || "",
    } : {      search: filters?.search || "",
      brand_id: filters?.brand_id || "",
      sub_brand_id: filters?.sub_brand_id || "",
      distributor_id: filters?.distributor_id || "",
      division: filters?.division || "",
      brand_type: filters?.brand_type || "all", // default to "all"
      is_innovation_product: filters?.is_innovation_product ||   false, },

    onValuesChange: (values) => {
      setFilters(values);
    },
  });

   // compute “any value?” based on those keys only
   const hasAnyValue = useMemo(() => {
     const keysToCheck = isProductsPage ? [...productKeys, ...(form.values.is_innovation_product === true ? ["is_innovation_product"] : [])] : distributorKeys;
     return keysToCheck.some((key) => {
       const v = form.values[key as keyof Filters];
       if (typeof v === "string") return v.trim() !== "";
       if (typeof v === "boolean") return v === true;
       if (Array.isArray(v)) return v.length > 0;
       // covers number | null | undefined | object
       return v != null;
     });
   }, [form.values, isProductsPage]);

  const [
    { data: marketsData, error: marketsError },
    { data: regionsData, error: regionsError },
    { data: brandsData, error: brandsError },
    { data: brandPillarsData, error: brandPillarsError },
    { data: distributorsData, error: distributorsError },
  ] = useQueries({
    queries: [
      {
        queryKey: ["markets"],
        queryFn: () => getMarkets({ page_size: 99999 }),
      },
      { queryKey: ["regions"], queryFn: getRegions },
      { queryKey: ["brands"], queryFn: () => getBrands() },
      { queryKey: ["brandPillars"], queryFn: () => getBrandPillars() },
      {
        queryKey: ["distributors"],
        queryFn: () => getDistributors({ page_size: 100 }),
      },
    ],
  });

  const marketOptions =
    marketsData?.data?.map((market) => ({
      value: market.id.toString(),
      label: market.name,
    })) || [];

  const regionOptions =
    regionsData?.data?.map((region) => ({
      value: region.id.toString(),
      label: region.name,
    })) || [];

  const brandOptions =
    brandsData?.data?.map((brand) => ({
      value: brand.id.toString(),
      label: brand.name,
    })) || [];
  const brandPillarOptions =
    brandPillarsData?.data?.map((pillar) => ({
      value: pillar.id.toString(),
      label: pillar.name,
    })) || [];
  const distributorOptions =
    distributorsData?.data?.map((dist: { id: number; name: string }) => ({
      value: dist.id.toString(),
      label: dist.name,
    })) || [];

  const hasError =
    marketsError ||
    regionsError ||
    brandsError ||
    brandPillarsError ||
    distributorsError;

  if (hasError) {
    return (
      <div className="bg-white w-full rounded-[20px] p-6 mt-5">
        <div className="text-red-500">
          Error loading filter data. Please try again later.
        </div>
      </div>
    );
  }

  // Checkbox logic: only one can be checked at a time, but styled as checkboxes
  function handleBrandTypeChange(type: string) {
    form.setFieldValue("brand_type", type);
    setFilters({ ...form.values, brand_type: type });
  }
  function handleInnovationChange(value: boolean) {
    form.setFieldValue("is_innovation_product", value);
    setFilters({ ...form.values, is_innovation_product: value === true ? true : undefined });
  }


  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleInnovationChange(event.target.checked);
  };

  // Calculate grid columns based on select count
  const selectCount = isProductsPage ? 3 : 2;
  const gridColsClass =
    selectCount === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 px-4";

  return (
    <div className="bg-white w-full rounded-[20px] p-6 mt-5">
      <Group justify="space-between" align="center">
        <Title order={2} className="text-primary font-semibold text-xl">
          Refine your results
        </Title>
        <Button
          rightSection={<ExitIcon />}
          onClick={() => {
            if(isProductsPage){
              setFilters({
                search: "",
                brand_id: "",
                sub_brand_id: "",
                distributor_id: "",
                division: "",
                brand_type: "all",
                is_innovation_product: false,
              });
              form.reset();
              form.setFieldValue("search", "");
              form.setFieldValue("brand_id", null);
              form.setFieldValue("sub_brand_id", null);
              form.setFieldValue("distributor_id", null);
              form.setFieldValue("division", null);
              form.setFieldValue("brand_type", "all");
              form.setFieldValue("is_innovation_product", false);
            }else{
              setFilters({
                search: "",
                region_id: "",
                market_id: "",
              });
              form.reset();
              form.setFieldValue("search", "");
              form.setFieldValue("market_id", null);
              form.setFieldValue("region_id", null);
            }
       
            
          }}
          variant="outline"
          className={twMerge("border-primary  border-s-e rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300",!hasAnyValue && "hidden")}
        >
          Clear filters
        </Button>
      </Group>

      <div className="flex items-center gap-x-5 mt-6">
        <TextInput
          {...form.getInputProps("search")}
          aria-label="Search"
          placeholder="Search for..."
          className="flex-grow"
          leftSection={<SearchIcon />}
        />
        <button
          type="button"
          className={twMerge(
            "flex items-center gap-x-2 cursor-pointer group",
            !form?.getValues()?.search?.length && "invisible"
          )}
          onClick={() => {
            form.setFieldValue("search", "");
          }}
        >
          <CloseButton className="group-hover:text-[#00EBB2] transition-all ease-in-out duration-300" />
          <span className="hidden sm:inline text-nowrap text-primary font-medium group-hover:text-[#00EBB2] transition-all ease-in-out duration-300">
            Clear all
          </span>
        </button>
      </div>
      <Divider className="my-4 sm:my-6 border-primary border-opacity-50" />
      <div className={cn("grid grid-cols-1", gridColsClass, "gap-4 w-full")}>
        {isProductsPage  ? (
          <>
            <CustomSelect
              value={form.values?.brand_id  ?? ""}
              options={brandOptions}
              onChange={(val) => form.setFieldValue("brand_id", val)}
              placeholder="Filter brands"
              className="min-w-max max-w-lg w-full"
              noBorder
            />
            <CustomSelect
              value={form.values?.sub_brand_id ?? ""}
              options={brandPillarOptions}
              onChange={(val) => form.setFieldValue("sub_brand_id", val)}
              placeholder="Filter brand pillars"
              className="min-w-max max-w-lg w-full"
              noBorder
            />
            <CustomSelect
              value={form.values?.distributor_id ?? ""}
              options={distributorOptions}
              onChange={(val) => form.setFieldValue("distributor_id", val)}
              placeholder="Filter distributors"
              className="min-w-max max-w-lg w-full"
              noBorder
            />
          </>
        ) :   (
          <>
            <CustomSelect
              value={form.values?.region_id ?? ""}
              options={regionOptions}
              onChange={(val) => form.setFieldValue("region_id", val)}
              placeholder="Filter by region"
              className="min-w-max max-w-2xl w-full "
              noBorder
            />
            <CustomSelect
              value={form.values?.market_id ?? ""}
              options={marketOptions}
              onChange={(val) => form.setFieldValue("market_id", val)}
              placeholder="Filter by market"
              className="min-w-max max-w-2xl w-full"
              noBorder
            />
          </>
        ) 
      }
      </div>
      {isProductsPage && (filters && "brand_id" in filters) && (
        <Group gap={24} w="100%" className="mt-6">
          <div className="flex items-center gap-6 mt-4">
            <Checkbox
              checked={form.values.brand_type === "all"}
              onChange={() => handleBrandTypeChange("all")}
              label={<span className="text-primary text-sm">All</span>}
              className="min-w-[80px] "
              classNames={{
                input: "cursor-pointer",
              }}
            />
            <Checkbox
              checked={form.values.brand_type === "luxury"}
              onChange={() => handleBrandTypeChange("luxury")}
              label={<span className="text-primary text-sm">Luxury only</span>}
              className="min-w-[120px] "
              classNames={{
                input: "cursor-pointer",
              }}
            />
            <Checkbox
              checked={form.values.brand_type === "mass"}
              onChange={() => handleBrandTypeChange("mass")}
              label={<span className="text-primary text-sm">Mass only</span>}
              className="min-w-[120px] "
              classNames={{
                input: "cursor-pointer",
              }}
            />
            <Checkbox
              checked={
                 form.values.is_innovation_product === true
              }
              onChange={handleCheckboxChange}
              label={<span className="text-primary text-sm">Innovation</span>}
              className="min-w-[120px] "
              classNames={{
                input: "cursor-pointer",
              }}
              name="is_innovation_product"
            />
          </div>
        </Group>
      )}
    </div>
  );
};

export default Filter;
