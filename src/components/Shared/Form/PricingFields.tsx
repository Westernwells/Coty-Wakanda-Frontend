import { Grid, Select, TextInput } from "@mantine/core";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import { UseFormReturnType } from "@mantine/form";
import { getCurrencies } from "@/api/get-currencies";
import { useQueries } from "@tanstack/react-query";
import { ProductDistributor, ProductInput } from "@/types";
// import { useEffect } from "react";

interface PricingFieldsProps {
  form:  UseFormReturnType<Partial<ProductInput>, (values: Partial<ProductInput>) => Partial<ProductInput>>;
  prefix?: string;
  coefficientsData: ProductDistributor['coefficients'];
  isMirror?: boolean;
  distributorId?: number;
}

export const PricingFields = ({
  form,
  prefix = "",
  coefficientsData,
  isMirror=false,
  distributorId
}: PricingFieldsProps) => {
  const [{ data: currenciesData }] = useQueries({
    queries: [
      { queryKey: ["currencies"], queryFn: getCurrencies },
    ],
  });

  // useEffect(() => {
  //   if(!isMirror) {
  //     console.log(prefix)
  //     form.setFieldValue(prefix, {
  //       distributor_id: distributorId
  //     })
  //   }
  // }, [])

  return (
    <>
      <Grid.Col
        span={{
          sm: 4,
          base: 8,
        }}
      >
        <TextInput hidden className="hidden" value={distributorId} {...form.getInputProps(`${prefix}.distributor_id`)} disabled />
        <Select
          label="Select co-efficient"
          placeholder="Select co-efficient"
          disabled={isMirror}
          {...form.getInputProps(`${prefix}.coefficient_id`)}
          key={form.key(`${prefix}.coefficient_id`)}
          data={
            coefficientsData.map((coeff) => ({
              value: coeff.id.toString(),
              label: coeff.id.toString(),
            })) || []
          }
          clearable
          classNames={{
            label: "text-primary font-medium text-sm mb-1",
          }}
          rightSection={<ChevronDownIcon />}
        />
      </Grid.Col>
      <Grid.Col
        span={{
          sm: 8,
          base: 4,
        }}
      />
      <Grid.Col
        span={{
          sm: 6,
          base: 12,
        }}
      >
        <TextInput
          disabled={isMirror}
          {...form.getInputProps(`${prefix}.preactive_rrsp`)}
          key={form.key(`${prefix}.preactive_rrsp`)}
          label="Pre-active RRSP"
          classNames={{
            label: "text-primary font-medium text-sm mb-1",
          }}
        />
      </Grid.Col>
      <Grid.Col
        span={{
          sm: 6,
          base: 12,
        }}
      >
        <TextInput
          disabled={isMirror}
          {...form.getInputProps(`${prefix}.active_rrsp`)}
          key={form.key(`${prefix}.active_rrsp`)}
          label="Active RRSP"
          classNames={{
            label: "text-primary font-medium text-sm mb-1",
          }}
        />
      </Grid.Col>
      <Grid.Col
        span={{
          sm: 6,
          base: 12,
        }}
      >
        <TextInput
          disabled={isMirror}
          {...form.getInputProps(`${prefix}.billing`)}
          key={form.key(`${prefix}.billing`)}
          label="Billing"
          classNames={{
            label: "text-primary font-medium text-sm mb-1",
          }}
        />
      </Grid.Col>
      <Grid.Col
        span={{
          sm: 6,
          base: 12,
        }}
      >
        <Select
          disabled={isMirror}
          {...form.getInputProps(`${prefix}.currency`)}
          key={form.key(`${prefix}.currency`)}
          label="Currency"
          placeholder="Select Currency"
          data={
            currenciesData?.data?.map((curr) => ({
              value: curr.code,
              label: curr.full_name,
            })) || []
          }
          clearable
          classNames={{
            label: "text-primary font-medium text-sm mb-1",
          }}
          rightSection={<ChevronDownIcon />}
        />
      </Grid.Col>
    </>
  );
};
