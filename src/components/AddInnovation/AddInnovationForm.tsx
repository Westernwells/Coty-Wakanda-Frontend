import { getBrandPillars } from "@/api/get-brandPillars";
import { getBrands } from "@/api/get-brands";
import { useAddInnovation } from "@/api/innovations/add-innovation";
import { useUpdateInnovation } from "@/api/innovations/update-innovation";
import { useFileUpload } from "@/api/products/upload-document";
import { Innovation } from "@/types";
import { Button, Grid, Group, Select, TextInput } from "@mantine/core";
import { YearPickerInput, DateInput } from "@mantine/dates";
import { useForm, UseFormReturnType, zodResolver } from "@mantine/form";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { X, Upload, Save } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { z } from "zod";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import ExitIcon from "../Icons/ExitIcon";
import { FormField } from "../Shared/Form/Field";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import OfferingTable from "./OfferingTable";
import {
  AddProductToOfferingModal,
  OfferingProductFormValues,
} from "./AddProductToOfferingModal";

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

const AddInnovationForm = forwardRef<
  { submit: () => void; isSubmitting: boolean },
  {
    isEdit?: boolean;
    formData?: Innovation;
    innovationId?: string;
    form?: UseFormReturnType<FormValues>;
  }
>(({ isEdit = false, formData, innovationId, form: externalForm }, ref) => {
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

  // Track form changes state
  const [hasChanges, setHasChanges] = useState(false);

  // Add at the top of the component
  const [products, setProducts] = useState<OfferingProductFormValues[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null
  );
  const [isOfferingProductModalOpen, setIsOfferingProductModalOpen] =
    useState(false);
  const [targetOfferingIndex, setTargetOfferingIndex] = useState<number | null>(
    null
  );

  // Initialize form if not provided externally
  const internalForm = useForm<FormValues>({
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

  // Use external form if provided, otherwise use internal form
  const form = externalForm || internalForm;

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

  const addInnovationMutation = useAddInnovation({
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
        const fileType = variables.data.get("file_type") as string;
        const publicUrl = response?.data?.data?.public_url;

        if (publicUrl && fileType) {
          setUploadedFiles((prev) => ({
            ...prev,
            [fileType]: publicUrl,
          }));

          // Update form value
          form.setFieldValue(fileType as keyof FormValues, publicUrl);
        }

        setUploadingFiles((prev) => ({
          ...prev,
          [fileType]: false,
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

    if (isEdit && innovationId) {
      updateInnovationMutation.mutate({
        innovationId: parseInt(innovationId),
        data: submitData,
      });
    } else {
      addInnovationMutation.mutate({ data: submitData });
    }
  };

  // Set form values when editing
  useEffect(() => {
    if (formData && isEdit) {
      const brandId = formData.brand.id.toString();
      const existingReferenceNames = formData.launch_ref
        ? [formData.launch_ref]
        : [];

      form.setValues({
        status: "active",
        brand_id: brandId,
        sub_brand_id: formData.brand_pillar.id.toString(),
        year: new Date(parseInt(formData.year), 0, 1),
        format: formData.format,
        launch_name: formData.launch_name,
        reference_names: existingReferenceNames,
        internal_offering_deck: "",
        customer_offering_deck: "",
        forecast_deadline: new Date(formData.forecast_deadline),
        offerings: [],
      });
      setSelectedBrandId(brandId);
      setReferenceNames(existingReferenceNames);
      setHasChanges(false);

      // Reset uploaded file states
      setUploadedFiles({
        internal_offering_deck: "",
        customer_offering_deck: "",
      });
    }
  }, [formData, isEdit]);

  // Track form changes
  useEffect(() => {
    if (isEdit && formData) {
      const hasFormChanges =
        form.values.status !== "active" || // Default status
        form.values.brand_id !== formData.brand.id.toString() ||
        form.values.sub_brand_id !== formData.brand_pillar.id.toString() ||
        form.values.year.getFullYear() !== parseInt(formData.year) ||
        form.values.format !== formData.format ||
        form.values.launch_name !== formData.launch_name ||
        JSON.stringify(form.values.reference_names) !==
          JSON.stringify(formData.launch_ref ? [formData.launch_ref] : []) ||
        form.values.forecast_deadline.toISOString().split("T")[0] !==
          formData.forecast_deadline;

      setHasChanges(hasFormChanges);
    }
  }, [form.values, formData, isEdit]);

  const resetForm = () => {
    if (formData && isEdit) {
      const brandId = formData.brand.id.toString();
      const existingReferenceNames = formData.launch_ref
        ? [formData.launch_ref]
        : [];

      form.setValues({
        status: "active",
        brand_id: brandId,
        sub_brand_id: formData.brand_pillar.id.toString(),
        year: new Date(parseInt(formData.year), 0, 1),
        format: formData.format,
        launch_name: formData.launch_name,
        reference_names: existingReferenceNames,
        internal_offering_deck: "",
        customer_offering_deck: "",
        forecast_deadline: new Date(formData.forecast_deadline),
        offerings: [],
      });
      setSelectedBrandId(brandId);
      setReferenceNames(existingReferenceNames);
      setHasChanges(false);

      // Reset uploaded file states
      setUploadedFiles({
        internal_offering_deck: "",
        customer_offering_deck: "",
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
      form.setFieldValue("reference_names", newNames);
      setReferenceNameInput("");
      console.log("Added reference name:", referenceNameInput.trim());
    }
  };

  // Handle removing reference name
  const handleRemoveReferenceName = (index: number) => {
    const newNames = referenceNames.filter((_, i) => i !== index);
    setReferenceNames(newNames);
    form.setFieldValue("reference_names", newNames);
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

  function handleAddProduct(product: OfferingProductFormValues) {
    setProducts((prev) => [...prev, product]);
    setIsProductModalOpen(false);
  }

  function handleEditProduct(
    index: number,
    updatedProduct: OfferingProductFormValues
  ) {
    setProducts((prev) =>
      prev.map((p, i) => (i === index ? updatedProduct : p))
    );
    setEditingProductIndex(null);
    setIsProductModalOpen(false);
  }

  function handleDeleteProduct(index: number) {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  }

  function handleOpenOfferingProductModal(offeringIndex: number) {
    setTargetOfferingIndex(offeringIndex);
    setIsOfferingProductModalOpen(true);
  }

  function handleCloseOfferingProductModal() {
    setIsOfferingProductModalOpen(false);
    setTargetOfferingIndex(null);
  }

  function handleAddProductToOffering(product: OfferingProductFormValues) {
    if (targetOfferingIndex === null) return;

    const offerings = form.getValues().offerings || [];
    const offeringToUpdate = offerings[targetOfferingIndex];

    if (!offeringToUpdate) return;

    const updatedProducts = [
      ...(offeringToUpdate.products || []),
      {
        irc: product.irc,
        currency: product.currency,
        price: Number(product.icp_cost),
        icp_cost: Number(product.icp_cost),
        product_type: product.product_type,
        pref: product.pref,
        grouping: product.grouping,
        material_description: product.material_description,
        brand_id: product.brand_id,
        sub_brand_id: product.sub_brand_id,
      },
    ];

    const updatedOffering = {
      ...offeringToUpdate,
      products: updatedProducts,
    };

    // Replace the offerings array with a new array to ensure reactivity
    const updatedOfferings = offerings.map((off, idx) =>
      idx === targetOfferingIndex ? updatedOffering : off
    );

    form.setFieldValue("offerings", updatedOfferings);

    setIsOfferingProductModalOpen(false);
    setTargetOfferingIndex(null);
  }

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {!isEdit ? (
          <div className="flex justify-end items-center mb-6">
            <Group gap={10}>
              {
                <Button
                  variant="outline"
                  className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  leftSection={<ExitIcon />}
                  onClick={() => {
                    resetForm();
                    navigate({ to: "/innovations" });
                  }}
                >
                  Cancel
                </Button>
              }
              <Button
                leftSection={<Save className="size-4" />}
                type="submit"
                variant="outline"
                className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 hover:bg-opacity-40 transition-all ease-in-out duration-300"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Innovation"}
              </Button>
            </Group>
          </div>
        ) : null}
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
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <span>File uploaded successfully</span>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFiles((prev) => ({
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
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <span>File uploaded successfully</span>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFiles((prev) => ({
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
          onOpenProductModal={handleOpenOfferingProductModal}
          innovationId={innovationId}
        />
      </form>

      {/* Add Product Button and Modal */}
      <div className="my-6">
        {/* <Button
          type="button"
          variant="outline"
          className="border-primary bg-transparent border-2 text-primary text-sm font-medium px-4 py-2 hover:bg-primary hover:text-white transition-all duration-300"
          onClick={() => {
            setEditingProductIndex(null);
            setIsProductModalOpen(true);
          }}
        >
          Add Product
        </Button> */}
        <AddProductToOfferingModal
          opened={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSubmit={
            editingProductIndex === null
              ? handleAddProduct
              : (product: OfferingProductFormValues) =>
                  handleEditProduct(editingProductIndex as number, product)
          }
        />
        <AddProductToOfferingModal
          opened={isOfferingProductModalOpen}
          onClose={handleCloseOfferingProductModal}
          onSubmit={handleAddProductToOffering}
        />
        <ul>
          {products.map((product, idx) => (
            <li key={idx}>
              {product.irc} - {product.material_description}
              <Button
                type="button"
                onClick={() => {
                  setEditingProductIndex(idx);
                  setIsProductModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button type="button" onClick={() => handleDeleteProduct(idx)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
});

export default AddInnovationForm;
