import { cn } from "@/lib/utils";
import { Grid, Group, Text, Chip } from "@mantine/core";

interface StatusCardProps {
    title: string;
    chipType?: string;
    children: React.ReactNode;
    isChild?: boolean;
    chipLabels?: {
        primary: string;
        secondary: string;
    };
}

export const StatusCard = ({
    title,
    chipType = "primary",
    children,
    isChild = false,
    chipLabels = {
        primary: "Hybrid",
        secondary: "Not registered",
    },
}: StatusCardProps) => {
    return (
        <Grid
            gutter={24}
            className={`border   ${isChild ? "border-primary p-3 sm:p-6" : "border-none"} rounded-[10px] `}
        >
            <Grid.Col
                span={12}
                className="gap-6 flex items-center flex-wrap gap-y-3 "
            >
                <Text className="font-semibold text-base sm:text-lg text-primary">
                    {title}
                </Text>
                <Chip.Group>
                    <Group gap={6}>
                        <Chip
                            value="1"
                            classNames={{
                                label: cn(
                                    `px-3 text-xs h-5 border-none`,
                                    chipType === "blue" &&
                                        `data-[checked=true]:bg-blue`,
                                    chipType === "purple" &&
                                        `data-[checked=true]:bg-purple`,
                                    chipType === "green" &&
                                        `data-[checked=true]:bg-green`,
                                    chipType === "green" &&
                                        `data-[checked=true]:text-primary`
                                ),
                            }}
                        >
                            {chipLabels.primary}
                        </Chip>
                        <Chip
                            value="2"
                            classNames={{
                                label: cn(
                                    `px-3 text-xs h-5 border-none`,
                                    chipType === "blue" &&
                                        `data-[checked=true]:bg-blue`,
                                    chipType === "purple" &&
                                        `data-[checked=true]:bg-purple`,
                                    chipType === "green" &&
                                        `data-[checked=true]:bg-green`,
                                    chipType === "green" &&
                                        `data-[checked=true]:text-primary`
                                ),
                            }}
                        >
                            {chipLabels.secondary}
                        </Chip>
                    </Group>
                </Chip.Group>
            </Grid.Col>
            {children}
        </Grid>
    );
};
