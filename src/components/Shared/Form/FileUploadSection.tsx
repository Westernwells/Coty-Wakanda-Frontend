import {
  ApiResponseFiles,
  useFileUpload,
} from "@/api/products/upload-document";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import TrashIcon from "@/components/Icons/TrashIcon";
import { Grid, FileInput, Divider } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import get from "lodash.get";
import { useRef } from "react";

interface FileUploadSectionProps {
  form: UseFormReturnType<any>;
  id: string;
  multiple?: boolean;
  accept?: string;
  span?: object;
  label?: string;
  stringOnly?: boolean;
}

export const FileUploadSection = ({
  form,
  id,
  multiple,
  accept,
  span,
  label,
  stringOnly,
}: FileUploadSectionProps) => {
  const fileUploadRef = useRef<HTMLButtonElement>(null);
  const uploadFile = useFileUpload({
    mutationConfig: {},
  });
  return (
    <Grid
      gutter={{
        sm: 32,
        base: 24,
      }}
    >
      <Grid.Col span={span}>
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
          onChange={async (e) => {
            if (e) {
              form.setFieldValue(id, e);
              const promises: Promise<ApiResponseFiles>[] = [];
              (e as File[]).forEach(async (f) => {
                const formData = new FormData();
                formData.append("file_name", f.name);
                formData.append("file_type", f.type);
                formData.append("file", f);
                const data = uploadFile.mutateAsync({
                  data: formData,
                });
                promises.push(data);
              });
              const files = await Promise.all(promises);
              const values = files.map((file) => {
                if (stringOnly) {
                  return file.data.data.url;
                }
                return {
                  title: new URL(file.data.data.url).pathname.split("/").pop(),
                  url: file.data.data.url,
                };
              });
              form.setFieldValue(id, values);
              console.log();
            }
          }}
        />
      </Grid.Col>
      {get(form.getValues(), id) && (
        <Grid.Col span={12} className="custom-file-input">
          <div className=" flex justify-between bg-white border !border-primary !rounded-[10px] p-1 pe-2">
            <p className="truncate max-w-[250px]">
              filenameherefilenameherefilenameherefilenameherefilenameherefilenameherefilenameherefilenameherefilenameherefilenameherefilenamehere
            </p>
            <div className="flex items-center pr-[10px]">
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
