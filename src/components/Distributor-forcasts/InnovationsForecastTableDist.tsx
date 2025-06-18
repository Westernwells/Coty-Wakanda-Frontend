import { getForecasts } from "@/api/forecasts/get-forcasts";
import { ForecastData, ForecastDetailsData, ForecastSubmitInput, Meta, Product } from "@/types";
import { Grid, Loader, NumberInput, Select, Table } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { UseFormReturnType, useForm, zodResolver } from "@mantine/form";
import clsx from "clsx";
import { useEffect, useState, forwardRef, useImperativeHandle, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import DateChanger from "../Shared/DateChanger";
import { z } from "zod";

interface InnovationsForecastTableDistProps {
  data: ForecastDetailsData;
}

const forecastSchema = z.object({
  forecast: z.array(
    z.object({
      product_id: z.number(),
      items: z.array(
        z.object({
          month: z.string(),
          value: z.union([z.number(), z.string()]),
        })
      ),
    })
  ),
});

const InnovationsForecastTableDist = forwardRef<
  { submit: () => void; isSubmitting: boolean },
  InnovationsForecastTableDistProps
>(({ data }, ref) => {
  const [sortBy, setSortBy] = useState<string | null>("");
  const [itemsPerPage, setItemsPerPage] = useState("5");
  const [date, setDate] = useState<Date>(new Date());
  const [showDateChanger, setShowDateChanger] = useState(false);
  const [isSales, setIsSales] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transformedForecasts: ForecastData[] = useMemo(() => {
    if (!data || !data.product) {
      console.error("Product data is missing or invalid:", data);
      return [];
    }
    
    const product = data.product as Product;
    
    if (!product?.id) {
      console.error("Product ID is missing or invalid:", product);
      return [];
    }
    
    return [{
      product: {
        id: product.id,
        brand: product.brand,
        sku: product.sku,
        material_description: product.material_description,
        offering_number: product.offering_number
      },
      cost: 0,
      monthly_total: 0,
      sub_total: 0,
      items: data.unit_forecast || {}
    }];
  }, [data]);

  const [forecasts, setForecasts] = useState<ForecastData[]>(transformedForecasts);
  const [meta, setMeta] = useState<Meta>({
    has_next: false,
    cursor: 1,
    page: 1,
    total: 0,
    page_size: 20
  });
  const [hasMore, setHasMore] = useState(false);

  const form = useForm<{ forecast: ForecastSubmitInput[] }>({
    validate: zodResolver(forecastSchema),
    initialValues: {
      forecast: [],
    },
  });

  useImperativeHandle(ref, () => ({
    submit: () => {
      const validation = form.validate();
      if (Object.keys(validation.errors).length > 0) {
        return null;
      }
      return form.values;
    },
    isSubmitting,
  }));

  useEffect(() => {
    if (transformedForecasts.length > 0) {
      const transformedData = transformedForecasts.map((item) => {
        return {
          product_id: item.product.id,
          items: Object.entries(item.items).map(([month, item]) => ({
            month,
            value: item.value,
          })),
        };
      });
      
      // Log only once when data is loaded
      if (transformedData.length > 0) {
        console.log("Initial forecast data loaded with product_id:", transformedData[0].product_id);
      }
      
      form.setValues({ forecast: [...transformedData] });
    }
  }, [transformedForecasts]);

  useEffect(() => {
    setForecasts(transformedForecasts);
  }, [transformedForecasts]);

  const fetchMoreForecasts = async () => {
    if (!meta?.has_next) return;
    try {
      const response = await getForecasts({
        cursor: meta.cursor,
        page_size: 20,
      });
      setForecasts((prev) => [...prev, ...response.data.forecast]);
      response.data.forecast.map((item) => {
        const transformedData = {
          product_id: item.product.id,
          items: Object.entries(item.items).map(([month, item]) => ({
            month,
            value: item.value,
          })),
        };
        form.insertListItem("forecast", transformedData);
      });
      setMeta(response.meta);
      setHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more forecasts:", error);
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (forecasts.length !== 0) {
      const newDate = new Date(`1 ${Object.keys(forecasts[0].items)[0]}`);
      setDate(newDate);
    }
  }, [forecasts]);

  return (
    <form>
      <div className="bg-white shadow-md rounded-lg p-6 mt-5">
        <Grid justify="space-between" className="mb-4">
          <Grid.Col
            span={{
              base: 12,
              md: 8,
              lg: 9,
            }}
            className="flex gap-4"
          >
            <DateInput
              aria-label="Start Date"
              placeholder="Start Date"
              clearable
              variant="filled"
              className="grow"
              rightSection={<DateIcon />}
            />
            <DateInput
              aria-label="End Date"
              placeholder="End Date"
              clearable
              variant="filled"
              className="grow"
              rightSection={<DateIcon />}
            />
            <Select
              aria-label="Sort by"
              placeholder="Sort by"
              data={[
                { value: "product.brand.name", label: "Brand" },
                { value: "product.offering_number", label: "Offering Number" },
                { value: "cost", label: "cost" },
              ]}
              value={sortBy}
              onChange={(v) => setSortBy(v as keyof ForecastData)}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
            <Select
              aria-label="Show 100"
              placeholder="Show 100"
              data={[
                { value: "5", label: "Show 5" },
                { value: "10", label: "Show 10" },
                { value: "50", label: "Show 50" },
                { value: "100", label: "Show 100" },
              ]}
              value={itemsPerPage}
              onChange={(v) => v && setItemsPerPage(v)}
              clearable
              className="grow"
              rightSection={<ChevronDownIcon />}
            />
          </Grid.Col>
          {showDateChanger && (
            <Grid.Col
              className="md:justify-end justify-center items-center flex"
              span={{
                base: 12,
                md: 4,
                lg: 3,
              }}
            >
              <DateChanger date={date} setDate={setDate} />
            </Grid.Col>
          )}
        </Grid>
        <div className="relative border border-primary rounded-xl border-t-0">
          <InfiniteScroll
            dataLength={forecasts.length}
            next={fetchMoreForecasts}
            hasMore={hasMore}
            loader={
              <div className="text-center py-4">
                <Loader size="md" />
              </div>
            }
            endMessage={
              <p className="text-center text-gray-500 py-4">
                No more forecasts to load.
              </p>
            }
          >
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
                    {!isSales && <Table.Th>Monthly Totals</Table.Th>}
                    {forecasts.length > 0 && Object.keys(forecasts[0].items).map((date) => (
                      <Table.Th key={date}>{date}</Table.Th>
                    ))}
                    <Table.Th className="rounded-se-xl">Sub Total</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {forecasts.map((element, index) => (
                    <Table.Tr key={index}>
                      <Table.Td className="first:rounded-es-xl">
                        {element.product.brand.name}
                      </Table.Td>
                      <Table.Td>{(data?.product as Product)?.brand_pillar?.name || ''}</Table.Td>
                      <Table.Td>{element.product.sku}</Table.Td>
                      <Table.Td>{element.cost}</Table.Td>
                      {!isSales && <Table.Td>{element.monthly_total}</Table.Td>}
                      {Object.keys(element.items).map((item, idx) => {
                        return (
                          <Table.Td key={`${index}-${idx}`}>
                            <NumberInput
                              {...form.getInputProps(
                                `forecast.${index}.items.${idx}.value`
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
                        );
                      })}
                      <Table.Td className="last:rounded-ee-xl !pr-2">
                        {element.sub_total}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </InfiniteScroll>
        </div>
      </div>
    </form>
  );
});

export default InnovationsForecastTableDist;
