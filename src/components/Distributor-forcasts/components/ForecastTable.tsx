import { NumberInput, Table } from "@mantine/core";
import { ForecastData, ForecastDetailsData, Product, ForecastSubmitInput } from "@/types";
import clsx from "clsx";
import { UseFormReturnType } from "@mantine/form";

interface ForecastTableProps {
  offeringForecasts: ForecastData[];
  data: ForecastDetailsData;
  form: UseFormReturnType<{ forecast: ForecastSubmitInput[] }>;
  forecastsByOffering: Record<string, ForecastData[]>;
  offeringId: string;
}

export const ForecastTable = ({ 
  offeringForecasts, 
  data, 
  form, 
  forecastsByOffering, 
  offeringId 
}: ForecastTableProps) => (
  <div className="relative border border-primary rounded-xl border-t-0">
    <Table.ScrollContainer minWidth={768}>
      <Table
        verticalSpacing="sm"
        borderColor="transparent"
        striped="even"
        stripedColor="#F2F4F6"
      >
        <Table.Thead>
          <Table.Tr className="bg-primary text-white">
            <Table.Th className="rounded-ss-xl">Brand</Table.Th>
            <Table.Th>Brand Pillar</Table.Th>
            <Table.Th>SKU</Table.Th>
            <Table.Th>Cost</Table.Th>
            <Table.Th>Monthly Totals</Table.Th>
            {offeringForecasts.length > 0 && Object.keys(offeringForecasts[0].items).map((date) => (
              <Table.Th key={date}>{date}</Table.Th>
            ))}
            <Table.Th className="rounded-se-xl">Sub Total</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {offeringForecasts.map((element, index) => {
            const globalIndex = Object.values(forecastsByOffering)
              .slice(0, Object.keys(forecastsByOffering).indexOf(offeringId))
              .reduce((acc, curr) => acc + curr.length, 0) + index;
            
            return (
              <Table.Tr key={index}>
                <Table.Td className="first:rounded-es-xl">
                  {element.product.brand.name}
                </Table.Td>
                <Table.Td>{(data?.product as Product)?.brand_pillar?.name || ''}</Table.Td>
                <Table.Td>{element.product.sku}</Table.Td>
                <Table.Td>{element.cost}</Table.Td>
                <Table.Td>{element.monthly_total}</Table.Td>
                {Object.keys(element.items).map((item, idx) => {
                  return (
                  <Table.Td key={`${index}-${idx}`}>
                    <NumberInput
                      {...form.getInputProps(
                        `forecast.${globalIndex}.items.${idx}.value`
                      )}
                      size="xs"
                      classNames={{
                        input: clsx("!w-[80px]", {
                          "!bg-red-400/40 border-none":
                            element.items[item].value &&
                            element.items[item].is_closed,
                          "!bg-lime-300/40 border-none":
                            element.items[item].value &&
                            !element.items[item].is_closed,
                          "!bg-primary/40 border-2 border-primary":
                            element.items[item].value === 0,
                        }),
                      }}
                      hideControls
                      allowDecimal={false}
                      allowNegative={false}
                      required
                      disabled={element.items[item].is_closed}
                    />
                  </Table.Td>
                )
              })}
                <Table.Td className="last:rounded-ee-xl !pr-2">
                  {element.sub_total}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  </div>
); 