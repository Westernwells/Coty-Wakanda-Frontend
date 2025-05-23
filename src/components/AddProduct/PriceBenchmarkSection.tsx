import { Grid, Select, NumberInput, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import {
  selectStyles,
  textAreaStyles,
  textInputStyles,
} from "../Shared/Styles";
import { Brand } from "@/types";
import { Product } from "@/types";
import { Category } from "@/types";
import { useEffect, useMemo } from "react";

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

interface FormValues {
  category_id?: string;
  price_benchmark?: {
    brand_id?: string;
    product_id?: string;
    index_value?: number;
    comment?: string;
  };
}

interface PriceBenchmarkSectionProps {
  form: UseFormReturnType<FormValues, (values: FormValues) => FormValues>;
  brandsData: {
    data: ExtendedBrand[];
  };
  productsListData: {
    data: ExtendedProduct[];
  };
  categoriesData: {
    data: ExtendedCategory[];
  };
}

export function PriceBenchmarkSection({
  form,
  brandsData,
  productsListData,
  categoriesData,
}: PriceBenchmarkSectionProps) {
  // Watch for category changes using form.values instead of form.watch
  useEffect(() => {
    // Safely reset brand and product selections when category changes
    const currentValues = form.values;
    form.setValues({
      ...currentValues,
      price_benchmark: {
        ...currentValues.price_benchmark,
        brand_id: undefined,
        product_id: undefined,
      },
    });
  }, [form.values.category_id, form]);

  // Filter and group brands based on selected category with duplicate removal
  const groupedBrands = useMemo(() => {
    const selectedCategoryId = form.values.category_id;
    if (!selectedCategoryId || !categoriesData?.data || !brandsData?.data)
      return [];

    const selectedCategory = categoriesData.data.find(
      (cat) => cat.id.toString() === selectedCategoryId
    );

    if (!selectedCategory) return [];

    // Use Set to track seen brand IDs and prevent duplicates
    const seenBrandIds = new Set<string>();

    // Create a flat array for Mantine Select (grouped data not supported with current structure)
    const flatBrands = brandsData.data.reduce(
      (acc: { value: string; label: string; disabled?: boolean }[], brand) => {
        const brandIdString = brand.id.toString();

        // Skip if we've already seen this brand ID
        if (seenBrandIds.has(brandIdString)) {
          return acc;
        }
        seenBrandIds.add(brandIdString);

        const isApproved = brand.is_approved;
        const groupLabel = brand.group === "other" ? "Other" : brand.group;

        // Add brand to flat array with group prefix
        acc.push({
          value: brandIdString,
          label: `[${groupLabel}] ${brand.name}${!isApproved ? " (Not Approved)" : ""}`,
          disabled: !isApproved,
        });

        return acc;
      },
      []
    );

    // Sort brands to ensure "Other" group is first
    return flatBrands.sort((a, b) => {
      const aIsOther = a.label.startsWith("[Other]");
      const bIsOther = b.label.startsWith("[Other]");

      if (aIsOther && !bIsOther) return -1;
      if (!aIsOther && bIsOther) return 1;

      return a.label.localeCompare(b.label);
    });
  }, [form.values.category_id, categoriesData?.data, brandsData?.data]);

  // Filter products based on selected brand with duplicate removal
  const filteredProducts = useMemo(() => {
    const selectedBrandId = form.values.price_benchmark?.brand_id;
    if (!selectedBrandId || !productsListData?.data) return [];

    // Use Set to track seen product IDs and prevent duplicates
    const seenProductIds = new Set<string>();

    return productsListData.data
      .filter((product) => product.brand_id.toString() === selectedBrandId)
      .reduce((acc: { value: string; label: string }[], product) => {
        const productIdString = product.id.toString();

        // Skip if we've already seen this product ID
        if (seenProductIds.has(productIdString)) {
          return acc;
        }
        seenProductIds.add(productIdString);

        acc.push({
          value: productIdString,
          label: product.material_description || productIdString,
        });

        return acc;
      }, []);
  }, [form.values.price_benchmark?.brand_id, productsListData?.data]);

  // Get unique categories with duplicate removal
  const uniqueCategories = useMemo(() => {
    if (!categoriesData?.data) return [];

    // Use Set to track seen category IDs and prevent duplicates
    const seenCategoryIds = new Set<string>();

    return categoriesData.data.reduce(
      (acc: { value: string; label: string }[], category) => {
        const categoryIdString = category.id.toString();

        // Skip if we've already seen this category ID
        if (seenCategoryIds.has(categoryIdString)) {
          return acc;
        }
        seenCategoryIds.add(categoryIdString);

        acc.push({
          value: categoryIdString,
          label: category.name,
        });

        return acc;
      },
      []
    );
  }, [categoriesData?.data]);

  return (
    <Grid gutter={{ sm: 32, base: 16 }}>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          {...form.getInputProps("category_id")}
          label="Account Category"
          placeholder="Select Account Category"
          data={uniqueCategories}
          classNames={selectStyles}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          label="Brand"
          placeholder="Select Brand"
          key={form.key("price_benchmark.brand_id")}
          {...form.getInputProps("price_benchmark.brand_id")}
          data={groupedBrands}
          clearable
          classNames={selectStyles}
          rightSection={<ChevronDownIcon />}
          disabled={!form.values.category_id}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          label="Product"
          placeholder="Select Product"
          key={form.key("price_benchmark.product_id")}
          {...form.getInputProps("price_benchmark.product_id")}
          data={filteredProducts}
          clearable
          classNames={selectStyles}
          rightSection={<ChevronDownIcon />}
          disabled={!form.values.price_benchmark?.brand_id}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <NumberInput
          key={form.key("price_benchmark.index_value")}
          {...form.getInputProps("price_benchmark.index_value")}
          label="Index value"
          classNames={textInputStyles}
          allowDecimal={false}
          allowNegative={false}
          hideControls
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <TextInput
          key={form.key("price_benchmark.comment")}
          {...form.getInputProps("price_benchmark.comment")}
          label="Add a comment"
          placeholder="HB BOT PM 24 EDP 50ml PREM IV"
          classNames={textAreaStyles}
        />
      </Grid.Col>
    </Grid>
  );
}
