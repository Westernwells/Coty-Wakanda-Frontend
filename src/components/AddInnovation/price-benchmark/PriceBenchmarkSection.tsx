import { Grid, Select, NumberInput, TextInput } from "@mantine/core";
import { useMemo } from "react";
import { Brand, Product, Category, PriceBenchmark } from "@/types";
import ChevronDownIcon from "../../Icons/ChevronDownIcon";
import {
  selectStyles,
  textAreaStyles,
  textInputStyles,
} from "../../Shared/Styles";

interface ExtendedCategory extends Category {
  type: "luxury" | "consumer_beauty";
}

interface ExtendedBrand extends Brand {
  group: string;
  name: string;
  is_approved?: boolean;
}

interface ExtendedProduct extends Omit<Product, "material_description"> {
  brand_id: number;
  material_description?: string;
}

interface PriceBenchmarkSectionProps {
  value: PriceBenchmark | null;
  onChange: (val: PriceBenchmark) => void;
  brandsData: { data: ExtendedBrand[] };
  productsListData: { data: ExtendedProduct[] };
  categoriesData: { data: ExtendedCategory[] };
}

export function PriceBenchmarkSection({
  value,
  onChange,
  brandsData,
  productsListData,
  categoriesData,
}: PriceBenchmarkSectionProps) {
  // Controlled value logic
  function handleFieldChange<K extends keyof PriceBenchmark>(
    key: K,
    val: PriceBenchmark[K]
  ) {
    onChange({ ...value, [key]: val } as PriceBenchmark);
  }

  // Filter and group brands based on selected category with duplicate removal
  const groupedBrands = useMemo(() => {
    if (!categoriesData?.data || !brandsData?.data) return [];
    const seenBrandIds = new Set<string>();
    return brandsData.data
      .reduce(
        (
          acc: { value: string; label: string; disabled?: boolean }[],
          brand
        ) => {
          const brandIdString = brand.id.toString();
          if (seenBrandIds.has(brandIdString)) return acc;
          seenBrandIds.add(brandIdString);
          const isApproved = brand.is_approved;
          const groupLabel = brand.group === "other" ? "Other" : brand.group;
          acc.push({
            value: brandIdString,
            label: `[${groupLabel}] ${brand.name}${!isApproved ? " (Not Approved)" : ""}`,
            disabled: !isApproved,
          });
          return acc;
        },
        []
      )
      .sort((a, b) => {
        const aIsOther = a.label.startsWith("[Other]");
        const bIsOther = b.label.startsWith("[Other]");
        if (aIsOther && !bIsOther) return -1;
        if (!aIsOther && bIsOther) return 1;
        return a.label.localeCompare(b.label);
      });
  }, [categoriesData?.data, brandsData?.data]);

  // Filter products based on selected brand with duplicate removal
  const filteredProducts = useMemo(() => {
    const selectedBrandId = value?.brand_id?.toString();
    if (!selectedBrandId || !productsListData?.data) return [];
    const seenProductIds = new Set<string>();
    return productsListData.data
      .filter((product) => product.brand_id.toString() === selectedBrandId)
      .reduce((acc: { value: string; label: string }[], product) => {
        const productIdString = product.id.toString();
        if (seenProductIds.has(productIdString)) return acc;
        seenProductIds.add(productIdString);
        acc.push({
          value: productIdString,
          label: product.material_description || productIdString,
        });
        return acc;
      }, []);
  }, [value?.brand_id, productsListData?.data]);

  // Get unique categories with duplicate removal
  const uniqueCategories = useMemo(() => {
    if (!categoriesData?.data) return [];
    const seenCategoryIds = new Set<string>();
    return categoriesData.data.reduce(
      (acc: { value: string; label: string }[], category) => {
        const categoryIdString = category.id.toString();
        if (seenCategoryIds.has(categoryIdString)) return acc;
        seenCategoryIds.add(categoryIdString);
        acc.push({ value: categoryIdString, label: category.name });
        return acc;
      },
      []
    );
  }, [categoriesData?.data]);

  return (
    <Grid gutter={{ sm: 32, base: 16 }}>
      {/* <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          label="Account Category"
          placeholder="Select Account Category"
          data={uniqueCategories}
          classNames={selectStyles}
          value={value?.category_id?.toString() || ""}
          onChange={(val) => handleFieldChange("category_id", val || "")}
        />
      </Grid.Col> */}
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          label="Brand"
          placeholder="Select Brand"
          data={groupedBrands}
          clearable
          classNames={selectStyles}
          rightSection={<ChevronDownIcon />}
          value={value?.brand_id?.toString() || ""}
          onChange={(val) => handleFieldChange("brand_id", val || "")}
          // disabled={!value?.category_id}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          label="Product"
          placeholder="Select Product"
          data={filteredProducts}
          clearable
          classNames={selectStyles}
          rightSection={<ChevronDownIcon />}
          value={value?.product_id?.toString() || ""}
          onChange={(val) => handleFieldChange("product_id", val || "")}
          disabled={!value?.brand_id}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <NumberInput
          label="Index value"
          classNames={textInputStyles}
          allowDecimal={false}
          allowNegative={false}
          hideControls
          value={value?.index_value ? Number(value.index_value) : undefined}
          onChange={(val) => handleFieldChange("index_value", val || 0)}
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <TextInput
          label="Add a comment"
          placeholder="HB BOT PM 24 EDP 50ml PREM IV"
          classNames={textAreaStyles}
          value={value?.comment || ""}
          onChange={(e) => handleFieldChange("comment", e.currentTarget.value)}
        />
      </Grid.Col>
    </Grid>
  );
}
