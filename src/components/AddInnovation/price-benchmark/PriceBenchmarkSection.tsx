import useBrandAndProductData from "@/lib/hooks/useBrandAndProductData";
import { PriceBenchmark } from "@/types";
import { Product as InnovationProduct } from "@/types/InnovationOfferProduct";
import { Grid, NumberInput, Select, TextInput } from "@mantine/core";
import ChevronDownIcon from "../../Icons/ChevronDownIcon";
import {
  selectStyles,
  textAreaStyles,
  textInputStyles,
} from "../../Shared/Styles";
interface PriceBenchmarkSectionProps {
  value: PriceBenchmark | null;
  onChange: (val: PriceBenchmark) => void;
  productsListData: { data: InnovationProduct[] };
  brandOptions?: Array<{ value: string; label: string }>;
}

export function PriceBenchmarkSection({
  value,
  onChange,
  productsListData,
  brandOptions = [],
}: PriceBenchmarkSectionProps) {
  // Controlled value logic
  function handleFieldChange<K extends keyof PriceBenchmark>(
    key: K,
    val: PriceBenchmark[K]
  ) {
    onChange({ ...value, [key]: val } as PriceBenchmark);
  }

  const selectedBrandId = value?.brand_id?.toString();
  const { brands: bx, filteredProducts } = useBrandAndProductData(productsListData?.data ?? [], selectedBrandId ? parseInt(selectedBrandId) : null);
  const brands = brandOptions;

  return (
    <Grid gutter={{ sm: 32, base: 16 }}>
      <Grid.Col span={{ sm: 6, base: 12 }}>
        <Select
          label="Brand"
          placeholder="Select Brand"
          data={brands}
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
