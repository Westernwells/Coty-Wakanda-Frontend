import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import FileBankIcon from "@/components/Icons/FileBankIcon";
import FileUploadIcon from "@/components/Icons/FileUploadIcon";
import TrashIcon from "@/components/Icons/TrashIcon";
import { Grid, FileInput, Divider } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useRef } from "react";

interface FileUploadSectionProps {
    form: UseFormReturnType<any>;
    id: string;
    multiple?: boolean;
    accept?: string;
    span?: object
    label?: string
}

export const FileUploadSection = ({ form, id, multiple, accept, span, label }: FileUploadSectionProps) => {
    const fileUploadRef = useRef<HTMLButtonElement>(null);
    return (
        <Grid
            gutter={{
                sm: 32,
                base: 24,
            }}
        >
            <Grid.Col
                span={span}
            >
                <FileInput
                    {...form.getInputProps(id)}
                    multiple={multiple}
                    accept={accept}
                    ref={fileUploadRef}
                    label={label ? label : "Select documents to upload"}
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
            {form.values[id] && (
                <Grid.Col span={12} className="custom-file-input">
                    <div className=" flex justify-between bg-white border !border-primary !rounded-[10px] p-1 pe-2">
                    <FileInput
                        {...form.getInputProps(id)}
                        aria-label="Select documents to upload"
                        classNames={{
                            input: "text-primary !bg-transparent",
                            root: "max-w-[30%] sm:max-w-[calc(100%-200px)]"
                        }}
                        leftSection={<FileBankIcon />}
                    />
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
                                        form.setFieldValue(id, "");
                                    }}
                                >
                                    <TrashIcon />
                                    Delete
                                </div>
                            </div>
                            </div>
                </Grid.Col>
            )}
        </Grid>
    );
};
