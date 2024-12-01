import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import FileBankIcon from "@/components/Icons/FileBankIcon";
import FileUploadIcon from "@/components/Icons/FileUploadIcon";
import TrashIcon from "@/components/Icons/TrashIcon";
import { Grid, FileInput, Divider } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useRef } from "react";

interface FileUploadSectionProps {
    form: UseFormReturnType<any>;
}

export const FileUploadSection = ({ form }: FileUploadSectionProps) => {
    const fileUploadRef = useRef<HTMLButtonElement>(null);
    return (
        <Grid
            gutter={{
                sm: 32,
                base: 24,
            }}
        >
            <Grid.Col
                span={{
                    sm: 4,
                    base: 12,
                }}
            >
                <FileInput
                    {...form.getInputProps("document")}
                    ref={fileUploadRef}
                    label="Select documents to upload"
                    placeholder="Select documents"
                    classNames={{
                        label: "text-primary font-medium text-sm mb-1",
                        input: "text-transparent",
                    }}
                    rightSection={
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                fileUploadRef.current?.click();
                            }}
                        >
                            <ChevronDownIcon />
                        </div>
                    }
                />
            </Grid.Col>
            {form.values.document && (
                <Grid.Col span={12} className="custom-file-input">
                    <FileInput
                        {...form.getInputProps("document")}
                        aria-label="Select documents to upload"
                        classNames={{
                            input: "text-primary !bg-white border !border-primary !rounded-[10px] p-[10px] pl-8",
                        }}
                        rightSection={
                            <div className="flex items-center pr-[10px]">
                                <div
                                    className="flex items-center gap-x-[10px] text-sm text-primary cursor-pointer"
                                    onClick={() => {
                                        fileUploadRef.current?.click();
                                    }}
                                >
                                    <FileUploadIcon />
                                    Upload
                                </div>
                                <Divider
                                    orientation="vertical"
                                    className="border-primary mx-[10px]"
                                />
                                <div
                                    className="flex items-center gap-x-[10px] text-sm text-primary cursor-pointer"
                                    onClick={() => {
                                        form.setFieldValue("document", "");
                                    }}
                                >
                                    <TrashIcon />
                                    Delete
                                </div>
                            </div>
                        }
                        leftSection={<FileBankIcon />}
                    />
                </Grid.Col>
            )}
        </Grid>
    );
};
