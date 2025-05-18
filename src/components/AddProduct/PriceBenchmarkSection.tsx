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

interface PriceBenchmarkSectionProps {
  form: any;
  brandsData: any;
  productsListData: any;
  categoriesData: any;
}

export function PriceBenchmarkSection({
  form,
  brandsData,
  productsListData,
  categoriesData,
}: PriceBenchmarkSectionProps) {
  return (
    <Grid gutter={{ sm: 32, base: 16 }}>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          label="Brand"
          placeholder="Select Brand"
          key={form.key("price_benchmark.brand_id")}
          {...form.getInputProps("price_benchmark.brand_id")}
          data={
            brandsData?.data?.map((brand: Brand) => ({
              value: brand.id.toString(),
              label: brand.name,
            })) || []
          }
          clearable
          classNames={selectStyles}
          rightSection={<ChevronDownIcon />}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          label="Product"
          placeholder="Select Product"
          key={form.key("price_benchmark.product_id")}
          {...form.getInputProps("price_benchmark.product_id")}
          data={
            productsListData?.data?.map((product: Product) => ({
              value: product.id.toString(),
              label: product.id.toString(),
            })) || []
          }
          clearable
          classNames={selectStyles}
          rightSection={<ChevronDownIcon />}
        />
      </Grid.Col>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          {...form.getInputProps("category_id")}
          label="Category"
          placeholder="Select Category"
          data={
            categoriesData?.data?.map((category: Category) => ({
              value: category.id.toString(),
              label: category.name,
            })) || []
          }
          classNames={selectStyles}
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
