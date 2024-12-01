import {
    Button,
    Divider,
    Grid,
    Group,
    Radio,
    Select,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { FormSection } from "../Shared/Form/Section";
import { FormField } from "../Shared/Form/Field";
import DateIcon from "../Icons/DateIcon";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import { StatusCard } from "../Shared/Form/StatusCard";
import CornerDownRightIcon from "../Icons/CornerDownRightIcon";
import { FileUploadSection } from "../Shared/Form/FileUploadSection";
import { PricingFields } from "../Shared/Form/PricingFields";

const AddProductForm = () => {
    const form = useForm({
        initialValues: {
            preference: "pref",
            group: "",
            productType: "",
            launchDate: "",
            discountDate: "",
            offeringNumber: "",
            irc: "",
            document: "",
        },
    });

    return (
        <form
            onSubmit={form.onSubmit((values) => {
                console.log("submitted");
                console.log(values);
            })}
        >
            <FormSection title="Product details" className="mt-2 sm:mt-5">
                <Radio.Group
                    {...form.getInputProps("preference")}
                    name="preference"
                    label="Pref/non-pref"
                    classNames={{
                        label: "text-primary font-medium text-sm",
                    }}
                >
                    <Group w="100%" className="mt-[10px] " gap={24}>
                        <Radio
                            value="pref"
                            label="Pref"
                            classNames={{
                                label: "text-primary text-sm pl-[5px] sm:pl-2",
                            }}
                        />
                        <Radio
                            value="non-pref"
                            label="Non-pref"
                            classNames={{
                                label: "text-primary text-sm pl-[5px] sm:pl-2",
                            }}
                        />
                    </Group>
                </Radio.Group>

                <Grid>
                    <Grid.Col
                        span={{
                            sm: 6,
                            base: 12,
                        }}
                    >
                        <FormField label="Grouping">
                            <Radio.Group
                                {...form.getInputProps("group")}
                                name="group"
                            >
                                <Group gap={24} w="100%" className="mt-[10px]">
                                    <Radio
                                        value="group1"
                                        label="Group 1"
                                        classNames={{
                                            label: "text-primary text-sm pl-[5px] sm:pl-2",
                                        }}
                                    />
                                    <Radio
                                        value="group2"
                                        label="Group 2"
                                        classNames={{
                                            label: "text-primary text-sm pl-[5px] sm:pl-2",
                                        }}
                                    />
                                    <Radio
                                        value="group3"
                                        label="Group 3 (TR exclusive)"
                                        classNames={{
                                            label: "text-primary text-sm pl-[5px] sm:pl-2",
                                        }}
                                    />
                                </Group>
                            </Radio.Group>
                        </FormField>
                    </Grid.Col>

                    <Grid.Col
                        span={{
                            sm: 6,
                            base: 12,
                        }}
                    >
                        <FormField label="Product type">
                            <Radio.Group
                                {...form.getInputProps("productType")}
                                name="productType"
                            >
                                <Group
                                    gap={24}
                                    w="100%"
                                    className="mt-[10px] flex-col sm:flex-row  items-start "
                                >
                                    <Radio
                                        value="saleable"
                                        label="Saleable"
                                        classNames={{
                                            label: "text-primary text-sm pl-[5px] sm:pl-2",
                                        }}
                                    />
                                    <Radio
                                        value="non-saleable"
                                        label="Non-saleable"
                                        classNames={{
                                            label: "text-primary text-sm pl-[5px] sm:pl-2",
                                        }}
                                    />
                                </Group>
                            </Radio.Group>
                        </FormField>
                    </Grid.Col>
                </Grid>

                <Grid gutter={24}>
                    <Grid.Col
                        span={{
                            sm: 6,
                            base: 12,
                        }}
                    >
                        <DateInput
                            {...form.getInputProps("launchDate")}
                            variant="filled"
                            valueFormat="YYYY MMM DD"
                            label="Launch date"
                            placeholder="Select date"
                            rightSection={<DateIcon />}
                        />
                    </Grid.Col>
                    <Grid.Col
                        span={{
                            sm: 6,
                            base: 12,
                        }}
                    >
                        <DateInput
                            {...form.getInputProps("discountDate")}
                            variant="filled"
                            valueFormat="YYYY MMM DD"
                            label="Discount date"
                            placeholder="Select date"
                            rightSection={<DateIcon />}
                        />
                    </Grid.Col>
                </Grid>
            </FormSection>

            <FormSection title="Category heading">
                <Grid
                    gutter={{
                        sm: 32,
                        base: 16,
                    }}
                >
                    <Grid.Col
                        span={{
                            sm: 6,
                            base: 12,
                        }}
                    >
                        <TextInput
                            {...form.getInputProps("offeringNumber")}
                            label="Offering number (optional)"
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
                            {...form.getInputProps("irc")}
                            label="IRC"
                            classNames={{
                                label: "text-primary font-medium text-sm mb-1",
                            }}
                        />
                    </Grid.Col>
                </Grid>
            </FormSection>

            <FormSection title="Category heading">
                <Grid
                    gutter={{
                        sm: 32,
                        base: 16,
                    }}
                >
                    <Grid.Col
                        span={{
                            sm: 6,
                            base: 12,
                        }}
                    >
                        <TextInput
                            {...form.getInputProps("materialDesc")}
                            label="Material description"
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
                            {...form.getInputProps("eanUpc")}
                            label="Item EAN/UPC"
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
                            {...form.getInputProps("house")}
                            label="House"
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
                            {...form.getInputProps("brand")}
                            label="Brand"
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
                            {...form.getInputProps("line")}
                            label="Line"
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
                            {...form.getInputProps("lineId")}
                            label="Line ID"
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
                            {...form.getInputProps("articleType")}
                            label="Article type"
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
                            {...form.getInputProps("division")}
                            label="Division"
                            classNames={{
                                label: "text-primary font-medium text-sm mb-1",
                            }}
                        />
                    </Grid.Col>
                </Grid>
            </FormSection>

            <FormSection title="Category heading">
                <Grid
                    gutter={{
                        sm: 32,
                        base: 16,
                    }}
                >
                    <Grid.Col
                        span={{
                            sm: 6,
                            base: 12,
                        }}
                    >
                        <TextInput
                            {...form.getInputProps("coreCategory")}
                            label="Core category"
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
                            {...form.getInputProps("subCategory")}
                            label="Sub category"
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
                            {...form.getInputProps("market")}
                            label="Market"
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
                            {...form.getInputProps("segment")}
                            label="Segment"
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
                            {...form.getInputProps("icpEur")}
                            label="ICP_EUR"
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
                            {...form.getInputProps("icpUsd")}
                            label="ICP_USD"
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
                            {...form.getInputProps("factory")}
                            label="Factory"
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
                            {...form.getInputProps("commodityId")}
                            label="Commodity ID"
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
                            {...form.getInputProps("countryOfOrigin")}
                            label="Country of origin"
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
                            {...form.getInputProps("gender")}
                            label="Gender"
                            classNames={{
                                label: "text-primary font-medium text-sm mb-1",
                            }}
                        />
                    </Grid.Col>
                </Grid>
            </FormSection>
            <FormSection title="Category heading">
                <Grid
                    gutter={{
                        sm: 32,
                        base: 16,
                    }}
                >
                    <Grid.Col
                        span={{
                            sm: 6,
                            base: 12,
                        }}
                    >
                        <TextInput
                            {...form.getInputProps("coreCategory")}
                            label="Core category"
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
                            {...form.getInputProps("subCategory")}
                            label="Sub category"
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
                            {...form.getInputProps("market")}
                            label="Market"
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
                            {...form.getInputProps("segment")}
                            label="Segment"
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
                            {...form.getInputProps("icpEur")}
                            label="ICP_EUR"
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
                            {...form.getInputProps("icpUsd")}
                            label="ICP_USD"
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
                            {...form.getInputProps("factory")}
                            label="Factory"
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
                            {...form.getInputProps("commodityId")}
                            label="Commodity ID"
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
                            {...form.getInputProps("countryOfOrigin")}
                            label="Country of origin"
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
                            {...form.getInputProps("gender")}
                            label="Gender"
                            classNames={{
                                label: "text-primary font-medium text-sm mb-1",
                            }}
                        />
                    </Grid.Col>
                </Grid>
            </FormSection>

            <FormSection title="Price benchmark">
                <Grid
                    gutter={{
                        sm: 24,
                        base: 16,
                    }}
                >
                    <Grid.Col
                        span={{
                            sm: 4,
                            base: 12,
                        }}
                    >
                        <Select
                            label="Brand"
                            placeholder="Select Brand"
                            data={["React", "Angular", "Vue", "Svelte"]}
                            clearable
                            classNames={{
                                label: "text-primary font-medium text-sm mb-1",
                            }}
                            rightSection={<ChevronDownIcon />}
                        />
                    </Grid.Col>
                    <Grid.Col
                        span={{
                            sm: 4,
                            base: 6,
                        }}
                    >
                        <Select
                            label="Product"
                            placeholder="Select Product"
                            data={["React", "Angular", "Vue", "Svelte"]}
                            clearable
                            classNames={{
                                label: "text-primary font-medium text-sm mb-1",
                            }}
                            rightSection={<ChevronDownIcon />}
                        />
                    </Grid.Col>
                    <Grid.Col
                        span={{
                            sm: 4,
                            base: 6,
                        }}
                    >
                        <TextInput
                            {...form.getInputProps("indexValue")}
                            label="Index value"
                            classNames={{
                                label: "text-primary font-medium text-sm mb-1",
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput
                            {...form.getInputProps("comment")}
                            label="Add a comment"
                            placeholder="HB BOT PM 24 EDP 50ml PREM IV"
                            classNames={{
                                label: "text-primary font-medium text-sm mb-1",
                            }}
                        />
                    </Grid.Col>
                </Grid>

                <Button
                    variant="default"
                    className="border-primary w-fit bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-3 hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                >
                    Set price benchmark
                </Button>
            </FormSection>

            <FormSection title="Distributors Pricing">
                <Grid
                    gutter={{
                        sm: 24,
                        base: 16,
                    }}
                >
                    <Grid.Col span={12} className="gap-6 flex items-center">
                        <StatusCard title="W AIR" chipType="blue">
                            <PricingFields form={form} prefix="wAir" />
                        </StatusCard>
                    </Grid.Col>
                </Grid>

                <Divider className="border-primary border-opacity-50" />

                <Grid
                    gutter={{
                        sm: 24,
                        base: 16,
                    }}
                >
                    <Grid.Col span={12}>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-6 ">
                                <StatusCard
                                    title="DOM"
                                    chipType="green"
                                    chipLabels={{
                                        primary: "Formal",
                                        secondary: "Not registered",
                                    }}
                                >
                                    <PricingFields form={form} prefix="dom" />
                                </StatusCard>
                            </div>
                            <div className="flex items-start gap-4 ">
                                <CornerDownRightIcon />
                                <StatusCard
                                    title="OLKA"
                                    chipType="green"
                                    isChild
                                    chipLabels={{
                                        primary: "Formal",
                                        secondary: "Not registered",
                                    }}
                                >
                                    <PricingFields form={form} prefix="olka" />
                                </StatusCard>
                            </div>
                            <div className="flex items-start gap-4">
                                <CornerDownRightIcon />
                                <StatusCard
                                    title="MAVEN"
                                    chipType="purple"
                                    isChild
                                    chipLabels={{
                                        primary: "Regional",
                                        secondary: "Not registered",
                                    }}
                                >
                                    <PricingFields form={form} prefix="maven" />
                                </StatusCard>
                            </div>
                        </div>
                    </Grid.Col>
                </Grid>
            </FormSection>

            <FormSection title="Upload documents">
                <FileUploadSection form={form} />
            </FormSection>

            <Group justify="flex-end" mt="md">
                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
};

export default AddProductForm;
