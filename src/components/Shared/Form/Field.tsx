import { Text } from "@mantine/core";

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
}

export const FormField = ({ label, children }: FormFieldProps) => (
    <div className="flex flex-col gap-1">
        <Text className="text-primary font-medium text-sm">{label}</Text>
        {children}
    </div>
);
