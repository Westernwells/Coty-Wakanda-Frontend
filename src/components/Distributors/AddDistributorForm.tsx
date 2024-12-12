import {
    Button,
    Grid,
    Group,
    MultiSelect,
    Radio,
    Select,
    TextInput,
} from "@mantine/core";
import { Currency, getCurrencies } from "@/api/get-currencies";

import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { Distributor } from "@/types";
import ExitIcon from "../Icons/ExitIcon";
import { PlusIcon as LucidePlusIcon } from "lucide-react";
import PlusIcon from "../Icons/PlusIcon";
import RefreshIcon from "../Icons/RefreshIcon";
import { getBrands } from "@/api/get-brands";
import { getCategories } from "@/api/get-categories";
import { getMarkets } from "@/api/get-markets";
import { getRegions } from "@/api/get-regions";
import { useForm } from "@mantine/form";
import { useLayoutEffect } from "react";
import { useQueries } from "@tanstack/react-query";

type FormValues = {
    type: string;
    name: string;
    regions: string[];
    markets: string[];
    company_registration_number: string;
    contact_person: string;
    contact_email: string;
    categories: string[];
    brands: string[];
    brand_pillars: string[];
    currency: string;
    group_1_mirror: string;
    group_2_mirror: string;
    coefficients: Array<{
        value: number;
        brand_id: number;
        category_id: number;
        pref_id: number;
    }>;
};

const AddDistributorForm = ({
    isEdit = false,
    formData,
}: {
    isEdit?: boolean;
    formData?: Distributor;
}) => {
    const form = useForm<FormValues>({
        initialValues: {
            type: "formal",
            name: "",
            regions: [],
            markets: [],
            company_registration_number: "",
            contact_person: "",
            contact_email: "",
            categories: [],
            brands: [],
            brand_pillars: [],
            currency: "",
            group_1_mirror: "",
            group_2_mirror: "",
            coefficients: [],
        },
    });

    const [
        { data: marketsData },
        { data: regionsData },
        { data: categoriesData },
        { data: brandsData },
        { data: currenciesData },
        // { data: brandPillarsData },
    ] = useQueries({
        queries: [
            { queryKey: ["markets"], queryFn: getMarkets },
            { queryKey: ["regions"], queryFn: getRegions },
            { queryKey: ["categories"], queryFn: getCategories },
            { queryKey: ["brands"], queryFn: getBrands },
            { queryKey: ["currencies"], queryFn: getCurrencies },
            // { queryKey: ["brandPillars"], queryFn: getBrandPillars },
        ],
    });

    const selectStyles = {
        input: "border-gray-200 text-sm",
        label: "text-primary font-medium text-sm mb-1",
        item: "text-sm",
        rightSection: "pointer-events-none",
    };

    const textInputStyles = {
        input: "bg-gray-50 border-0 text-sm",
        label: "text-primary font-medium text-sm mb-1",
    };

    useLayoutEffect(() => {
        if (formData && isEdit) {
            form.setValues({
                ...formData,
                regions: formData.regions.map((region) => region.id.toString()),
                categories: formData.categories.map((category) =>
                    category.id.toString()
                ),
                markets: formData.markets.map((market) => market.id.toString()),
                brands: formData.brands.map((brand) => brand.id.toString()),
                coefficients: formData.coefficients.map((coefficient) => ({
                    value: Number(coefficient.value),
                    brand_id: coefficient.brand.id,
                    category_id: coefficient.category.id,
                    pref_id: coefficient.pref.id,
                })),
            });
        }
    }, [formData, isEdit]);

    return (
        <form
            onSubmit={form.onSubmit((values) => console.log(values))}
            className="mt-2 sm:mt-5"
        >
            <div className="bg-white rounded-2xl p-6">
                <div className="space-y-6">
                    <div>
                        <span className="text-primary font-medium text-sm mb-2 block">
                            Distributor type
                        </span>
                        <Radio.Group
                            {...form.getInputProps("type")}
                            name="type"
                        >
                            <Group gap={24}>
                                <Radio
                                    value="formal"
                                    label="Formal"
                                    classNames={{
                                        label: "text-primary text-sm pl-2",
                                    }}
                                />
                                <Radio
                                    value="hybrid"
                                    label="Hybrid"
                                    classNames={{
                                        label: "text-primary text-sm pl-2",
                                    }}
                                />
                                <Radio
                                    value="regional"
                                    label="Regional"
                                    classNames={{
                                        label: "text-primary text-sm pl-2",
                                    }}
                                />
                            </Group>
                        </Radio.Group>
                    </div>

                    <Grid gutter={24}>
                        <Grid.Col span={12}>
                            <TextInput
                                {...form.getInputProps("name")}
                                label="Business name"
                                placeholder="Enter business name"
                                classNames={textInputStyles}
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid gutter={24}>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <MultiSelect
                                {...form.getInputProps("regions")}
                                label="Regions"
                                placeholder="Select regions"
                                data={
                                    regionsData?.data?.map((region) => ({
                                        value: region.id.toString(),
                                        label: region.name,
                                    })) || []
                                }
                                value={form.values.regions}
                                rightSection={<ChevronDownIcon />}
                                classNames={selectStyles}
                                clearable
                                autoComplete="off"
                                searchable
                            />
                        </Grid.Col>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <MultiSelect
                                {...form.getInputProps("markets")}
                                label="Markets/Countries"
                                placeholder="Select markets/countries"
                                value={form.values.markets}
                                data={
                                    marketsData?.data?.map((market) => ({
                                        value: market.id.toString(),
                                        label: market.name,
                                    })) || []
                                }
                                rightSection={<ChevronDownIcon />}
                                classNames={selectStyles}
                                clearable
                                searchable
                                autoComplete="off"
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid gutter={24}>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <TextInput
                                {...form.getInputProps(
                                    "company_registration_number"
                                )}
                                label="Company registration number"
                                placeholder="Enter registration number"
                                classNames={textInputStyles}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <TextInput
                                {...form.getInputProps("contact_person")}
                                label="Contact person"
                                placeholder="Enter contact person"
                                classNames={textInputStyles}
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid gutter={24}>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <TextInput
                                {...form.getInputProps("contact_email")}
                                label="Contact email"
                                placeholder="Enter email address"
                                type="email"
                                classNames={textInputStyles}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <MultiSelect
                                {...form.getInputProps("categories")}
                                label="Categories"
                                placeholder="Select categories"
                                value={form.values.categories}
                                data={
                                    categoriesData?.data?.map((category) => ({
                                        value: category.id.toString(),
                                        label: category.name,
                                    })) || []
                                }
                                rightSection={<ChevronDownIcon />}
                                classNames={selectStyles}
                                clearable
                                searchable
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid gutter={24}>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <MultiSelect
                                {...form.getInputProps("brands")}
                                label="Marketed COTY brands"
                                value={form.values.brands}
                                placeholder="Select brands"
                                data={
                                    brandsData?.data?.map((brand) => ({
                                        value: brand.id.toString(),
                                        label: brand.name,
                                    })) || []
                                }
                                rightSection={<ChevronDownIcon />}
                                classNames={selectStyles}
                                clearable
                                searchable
                            />
                        </Grid.Col>
                        {/* <Grid.Col span={{ sm: 6, base: 12 }}>
                            <Select
                                {...form.getInputProps("brand_pillars")}
                                label="Brand pillars"
                                placeholder="Select brand pillars"
                                data={
                                    brandPillarsData?.data?.map((pillar) => ({
                                        value: pillar.id.toString(),
                                        label: pillar.name,
                                    })) || []
                                }
                                rightSection={<ChevronDownIcon />}
                                classNames={selectStyles}
                                clearable
                                searchable
                            />  
                        </Grid.Col> */}
                    </Grid>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 mt-6">
                <h2 className="text-lg font-semibold mb-6">Category heading</h2>
                <div className="space-y-6">
                    <Grid gutter={24}>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <Select
                                {...form.getInputProps("currency")}
                                label="Currency"
                                placeholder="Select currency"
                                value={form.values.currency}
                                data={
                                    currenciesData?.data?.map(
                                        (currency: Currency) => ({
                                            value: currency.id.toString(),
                                            label: `${currency.code} (${currency.symbol}) - ${currency.name}`,
                                        })
                                    ) || []
                                }
                                rightSection={<ChevronDownIcon />}
                                classNames={selectStyles}
                                clearable
                                searchable
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid gutter={24}>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <Select
                                {...form.getInputProps("group_1_mirror")}
                                label="Group 1 pricing mirror (optional)"
                                placeholder="Select distributor"
                                data={[]}
                                rightSection={<ChevronDownIcon />}
                                classNames={selectStyles}
                                clearable
                                searchable
                            />
                        </Grid.Col>
                        <Grid.Col span={{ sm: 6, base: 12 }}>
                            <Select
                                {...form.getInputProps("group_2_mirror")}
                                label="Group 2 pricing mirror (optional)"
                                placeholder="Select distributor"
                                data={[]} // This would need distributor data
                                rightSection={<ChevronDownIcon />}
                                classNames={selectStyles}
                                clearable
                                searchable
                            />
                        </Grid.Col>
                    </Grid>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 mt-6">
                <h2 className="text-lg font-semibold mb-6">Co-efficients</h2>
                <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<LucidePlusIcon size={24} />}
                >
                    Add co-efficients
                </Button>
            </div>

            <Group justify="flex-end" mt="xl" gap={10}>
                <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    leftSection={<ExitIcon />}
                >
                    Cancel
                </Button>
                <Button
                    leftSection={isEdit ? <RefreshIcon /> : <PlusIcon />}
                    type="submit"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                >
                    {isEdit ? "Update" : "Create"}
                </Button>
            </Group>
        </form>
    );
};

export default AddDistributorForm;
