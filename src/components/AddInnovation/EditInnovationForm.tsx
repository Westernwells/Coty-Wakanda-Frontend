import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { useUpdateInnovation } from "@/api/innovations/update-innovation";
import { useFileUpload } from "@/api/products/upload-document";
import { Innovation } from "@/types";
import { Button, Grid, Select, TextInput } from "@mantine/core";
import { YearPickerInput, DateInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { X, Upload } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { z } from "zod";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import { FormField } from "../Shared/Form/Field";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import OfferingTable from "./OfferingTable";
import {
  getOfferingProducts,
  OfferingProduct,
} from "@/api/products/get-offering-products";

// Extended Innovation type for API response
interface ExtendedInnovation extends Innovation {
  status?: string;
  reference_names?: string | string[] | null;
  internal_offering_deck?: string | null;
  customer_offering_deck?: string | null;
  offerings?: Array<{
    id: number;
    number: string;
    icw: string;
    ocd: string;
    type: string;
    deck: string | null;
    market_deck: string | null;
    created_at: string;
  }>;
}

type FormValues = {
  status: string;
  brand_id: string;
  sub_brand_id: string;
  year: Date;
  format: string;
  launch_name: string;
  reference_names: string[];
  internal_offering_deck: string;
  customer_offering_deck: string;
  forecast_deadline: Date;
  offerings?: Array<{
    id?: number;
    number: string;
    icw: Date;
    ocd: Date;
    type: string;
    deck: string;
    market_deck: string;
    products: Array<{
      irc: string;
      currency: string;
      price: number;
      icp_cost: number;
      product_type: string;
      pref: string;
      grouping: string;
      material_description?: string;
      brand_id: string;
      sub_brand_id?: string;
    }>;
  }>;
};

const formSchema = z.object({
  status: z.string().min(1, "Status is required"),
  brand_id: z.string().min(1, "Brand is required"),
  sub_brand_id: z.string().min(1, "Brand Pillar is required"),
  year: z.date(),
  format: z.string().min(1, "Format is required"),
  launch_name: z.string().min(1, "Launch name is required"),
  reference_name: z.array(z.string()).optional(),
  internal_offering_deck: z.string().optional(),
  customer_offering_deck: z.string().optional(),
  forecast_deadline: z.date(),
  offerings: z
    .array(
      z.object({
        id: z.number().optional(),
        number: z.string(),
        icw: z.date(),
        ocd: z.date(),
        type: z.string(),
        deck: z.string(),
        market_deck: z.string(),
        products: z.array(z.any()),
      })
    )
    .optional(),
});

type OfferingType = {
  id?: number;
  number: string;
  icw: Date;
  ocd: Date;
  type: string;
  deck: string;
  market_deck: string;
  products: Array<{
    irc: string;
    currency: string;
    price: number;
    icp_cost: number;
    product_type: string;
    pref: string;
    grouping: string;
    material_description?: string;
    brand_id: string;
    sub_brand_id?: string;
  }>;
};

interface EditInnovationFormProps {
  innovationData: ExtendedInnovation;
  innovationId: string;
}

const EditInnovationForm = forwardRef<
  { submit: () => void; isSubmitting: boolean },
  EditInnovationFormProps
>(({ innovationData, innovationId }, ref) => {
  const navigate = useNavigate();
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNameInput, setReferenceNameInput] = useState("");
  const [referenceNames, setReferenceNames] = useState<string[]>([]);

  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState({
    internal_offering_deck: "",
    customer_offering_deck: "",
  });
  const [uploadingFiles, setUploadingFiles] = useState({
    internal_offering_deck: false,
    customer_offering_deck: false,
  });
  const [uploadedFileExtensions, setUploadedFileExtensions] = useState({
    internal_offering_deck: "",
    customer_offering_deck: "",
  });
  const [uploadedFileNames, setUploadedFileNames] = useState({
    internal_offering_deck: "",
    customer_offering_deck: "",
  });

  // Track form changes state
  const [hasChanges, setHasChanges] = useState(false);

  const form = useForm<FormValues>({
    validate: zodResolver(formSchema),
    initialValues: {
      status: "active",
      brand_id: "",
      sub_brand_id: "",
      year: new Date(),
      format: "",
      launch_name: "",
      reference_names: [],
      internal_offering_deck: "",
      customer_offering_deck: "",
      forecast_deadline: new Date(),
      offerings: [],
    },
  });

  const [{ data: brandsData }, { data: brandPillarsData }] = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: () => getBrands() },
      {
        queryKey: ["brandPillars", selectedBrandId],
        queryFn: () =>
          getBrandPillars({ filter: { brand_id: selectedBrandId } }),
        enabled: !!selectedBrandId,
      },
    ],
  });

  const updateInnovationMutation = useUpdateInnovation({
    mutationConfig: {
      onSuccess: () => {
        setIsSubmitting(false);
        navigate({ to: "/innovations" });
      },
      onError: () => {
        setIsSubmitting(false);
      },
    },
  });

  // File upload mutation
  const fileUploadMutation = useFileUpload({
    mutationConfig: {
      onSuccess: (response, variables) => {
        const fileTypeKey = variables.data.get("file_type") as keyof FormValues;
        const publicUrl = response?.data?.data?.public_url;
        const file = variables.data.get("file") as File;
        const originalFileName = file ? file.name : "";
        const fileExtension = originalFileName.split(".").pop()?.toLowerCase();

        if (publicUrl && fileTypeKey) {
          setUploadedFiles((prev) => ({
            ...prev,
            [fileTypeKey]: publicUrl,
          }));

          form.setFieldValue(fileTypeKey, publicUrl);

          setUploadedFileExtensions((prev) => ({
            ...prev,
            [fileTypeKey]: fileExtension || "",
          }));

          setUploadedFileNames((prev) => ({
            ...prev,
            [fileTypeKey]: originalFileName,
          }));
        }

        setUploadingFiles((prev) => ({
          ...prev,
          [fileTypeKey]: false,
        }));
      },
      onError: (error, variables) => {
        const fileType = variables.data.get("file_type") as string;
        console.error("File upload failed:", error);
        setUploadingFiles((prev) => ({
          ...prev,
          [fileType]: false,
        }));
      },
    },
  });

  // Expose submit function and isSubmitting state to parent via ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    isSubmitting,
  }));

  // File upload handler
  const handleFileUpload = (
    file: File,
    fileType: keyof typeof uploadedFiles
  ) => {
    if (!file) return;

    setUploadingFiles((prev) => ({
      ...prev,
      [fileType]: true,
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    fileUploadMutation.mutate({ data: formData });
  };

  const handleSubmit = () => {
    const validation = form.validate();
    if (Object.keys(validation.errors).length > 0) {
      console.log("Form validation errors:", validation.errors);
      return;
    }

    setIsSubmitting(true);
    const values = form.getValues();
    const { year, forecast_deadline, offerings, reference_names, ...toSubmit } =
      values;

    const submitData = {
      ...toSubmit,
      reference_names,
      // Use uploaded URLs from state, fallback to form values
      internal_offering_deck:
        uploadedFiles.internal_offering_deck || values.internal_offering_deck,
      customer_offering_deck:
        uploadedFiles.customer_offering_deck || values.customer_offering_deck,
      forecast_deadline: forecast_deadline.toISOString().split("T")[0],
      year: year?.getFullYear().toString(),
      offerings: offerings?.map((offering) => {
        return {
          ...offering,
          icw: offering.icw.toISOString().split("T")[0],
          ocd: offering.ocd.toISOString().split("T")[0],
        };
      }),
    };

    updateInnovationMutation.mutate({
      innovationId: parseInt(innovationId),
      data: submitData,
    });
  };

  // Helper function to get filename from URL (used for initial data)
  const getFileNameFromUrl = (url: string | null): string => {
    if (!url) return "";
    try {
      // Decode URI component to handle spaces or other encoded characters in the filename
      const decodedUrl = decodeURIComponent(url);
      const path = new URL(decodedUrl).pathname;
      return path.substring(path.lastIndexOf("/") + 1) || "download";
    } catch {
      // Fallback if URL is not valid or filename extraction fails
      return "download";
    }
  };

  // Initialize form with innovation data
  useEffect(() => {
    let isMounted = true;
    async function fetchOfferingsWithProducts() {
      if (innovationData) {
        const brandId = innovationData.brand.id.toString();
        // Handle reference names - can be string or array
        let initialFormReferenceNames: string[] = [];
        if (innovationData.reference_names) {
          if (Array.isArray(innovationData.reference_names)) {
            initialFormReferenceNames = innovationData.reference_names.filter(
              (ref) => typeof ref === "string"
            );
          } else if (typeof innovationData.reference_names === "string") {
            initialFormReferenceNames = [innovationData.reference_names];
          }
        }
        initialFormReferenceNames = initialFormReferenceNames
          .map((name) => name.trim())
          .filter((name) => name !== "");

        // Transform offerings data
        let transformedOfferings =
          innovationData.offerings?.map((offering) => ({
            id: offering.id,
            number: offering.number || "",
            icw: new Date(offering.icw),
            ocd: new Date(offering.ocd),
            type: offering.type || "",
            deck: offering.deck || "",
            market_deck: offering.market_deck || "",
            products: [] as Array<{
              irc: string;
              currency: string;
              price: number;
              icp_cost: number;
              product_type: string;
              pref: string;
              grouping: string;
              material_description?: string;
              brand_id: string;
              sub_brand_id?: string;
            }>,
          })) || [];

        // Fetch products for each offering if editing
        if (innovationData.offerings && innovationData.offerings.length > 0) {
          const productsResults = await Promise.all(
            innovationData.offerings.map(async (offering) => {
              try {
                const res = await getOfferingProducts(
                  innovationId,
                  offering.id
                );
                // Map API product to local product shape
                return (res.data || []).map((p) => ({
                  irc: p.irc,
                  currency: p.icp_eur ? "EUR" : "USD", // fallback logic, adjust as needed
                  price: Number(p.icp_eur || p.icp_usd || 0),
                  icp_cost: Number(p.icp_eur || p.icp_usd || 0),
                  product_type: p.product_type,
                  pref: p.pref,
                  grouping: String(p.grouping ?? ""),
                  material_description: p.material_description,
                  brand_id: p.brand?.id ? String(p.brand.id) : "",
                  sub_brand_id: p.brand_pillar?.id
                    ? String(p.brand_pillar.id)
                    : "",
                }));
              } catch {
                return [];
              }
            })
          );
          // Map products to each offering
          transformedOfferings = transformedOfferings.map((off, idx) => ({
            ...off,
            products: productsResults[idx] || [],
          }));
        }

        if (isMounted) {
          form.setValues({
            status: innovationData.status || "active",
            brand_id: brandId,
            sub_brand_id: innovationData.brand_pillar.id.toString(),
            year: new Date(parseInt(innovationData.year), 0, 1),
            format: innovationData.format || "",
            launch_name: innovationData.launch_name || "",
            reference_names: initialFormReferenceNames,
            internal_offering_deck: innovationData.internal_offering_deck || "",
            customer_offering_deck: innovationData.customer_offering_deck || "",
            forecast_deadline: new Date(innovationData.forecast_deadline),
            offerings: transformedOfferings,
          });

          setSelectedBrandId(brandId);
          setReferenceNames(initialFormReferenceNames);
          setHasChanges(false);

          // Reset uploaded file states
          setUploadedFiles({
            internal_offering_deck: innovationData.internal_offering_deck || "",
            customer_offering_deck: innovationData.customer_offering_deck || "",
          });

          setUploadedFileExtensions({
            internal_offering_deck:
              innovationData.internal_offering_deck
                ?.split(".")
                .pop()
                ?.toLowerCase() || "",
            customer_offering_deck:
              innovationData.customer_offering_deck
                ?.split(".")
                .pop()
                ?.toLowerCase() || "",
          });

          setUploadedFileNames({
            internal_offering_deck: getFileNameFromUrl(
              innovationData.internal_offering_deck ?? null
            ),
            customer_offering_deck: getFileNameFromUrl(
              innovationData.customer_offering_deck ?? null
            ),
          });
        }
      }
    }
    fetchOfferingsWithProducts();
    return () => {
      isMounted = false;
    };
  }, [innovationData, innovationId]);

  // Track form changes
  useEffect(() => {
    if (innovationData) {
      // Determine original reference names using the same logic as form initialization
      let originalReferenceNamesForComparison: string[] = [];
      if (innovationData.reference_names) {
        if (Array.isArray(innovationData.reference_names)) {
          originalReferenceNamesForComparison =
            innovationData.reference_names.filter(
              (ref) => typeof ref === "string"
            );
        } else if (typeof innovationData.reference_names === "string") {
          originalReferenceNamesForComparison = [
            innovationData.reference_names,
          ];
        }
      }
      originalReferenceNamesForComparison = originalReferenceNamesForComparison
        .map((name) => name.trim())
        .filter((name) => name !== "");

      const hasFormChanges =
        form.values.status !== (innovationData.status || "active") ||
        form.values.brand_id !== innovationData.brand.id.toString() ||
        form.values.sub_brand_id !==
          innovationData.brand_pillar.id.toString() ||
        form.values.year.getFullYear() !== parseInt(innovationData.year) ||
        form.values.format !== (innovationData.format || "") ||
        form.values.launch_name !== (innovationData.launch_name || "") ||
        JSON.stringify(
          form.values.reference_names
            .map((name) => name.trim())
            .filter((name) => name !== "")
            .sort()
        ) !== JSON.stringify(originalReferenceNamesForComparison.sort()) ||
        form.values.forecast_deadline.toISOString().split("T")[0] !==
          innovationData.forecast_deadline ||
        form.values.internal_offering_deck !==
          (innovationData.internal_offering_deck || "") ||
        form.values.customer_offering_deck !==
          (innovationData.customer_offering_deck || "");

      setHasChanges(hasFormChanges);
    }
  }, [form.values, innovationData]);

  const resetForm = () => {
    if (innovationData) {
      const brandId = innovationData.brand.id.toString();

      // Determine initial reference names using the same logic as form initialization
      let initialFormReferenceNames: string[] = [];
      if (innovationData.reference_names) {
        if (Array.isArray(innovationData.reference_names)) {
          initialFormReferenceNames = innovationData.reference_names.filter(
            (ref) => typeof ref === "string"
          );
        } else if (typeof innovationData.reference_names === "string") {
          initialFormReferenceNames = [innovationData.reference_names];
        }
      }
      initialFormReferenceNames = initialFormReferenceNames
        .map((name) => name.trim())
        .filter((name) => name !== "");

      const transformedOfferings =
        innovationData.offerings?.map((offering) => ({
          id: offering.id,
          number: offering.number || "",
          icw: new Date(offering.icw),
          ocd: new Date(offering.ocd),
          type: offering.type || "",
          deck: offering.deck || "",
          market_deck: offering.market_deck || "",
          products: [] as Array<{
            irc: string;
            currency: string;
            price: number;
            icp_cost: number;
            product_type: string;
            pref: string;
            grouping: string;
            material_description?: string;
            brand_id: string;
            sub_brand_id?: string;
          }>,
        })) || [];

      form.setValues({
        status: innovationData.status || "active",
        brand_id: brandId,
        sub_brand_id: innovationData.brand_pillar.id.toString(),
        year: new Date(parseInt(innovationData.year), 0, 1),
        format: innovationData.format || "",
        launch_name: innovationData.launch_name || "",
        reference_names: initialFormReferenceNames,
        internal_offering_deck: innovationData.internal_offering_deck || "",
        customer_offering_deck: innovationData.customer_offering_deck || "",
        forecast_deadline: new Date(innovationData.forecast_deadline),
        offerings: transformedOfferings,
      });

      setSelectedBrandId(brandId);
      setReferenceNames(initialFormReferenceNames);
      setHasChanges(false);

      // Reset uploaded file states
      setUploadedFiles({
        internal_offering_deck: innovationData.internal_offering_deck || "",
        customer_offering_deck: innovationData.customer_offering_deck || "",
      });

      setUploadedFileExtensions({
        internal_offering_deck:
          innovationData.internal_offering_deck
            ?.split(".")
            .pop()
            ?.toLowerCase() || "",
        customer_offering_deck:
          innovationData.customer_offering_deck
            ?.split(".")
            .pop()
            ?.toLowerCase() || "",
      });
      setUploadedFileNames({
        internal_offering_deck: getFileNameFromUrl(
          innovationData.internal_offering_deck ?? null
        ),
        customer_offering_deck: getFileNameFromUrl(
          innovationData.customer_offering_deck ?? null
        ),
      });
    }
  };

  // Handle brand change to clear sub_brand_id and update selected brand
  const handleBrandChange = (brandId: string | null) => {
    const newBrandId = brandId || "";
    form.setFieldValue("brand_id", newBrandId);
    // Always reset brand pillar when brand changes
    form.setFieldValue("sub_brand_id", "");
    // Clear any existing validation errors for sub_brand_id
    form.clearFieldError("sub_brand_id");
    setSelectedBrandId(newBrandId);
  };

  // Handle adding reference name
  const handleAddReferenceName = () => {
    if (referenceNameInput.trim()) {
      const newNames = [...referenceNames, referenceNameInput.trim()];
      setReferenceNames(newNames);
      form.setFieldValue("reference_name", newNames);
      setReferenceNameInput("");
    }
  };

  // Handle removing reference name
  const handleRemoveReferenceName = (index: number) => {
    const newNames = referenceNames.filter((_, i) => i !== index);
    setReferenceNames(newNames);
    form.setFieldValue("reference_name", newNames);
  };

  // Offering management handlers
  const handleAddOffering = (offering: OfferingType) => {
    if (form.getValues().offerings?.length) {
      form.insertListItem("offerings", offering);
    } else {
      form.setFieldValue("offerings", [offering]);
    }
  };

  const handleEditOffering = (index: number, offering: OfferingType) => {
    form.setFieldValue(`offerings.${index}`, offering);
  };

  const handleDeleteOffering = (index: number) => {
    form.removeListItem("offerings", index);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className="bg-white rounded-2xl px-6 mt-6">
        <FormSection title="General details">
          <div className="mb-6">
            <Select
              {...form.getInputProps("status")}
              label="Status"
              placeholder="Select status"
              data={[
                { value: "active", label: "Active" },
                { value: "cancelled", label: "Cancelled" },
                { value: "archived", label: "Archived" },
              ]}
              rightSection={<ChevronDownIcon />}
              classNames={selectStyles}
              className="w-full max-w-md"
            />
          </div>
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
              <Select
                value={form.getValues().brand_id}
                onChange={handleBrandChange}
                error={form.errors.brand_id}
                placeholder="Select brand"
                label="Brand"
                data={
                  brandsData?.data?.map((brand) => ({
                    value: brand.id.toString(),
                    label: brand.name,
                  })) || []
                }
                rightSection={<ChevronDownIcon />}
                classNames={selectStyles}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <Select
                value={form.getValues().sub_brand_id}
                onChange={(value) =>
                  form.setFieldValue("sub_brand_id", value || "")
                }
                error={form.errors.sub_brand_id}
                placeholder="Select brand pillar"
                label="Brand pillar"
                disabled={
                  form.getValues().brand_id === "" ||
                  brandPillarsData?.data.length === 0
                }
                data={
                  brandPillarsData?.data?.map((pillar) => ({
                    value: pillar.id.toString(),
                    label: pillar.name,
                  })) || []
                }
                rightSection={<ChevronDownIcon />}
                classNames={selectStyles}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <YearPickerInput
                label="Year"
                {...form.getInputProps("year")}
                placeholder="Select year"
                valueFormat="YYYY"
                classNames={selectStyles}
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <Select
                {...form.getInputProps("format")}
                placeholder="Select format"
                label="Format"
                data={[
                  { label: "Format 1", value: "format1" },
                  { label: "Format 2", value: "format2" },
                ]}
                rightSection={<ChevronDownIcon />}
                classNames={selectStyles}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <TextInput
                {...form.getInputProps("launch_name")}
                placeholder="Enter launch name"
                label="Launch name"
                classNames={textInputStyles}
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <DateInput
                {...form.getInputProps("forecast_deadline")}
                label="Forecast deadline"
                valueFormat="YYYY MMM DD"
                placeholder="Select forecast deadline"
                rightSection={<DateIcon />}
                classNames={textInputStyles}
              />
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <FormField label="Add reference names (Optional)">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <TextInput
                      value={referenceNameInput}
                      onChange={(e) => setReferenceNameInput(e.target.value)}
                      placeholder="Enter reference name"
                      classNames={textInputStyles}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddReferenceName();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddReferenceName}
                      className="bg-primary hover:bg-primary/90 text-white px-6"
                      disabled={!referenceNameInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {referenceNames && referenceNames.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {referenceNames.map((name, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 bg-[#2563eb] text-white px-3 py-1.5 rounded-full text-sm font-medium"
                        >
                          <span>{name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReferenceName(index)}
                            className="hover:bg-[#1d4ed8] rounded-full p-0.5 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>
            </Grid.Col>
            <Grid.Col
              span={{
                sm: 6,
                base: 12,
              }}
            >
              <div className="flex flex-col gap-6">
                <FormField label="Internal offering deck">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, "internal_offering_deck");
                          }
                        }}
                        style={{ display: "none" }}
                        id="internal_offering_deck_input"
                      />
                      <Button
                        type="button"
                        variant="filled"
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() =>
                          document
                            .getElementById("internal_offering_deck_input")
                            ?.click()
                        }
                        disabled={uploadingFiles.internal_offering_deck}
                        leftSection={
                          uploadingFiles.internal_offering_deck ? null : (
                            <Upload size={16} />
                          )
                        }
                      >
                        {uploadingFiles.internal_offering_deck
                          ? "Uploading..."
                          : "Upload"}
                      </Button>
                    </div>
                    {uploadedFiles.internal_offering_deck && (
                      <div className="flex items-center gap-2 text-sm">
                        <a
                          href={uploadedFiles.internal_offering_deck}
                          download={uploadedFileNames.internal_offering_deck}
                          className="text-blue-600 hover:underline cursor-pointer"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          internal_offering_deck.
                          {uploadedFileExtensions.internal_offering_deck}
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFiles((prev) => ({
                              ...prev,
                              internal_offering_deck: "",
                            }));
                            setUploadedFileExtensions((prev) => ({
                              ...prev,
                              internal_offering_deck: "",
                            }));
                            setUploadedFileNames((prev) => ({
                              ...prev,
                              internal_offering_deck: "",
                            }));
                            form.setFieldValue("internal_offering_deck", "");
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="Offering deck for customers">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, "customer_offering_deck");
                          }
                        }}
                        style={{ display: "none" }}
                        id="customer_offering_deck_input"
                      />
                      <Button
                        type="button"
                        variant="filled"
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() =>
                          document
                            .getElementById("customer_offering_deck_input")
                            ?.click()
                        }
                        disabled={uploadingFiles.customer_offering_deck}
                        leftSection={
                          uploadingFiles.customer_offering_deck ? null : (
                            <Upload size={16} />
                          )
                        }
                      >
                        {uploadingFiles.customer_offering_deck
                          ? "Uploading..."
                          : "Upload"}
                      </Button>
                    </div>
                    {uploadedFiles.customer_offering_deck && (
                      <div className="flex items-center gap-2 text-sm">
                        <a
                          href={uploadedFiles.customer_offering_deck}
                          download={uploadedFileNames.customer_offering_deck}
                          className="text-blue-600 hover:underline cursor-pointer"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          customer_offering_deck.
                          {uploadedFileExtensions.customer_offering_deck}
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFiles((prev) => ({
                              ...prev,
                              customer_offering_deck: "",
                            }));
                            setUploadedFileExtensions((prev) => ({
                              ...prev,
                              customer_offering_deck: "",
                            }));
                            setUploadedFileNames((prev) => ({
                              ...prev,
                              customer_offering_deck: "",
                            }));
                            form.setFieldValue("customer_offering_deck", "");
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </FormField>
              </div>
            </Grid.Col>
          </Grid>
        </FormSection>
      </div>

      <OfferingTable
        offerings={form.getValues().offerings || []}
        onAdd={handleAddOffering}
        onEdit={handleEditOffering}
        onDelete={handleDeleteOffering}
        innovationId={innovationId}
      />
    </form>
  );
});

export default EditInnovationForm;
