import { Grid, Select, NumberInput, TextInput } from "@mantine/core";
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

interface PriceBenchmarkSectionProps {
  form: any;
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
  // Watch for category changes
  useEffect(() => {
    const unsubscribe = form.watch("category_id", () => {
      // Reset brand selection when category changes
      form.setFieldValue("price_benchmark.brand_id", null);
      // Also reset product when brand changes
      form.setFieldValue("price_benchmark.product_id", null);
    });
    return () => unsubscribe();
  }, [form]);

  // Filter and group brands based on selected category
  const groupedBrands = useMemo(() => {
    const selectedCategoryId = form.getValues().category_id;
    if (!selectedCategoryId || !categoriesData?.data || !brandsData?.data)
      return [];

    const selectedCategory = categoriesData.data.find(
      (cat) => cat.id.toString() === selectedCategoryId
    );

    if (!selectedCategory) return [];

    // Group brands into sections
    const groups = brandsData.data.reduce(
      (
        acc: {
          label: string;
          options: { value: string; label: string; disabled?: boolean }[];
        }[],
        brand
      ) => {
        const isApproved = brand.is_approved;
        const groupLabel = brand.group === "other" ? "Other" : brand.group;

        // Find existing group or create new one
        let group = acc.find((g) => g.label === groupLabel);
        if (!group) {
          group = { label: groupLabel, options: [] };
          acc.push(group);
        }

        // Add brand to group
        group.options.push({
          value: brand.id.toString(),
          label: `${brand.name}${!isApproved ? " (Not Approved)" : ""}`,
          disabled: !isApproved,
        });

        return acc;
      },
      []
    );

    // Sort groups to ensure "Other" is first
    return groups.sort((a, b) => {
      if (a.label === "Other") return -1;
      if (b.label === "Other") return 1;
      return a.label.localeCompare(b.label);
    });
  }, [form.getValues().category_id, categoriesData?.data, brandsData?.data]);

  // Filter products based on selected brand
  const filteredProducts = useMemo(() => {
    const selectedBrandId = form.getValues()["price_benchmark.brand_id"];
    if (!selectedBrandId || !productsListData?.data) return [];

    return productsListData.data
      .filter((product) => product.brand_id.toString() === selectedBrandId)
      .map((product) => ({
        value: product.id.toString(),
        label: product.material_description || product.id.toString(),
      }));
  }, [form.getValues()["price_benchmark.brand_id"], productsListData?.data]);

  return (
    <Grid gutter={{ sm: 32, base: 16 }}>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          {...form.getInputProps("category_id")}
          label="Account Category"
          placeholder="Select Account Category"
          data={
            categoriesData?.data?.map((category) => ({
              value: category.id.toString(),
              label: category.name,
            })) || []
          }
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
          disabled={!form.getValues().category_id}
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
          disabled={!form.getValues()["price_benchmark.brand_id"]}
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
