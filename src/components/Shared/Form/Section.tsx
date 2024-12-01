import { Title } from "@mantine/core";
import { ReactNode } from "react";

interface FormSectionProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export const FormSection = ({
    title,
    children,
    className = "",
}: FormSectionProps) => (
    <div
        className={`bg-white w-full rounded-[20px] flex flex-col p-6 mt-8 gap-4 sm:gap-6 ${className}`}
    >
        <Title order={2} className="text-primary font-semibold text-xl">
            {title}
        </Title>
        {children}
    </div>
);
