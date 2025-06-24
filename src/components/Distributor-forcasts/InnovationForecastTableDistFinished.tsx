import { ForecastData, ForecastDetailsData, ForecastSubmitInput, Product } from "@/types";
import { Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useEffect, useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { z } from "zod";
import { OfferingProductsMap } from "./hooks/use-offering-products";
import { createBaseForecast, createProductForecast } from "./utils";
import { ForecastFilters, OfferingTable } from "./components";
import { Offering } from "../AddInnovation/Offering/types";

interface InnovationsForecastTableDistProps {
    data: ForecastDetailsData;
    offeringProducts: OfferingProductsMap;
    offerings: Offering[];
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
    { submit: () => void },
    InnovationsForecastTableDistProps
>(({ data, offeringProducts, offerings }, ref) => {
    const [sortBy, setSortBy] = useState<string | null>("");
    const [itemsPerPage, setItemsPerPage] = useState("5");
    const [date, setDate] = useState<Date>(new Date());
    const [showDateChanger, setShowDateChanger] = useState(false);


    const forecastsByOffering = useMemo(() => {
        const grouped: Record<string, ForecastData[]> = {};

        if (!data || !data.product) {
            return grouped;
        }

        const product = data.product as Product;

        if (!product?.id) {
            return grouped;
        }

        const baseForecast = createBaseForecast(data, product);

        Object.entries(offeringProducts).forEach(([offeringId, products]) => {
            if (products.length > 0) {
                const offeringForecasts = products.map(product =>
                    createProductForecast(baseForecast, product)
                );
                grouped[offeringId] = offeringForecasts;
            } else {
                grouped[offeringId] = [];
            }
        });

        return grouped;
    }, [data, offeringProducts]);

    const [forecasts, setForecasts] = useState<ForecastData[]>([]);

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
    }));

    useEffect(() => {
        const allForecasts = Object.values(forecastsByOffering).flat();

        if (allForecasts.length > 0) {
            const transformedData = allForecasts.map((item) => {
                return {
                    product_id: item.product.id,
                    items: Object.entries(item.items).map(([month, item]) => ({
                        month,
                        value: item.value,
                    })),
                };
            });

            form.setValues({ forecast: [...transformedData] });
        }
    }, [forecastsByOffering]);

    useEffect(() => {
        const allForecasts = Object.values(forecastsByOffering).flat();
        setForecasts(allForecasts);
    }, [forecastsByOffering]);

    useEffect(() => {
        if (forecasts.length !== 0) {
            const newDate = new Date(`1 ${Object.keys(forecasts[0].items)[0]}`);
            setDate(newDate);
        }
    }, [forecasts]);



    return (
        <form>
            <div className="bg-white shadow-md rounded-lg p-6 mt-5">
                <ForecastFilters
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    showDateChanger={showDateChanger}
                    date={date}
                    setDate={setDate}
                />


                {Object.entries(forecastsByOffering).map(([offeringId, offeringForecasts], index) => (
                    <OfferingTable
                        key={offeringId}
                        offeringId={offeringId}
                        offeringForecasts={offeringForecasts}
                        data={data}
                        form={form}
                        forecastsByOffering={forecastsByOffering}
                        offerings={offerings}
                        status={false}
                    />
                ))}

                {Object.keys(forecastsByOffering).length === 0 && (
                    <div className="text-center py-8">
                        <Text c="dimmed" size="lg">
                            No offerings found. Please add some offerings to see forecasts.
                        </Text>
                    </div>
                )}
            </div>
        </form>
    );
});

export default InnovationsForecastTableDist;
