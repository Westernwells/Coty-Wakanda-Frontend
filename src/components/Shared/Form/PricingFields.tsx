import { Grid, Select, TextInput } from "@mantine/core";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import { UseFormReturnType } from "@mantine/form";

interface PricingFieldsProps {
    form: UseFormReturnType<any>;
    prefix?: string;
}

export const PricingFields = ({ form, prefix = "" }: PricingFieldsProps) => (
    <>
        <Grid.Col
            span={{
                sm: 4,
                base: 8,
            }}
        >
            <Select
                label="Select co-efficient"
                placeholder="Select co-efficient"
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
                {...form.getInputProps(`${prefix}preActiveRrsp`)}
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
                {...form.getInputProps(`${prefix}activeRrsp`)}
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
                {...form.getInputProps(`${prefix}billing`)}
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
                {...form.getInputProps(`${prefix}currency`)}
                label="Currency"
                placeholder="Select Currency"
                data={["USD", "EUR", "GBP"]}
                clearable
                classNames={{
                    label: "text-primary font-medium text-sm mb-1",
                }}
                rightSection={<ChevronDownIcon />}
            />
        </Grid.Col>
    </>
);
