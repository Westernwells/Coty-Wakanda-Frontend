import { Group, Title } from "@mantine/core";
import { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  rightSide?: ReactNode;
  className?: string;
}

export const FormSection = ({
  title,
  children,
  rightSide = null,
  className = "",
}: FormSectionProps) => (
  <div
    className={`bg-white w-full rounded-[20px] flex flex-col p-6 mt-8 gap-4 sm:gap-6 ${className}`}
  >
    <Group justify="space-between">
      <Title order={2} className="text-primary font-semibold text-xl">
        {title}
      </Title>
      {rightSide}
    </Group>
    {children}
  </div>
);
