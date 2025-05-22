import { useFileUpload } from "@/api/products/upload-document";
import { useGetDocuments } from "@/api/products/get-documents";
import { useAddDocument } from "@/api/products/add-document";
import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import TrashIcon from "@/components/Icons/TrashIcon";
import {
  Grid,
  FileInput,
  Divider,
  Loader,
  Text,
  Button,
  Group,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import get from "lodash.get";
import { useState } from "react";
import { ExternalLink, Download } from "lucide-react";
import { queryClient } from "@/main";

// UploadedValue: string (public_url) or { title, url }
type UploadedValue = string | { title: string; url: string };

interface FileUploadSectionProps<T = Record<string, unknown>> {
  form: UseFormReturnType<T>;
  id: string;
  multiple?: boolean;
  accept?: string;
  span?: object;
  label?: string;
  stringOnly?: boolean;
  productId?: string | number;
}

/**
 * FileUploadSection component for handling file uploads with document management
 *
 * @example
 * ```tsx
 * // Basic usage without productId (shows generic upload status)
 * <FileUploadSection form={form} id="documents" />
 *
 * // With productId for full document management (fetch, view, download)
 * <FileUploadSection
 *   form={form}
 *   id="documents"
 *   productId={123}
 *   multiple={true}
 *   accept=".pdf,.doc,.docx"
 * />
 *
 * // String-only mode (returns public URLs instead of {title, url} objects)
 * <FileUploadSection
 *   form={form}
 *   id="documentUrls"
 *   productId={123}
 *   stringOnly={true}
 * />
 * ```
 */
export function FileUploadSection<T = Record<string, unknown>>({
  form,
  id,
  multiple,
  accept,
  span,
  label,
  stringOnly,
  productId,
}: FileUploadSectionProps<T>) {
  const uploadFile = useFileUpload({ mutationConfig: {} });
  const addDocument = useAddDocument({ mutationConfig: {} });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents for the product
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    refetch,
  } = useGetDocuments({
    product_id: productId?.toString(),
    page_size: 100, // Get all documents
  });

  async function handleFileChange(files: File | File[] | null) {
    if (!files) return;
    setError(null);
    setIsUploading(true);
    try {
      const fileArray = Array.isArray(files) ? files : [files];
      const uploadResults: UploadedValue[] = [];

      for (const file of fileArray) {
        // Step 1: Upload file to S3 and get public URL
        const formData = new FormData();
        formData.append("file_name", file.name);
        formData.append("file_type", file.type);
        formData.append("file", file);

        const uploadResult = await uploadFile.mutateAsync({ data: formData });
        const { public_url, title: responseTitle } = uploadResult.data.data;

        // Use response title or fallback to original filename
        const documentTitle = responseTitle || file.name;

        // Step 2: Save document reference to database (if productId is provided)
        if (productId) {
          await addDocument.mutateAsync({
            productId: Number(productId),
            data: {
              title: documentTitle,
              url: public_url,
            },
          });
        }

        // Prepare value for form
        const uploadedValue = stringOnly
          ? public_url
          : { title: documentTitle, url: public_url };
        uploadResults.push(uploadedValue);
      }

      // Set form value with proper type casting

      form.setFieldValue(
        id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (multiple ? uploadResults : uploadResults[0]) as any
      );

      // Refetch documents to show the newly uploaded ones
      if (productId) {
        await refetch();
        // Also invalidate the documents query cache
        queryClient.invalidateQueries({
          queryKey: ["documents", productId.toString()],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleDownload(url: string, title: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = title;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleView(url: string) {
    window.open(url, "_blank");
  }

  const hasDocuments = documentsData?.data && documentsData.data.length > 0;
  const hasFormFiles = get(form.getValues(), id);

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
          label={label ? label : "Select documents to upload"}
          placeholder="Select documents"
          classNames={{
            label: "text-primary font-medium text-sm mb-1",
            input: "text-transparent",
          }}
          rightSection={<ChevronDownIcon />}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="flex items-center gap-2 mt-2 text-primary">
            <Loader size="xs" /> Uploading...
          </div>
        )}
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </Grid.Col>

      {/* Show uploaded documents from API */}
      {productId && (hasDocuments || isLoadingDocuments) && (
        <Grid.Col span={12}>
          <div className="bg-white border border-gray-200 rounded-[10px] p-4">
            <div className="flex items-center justify-between mb-3">
              <Text className="font-medium text-primary">
                Uploaded Documents
              </Text>
              {isLoadingDocuments && <Loader size="xs" />}
            </div>

            {isLoadingDocuments ? (
              <Text size="sm" className="text-gray-500">
                Loading documents...
              </Text>
            ) : hasDocuments ? (
              <div className="space-y-2">
                {documentsData.data.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <Text className="truncate font-medium text-sm">
                        {doc.title}
                      </Text>
                    </div>
                    <Group gap="xs">
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => handleView(doc.url)}
                        leftSection={<ExternalLink size={14} />}
                      >
                        View
                      </Button>
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => handleDownload(doc.url, doc.title)}
                        leftSection={<Download size={14} />}
                      >
                        Download
                      </Button>
                      <Button
                        variant="subtle"
                        size="xs"
                        color="red"
                        onClick={() => {
                          // TODO: Implement document deletion if needed
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          form.setFieldValue(id, undefined as any);
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </Group>
                  </div>
                ))}
              </div>
            ) : (
              <Text size="sm" className="text-gray-500">
                No documents uploaded yet
              </Text>
            )}
          </div>
        </Grid.Col>
      )}

      {/* Fallback for when productId is not available but form has files */}
      {!productId && hasFormFiles && (
        <Grid.Col span={12} className="custom-file-input">
          <div className=" flex justify-between bg-white border !border-primary !rounded-[10px] p-1 pe-2">
            <p className="truncate max-w-[250px]">your file uploaded</p>
            <div className="flex items-center pr-[10px]">
              <Divider
                orientation="vertical"
                className="border-primary mx-[10px]"
              />
              <div
                className="flex items-center gap-x-[10px] text-sm text-primary cursor-pointer"
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  form.setFieldValue(id, undefined as any);
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
}
