import { useFileUpload } from "@/api/products/upload-document";
import { dateToLocalString } from "@/lib/utils";
import {
  Button,
  Grid,
  Table,
  Modal,
  Collapse,
  TextInput,
  Select,
  Group,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  PlusIcon,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  Pencil,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import { FormField } from "../Shared/Form/Field";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { MasterDistributor } from "@/types";
import { getOfferingProducts } from "@/api/products/get-offering-products";
import { deleteOfferingProducts } from "@/api/products/delete-offering-product";

// Placeholder imports - actual components might have different props/structure
import InnovationProductsTable from "./InnovationProductsTable";
import InnovationDistributorPrices from "./InnovationDistributorPrices";
import { Product, Meta, Filters } from "@/types";
import {
  AddProductToOfferingModal,
  OfferingProductFormValues,
} from "./AddProductToOfferingModal"; // Import the new modal
import { PriceBenchmark as ImportedPriceBenchmark } from "@/types";

// Updated to match OfferingProductFormValues in the modal
interface OfferingProductData {
  irc: string;
  material_description?: string;
  icp_cost: number; // Modal now ensures this is a number
  price: number; // Add price field for compatibility
  currency: "EUR" | "USD";
  brand_id: string;
  sub_brand_id?: string;
  product_type: "saleable" | "non-saleable";
  pref: "pref" | "non-pref";
  grouping: "1" | "2" | "3";
}

interface Offering {
  id?: number;
  number: string;
  icw: Date;
  ocd: Date;
  type: string;
  deck: string;
  market_deck: string;
  products: Array<{
    irc: string;
    price: number;
    currency: string;
    icp_cost: number;
    product_type: string;
    pref: string;
    grouping: string;
    material_description?: string;
    brand_id: string;
    sub_brand_id?: string;
  }>;
  // Add mock data fields if needed for ProductsTable and DistributorPrices
  // For example:
  // associatedProducts?: Product[];
  // associatedDistributors?: MasterDistributor[];
}

interface OfferingTableProps {
  offerings: Offering[];
  onAdd: (offering: Offering) => void;
  onEdit: (index: number, offering: Offering) => void;
  onDelete: (index: number) => void;
  onOpenProductModal?: (offeringIndex: number) => void;
  innovationId?: string | number;
}

// Define interface for mapped product (from EditInnovationForm mapping)
interface OfferingMappedProduct {
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
}

const BRAND_TYPE_MASS = "Mass" as const;

interface PriceBenchmark {
  brand_id: string;
  product_id: string;
  index_value: number;
  comment: string;
}

interface DistributorPrice {
  irc: string;
  billing_price: number;
  rrsp: number;
}

interface DistributorData {
  id: number;
  name: string;
  data: DistributorPrice[];
}

interface OfferingProductResponse {
  id: number;
  name: string;
  irc: string;
  pref: string;
  product_type: string;
  brand_id: string;
  currency: "EUR" | "USD";
  icp_cost: number;
  material_description?: string;
  distributor_pricing: Array<{
    irc: string;
    billing_price: string;
    rrsp: string;
  }>;
}

interface DistributorPricing {
  irc: string;
  billing_price: string;
  rrsp: string;
}

const OfferingTable: React.FC<OfferingTableProps> = ({
  offerings,
  onAdd,
  onEdit,
  onDelete,
  onOpenProductModal,
  innovationId,
}): JSX.Element => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [offeringForm, setOfferingForm] = useState({
    number: "",
    deadline: new Date(),
    icw: new Date(),
    ocd: new Date(),
    type: "",
    deck: "",
    market_deck: "",
  });

  // State for nested tables - we need an array of states, one for each offering row
  // This approach might get complex if offerings can be reordered or many are expanded.
  // Consider a more robust state management if needed.
  const [productsTableStates, setProductsTableStates] = useState<
    Array<{ isEdit: boolean }>
  >([]);
  const [distributorPricesStates, setDistributorPricesStates] = useState<
    Array<{
      selectedRow: string | null;
      scrollTop: number;
      scrollSource: "product" | "distributor" | null;
    }>
  >([]);

  // State for product modal and which offering is targeted
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [targetOfferingIndex, setTargetOfferingIndex] = useState<number | null>(
    null
  );

  // Add state for fetched products per offering
  const [offeringProducts, setOfferingProducts] = useState<
    Record<number, OfferingMappedProduct[]>
  >({});
  const [offeringDistributors, setOfferingDistributors] = useState<
    Record<number, DistributorData[]>
  >({});
  const [loadingOfferings, setLoadingOfferings] = useState<Set<number>>(
    new Set()
  );

  // Add state for brand options
  const [brandOptions, setBrandOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [brandPillarOptions, setBrandPillarOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // Add state for selected products
  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, number[]>
  >({});
  const [isDeletingProducts, setIsDeletingProducts] = useState(false);

  // Initialize states when offerings change
  useEffect(() => {
    setProductsTableStates(offerings.map(() => ({ isEdit: false })));
    setDistributorPricesStates(
      offerings.map(() => ({
        selectedRow: null,
        scrollTop: 0,
        scrollSource: null,
      }))
    );
  }, [offerings]);

  // File upload mutation
  const fileUploadMutation = useFileUpload({
    mutationConfig: {
      onSuccess: (response, variables) => {
        const fileType = variables.data.get("file_type") as string;
        const publicUrl = response?.data?.data?.public_url;

        if (publicUrl && fileType) {
          setOfferingForm((prev) => ({
            ...prev,
            [fileType]: publicUrl,
          }));
        }
      },
      onError: (error) => {
        console.error("File upload failed:", error);
      },
    },
  });

  const resetForm = () => {
    setOfferingForm({
      number: "",
      deadline: new Date(),
      icw: new Date(),
      ocd: new Date(),
      type: "",
      deck: "",
      market_deck: "",
    });
  };

  const handleAddOffering = () => {
    setModalMode("add");
    setEditingIndex(null);
    resetForm();
    openModal();
  };

  const handleEditOffering = (index: number) => {
    const offering = offerings[index];
    setModalMode("edit");
    setEditingIndex(index);
    setOfferingForm({
      number: offering.number,
      deadline: offering.icw, // Using ICW as deadline for now
      icw: offering.icw,
      ocd: offering.ocd,
      type: offering.type,
      deck: offering.deck,
      market_deck: offering.market_deck,
    });
    openModal();
  };

  const handleDeleteOffering = (index: number) => {
    setDeletingIndex(index);
    openDeleteModal();
  };

  const confirmDeleteOffering = () => {
    if (deletingIndex !== null) {
      onDelete(deletingIndex);
      setDeletingIndex(null);
      closeDeleteModal();
    }
  };

  const handleSubmitOffering = () => {
    const newOffering: Offering = {
      id:
        modalMode === "add"
          ? Date.now()
          : editingIndex !== null
            ? offerings[editingIndex].id
            : Date.now(), // Temporary ID for new offerings
      number: offeringForm.number,
      icw: offeringForm.icw,
      ocd: offeringForm.ocd,
      type: offeringForm.type,
      deck: offeringForm.deck,
      market_deck: offeringForm.market_deck,
      products: [],
    };

    if (modalMode === "edit" && editingIndex !== null) {
      onEdit(editingIndex, newOffering);
    } else {
      onAdd(newOffering);
    }

    resetForm();
    closeModal();
  };

  const toggleRow = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleFileUpload = (file: File, fileType: "deck" | "market_deck") => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    fileUploadMutation.mutate({ data: formData });
  };

  // Handler to open product modal for a specific offering
  function handleOpenProductModal(index: number) {
    setTargetOfferingIndex(index);
    setIsProductModalOpen(true);
  }

  // Update the handleAddProductToOffering function
  function handleAddProductToOffering(
    product: Omit<OfferingProductFormValues, "icp_cost"> & { icp_cost: number }
  ) {
    if (targetOfferingIndex === null) return;

    // Map modal product to OfferingProductData shape
    const productWithPrice: OfferingProductData = {
      irc: product.irc,
      material_description: product.material_description,
      icp_cost: product.icp_cost,
      price: product.icp_cost,
      currency: product.currency,
      brand_id: product.brand_id,
      sub_brand_id: product.sub_brand_id,
      product_type: product.product_type,
      pref: product.pref,
      grouping: product.grouping,
    };

    // Get the current offering
    const currentOffering = offerings[targetOfferingIndex];

    if (!currentOffering || !currentOffering.id) return;

    // Update the offeringProducts state
    setOfferingProducts((prev) => ({
      ...prev,
      [currentOffering.id as number]: [
        ...(prev[currentOffering.id as number] || []),
        productWithPrice,
      ],
    }));

    // Update the offerings array with the new product
    const updatedOffering = {
      ...currentOffering,
      products: [...(currentOffering.products || []), productWithPrice],
    };

    // Call onEdit to update the parent component's state
    onEdit(targetOfferingIndex, updatedOffering);

    // Close the modal and reset the target index
    setIsProductModalOpen(false);
    setTargetOfferingIndex(null);
  }

  // Update toggleRow to fetch products if not already fetched
  async function handleExpandRow(index: number, offeringId: number) {
    toggleRow(index);

    // Initialize empty arrays for new offerings
    if (!offeringProducts[offeringId]) {
      setOfferingProducts((prev) => ({
        ...prev,
        [offeringId]: [],
      }));
      setOfferingDistributors((prev) => ({
        ...prev,
        [offeringId]: [],
      }));
    }

    // Only fetch from API if we have an innovationId and it's not a temporary ID
    if (innovationId && offeringId) {
      setLoadingOfferings((prev) => new Set(prev).add(offeringId));
      try {
        const response = await getOfferingProducts(innovationId, offeringId);
        console.log("response", response);
        console.log("innovationId", innovationId);
        console.log("offeringId", offeringId);
        const { products, distributors } = response.data;

        // Map products to the format expected by the component
        const mappedProducts: OfferingMappedProduct[] = products.map((p) => ({
          irc: p.irc || "",
          currency: p.icp_eur ? "EUR" : p.icp_usd ? "USD" : "EUR",
          price: Number(p.icp_eur || p.icp_usd || 0),
          icp_cost: Number(p.icp_eur || p.icp_usd || 0),
          product_type: p.article_type || "",
          pref: "non-pref",
          grouping: p.group || "1",
          material_description: p.description || "",
          brand_id: "",
          sub_brand_id: "",
        }));

        // Map distributors to the format expected by the component
        const distributorsData = distributors.map((d) => ({
          id: d.id,
          name: d.name,
          data: d.data.map((pricing) => ({
            irc: pricing.irc,
            billing_price: Number(pricing.billing_price || 0),
            rrsp: Number(pricing.rrsp || 0),
          })),
        }));

        setOfferingProducts((prev) => ({
          ...prev,
          [offeringId]: mappedProducts,
        }));

        setOfferingDistributors((prev) => ({
          ...prev,
          [offeringId]: distributorsData,
        }));
      } catch (error) {
        console.error("Error fetching offering products:", error);
      } finally {
        setLoadingOfferings((prev) => {
          const newSet = new Set(prev);
          newSet.delete(offeringId);
          return newSet;
        });
      }
    }
  }

  // Update OfferingProductsTable to accept products as a prop
  interface OfferingProductsTableProps {
    products: OfferingMappedProduct[];
    productsTableStates: Array<{ isEdit: boolean }>;
    setProductsTableStates: React.Dispatch<
      React.SetStateAction<Array<{ isEdit: boolean }>>
    >;
    index: number;
  }
  function OfferingProductsTable({
    products,
    productsTableStates,
    setProductsTableStates,
    index,
    offeringId,
  }: OfferingProductsTableProps & { offeringId: number }) {
    // Map OfferingMappedProduct[] to Product[]
    const mappedProducts = products.map((p, i) => ({
      id: i + 1,
      pref: p.pref,
      product_type: p.product_type,
      brand_pillar: { id: 0, name: "" },
      grouping: Number(p.grouping),
      price: String(p.price),
      launch_date: new Date(),
      discontinue_date: new Date(),
      offering_number: "",
      irc: p.irc,
      sku: p.irc,
      material_description: p.material_description || "",
      ean_upc: "",
      house: "",
      line: "",
      line_id: "",
      line_number: "",
      article_type: p.product_type,
      article_sub_type: "",
      division: "",
      segment: { id: 0, name: "", created_at: "" },
      icp_eur: p.currency === "EUR" ? String(p.icp_cost) : "0",
      icp_usd: p.currency === "USD" ? String(p.icp_cost) : "0",
      factory: "",
      commodity_id: "",
      gender: "",
      size: "",
      length: "",
      height: "",
      width: "",
      volume: "",
      gross_weight: "",
      net_weight: "",
      units: "",
      created_at: "",
      brand: {
        id: Number(p.brand_id) || 0,
        brand_type_id: 0,
        name: "",
        active: true,
        type: BRAND_TYPE_MASS,
        created_at: "",
        updated_at: "",
        deleted_at: null,
        pivot: {
          distributor_id: 0,
          brand_id: Number(p.brand_id) || 0,
        },
      },
      pricing: {
        distributor_id: 0,
        icp_usd: p.currency === "USD" ? p.icp_cost : 0,
        icp_eur: p.currency === "EUR" ? p.icp_cost : 0,
        french_usd: null,
        french_eur: null,
        rrsp: null,
        regional_billing_price: null,
        c1: null,
        cssp: null,
        status: "",
      },
      category: { id: 0, name: "", created_at: "" },
      country: {
        id: 0,
        name: "",
        official_name: "",
        iso2: "",
        iso3: "",
        flag_url: "",
        created_at: "",
      },
      market: null,
      subcategory: { id: 0, name: "", created_at: "" },
      price_benchmark: null,
      documents: [],
      distributor_pricing: [],
      gmm_category: { id: 0, name: "", created_at: "" },
      gmm_subCategory: { id: 0, name: "", created_at: "" },
      gmm_market: { id: 0, name: "", created_at: "" },
      gmm_segment: { id: 0, name: "", created_at: "" },
    }));
    return (
      <InnovationProductsTable
        products={mappedProducts}
        isEdit={productsTableStates[index]?.isEdit || false}
        setIsEdit={(isEditValue) => {
          const newStates = [...productsTableStates];
          if (newStates[index]) {
            newStates[index].isEdit =
              typeof isEditValue === "function"
                ? isEditValue(newStates[index].isEdit)
                : isEditValue;
            setProductsTableStates(newStates);
          }
        }}
        onProductSelect={handleProductSelect}
        brandOptions={brandOptions}
        brandPillarOptions={brandPillarOptions}
        onBulkUpdate={(products) => {
          console.log("Bulk update:", products);
        }}
        selectedProducts={selectedProducts[offeringId] || []}
        onSelectedProductsChange={(productIds) => {
          setSelectedProducts((prev) => ({
            ...prev,
            [offeringId]: productIds,
          }));
        }}
      />
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  // Infinite scroll state for distributor prices
  const PAGE_SIZE = 20;
  const [currentDistributorPrices, setCurrentDistributorPrices] = useState<
    DistributorPrice[]
  >([]);

  // Update prices when distributor changes
  useEffect(() => {
    if (distributorPricesStates[currentIndex]?.selectedRow) {
      setCurrentDistributorPrices(
        distributorPricesStates[currentIndex].selectedRow
          .split(",")
          .map((irc) => ({
            irc,
            billing_price: 0,
            rrsp: 0,
          }))
      );
    }
  }, [currentIndex, distributorPricesStates]);

  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const scrolling = React.useRef(false);

  // Sync scroll position from parent
  React.useEffect(() => {
    if (
      distributorPricesStates[currentIndex]?.scrollSource !== "distributor" &&
      scrollableRef.current
    ) {
      if (
        Math.abs(
          scrollableRef.current.scrollTop -
            distributorPricesStates[currentIndex]?.scrollTop
        ) > 1
      ) {
        scrolling.current = true;
        scrollableRef.current.scrollTop =
          distributorPricesStates[currentIndex]?.scrollTop || 0;
      }
    }
  }, [distributorPricesStates, currentIndex]);

  // After setting scroll, reset scrollSource to null
  React.useEffect(() => {
    if (
      scrolling.current &&
      distributorPricesStates[currentIndex]?.scrollSource !== "distributor"
    ) {
      scrolling.current = false;
      setDistributorPricesStates((prev) => {
        const newStates = [...prev];
        if (newStates[currentIndex]) {
          newStates[currentIndex].scrollTop =
            scrollableRef.current?.scrollTop || 0;
          newStates[currentIndex].scrollSource = "distributor";
        }
        return newStates;
      });
    }
  }, [distributorPricesStates, currentIndex, setDistributorPricesStates]);

  // On scroll, update parent if source is not distributor

  // Add onProductSelect handler
  const handleProductSelect = (product: Product) => {
    console.log("Product selected:", product);
  };

  const handleDeleteProducts = async (offeringId: number, index: number) => {
    if (!innovationId || !selectedProducts[offeringId]?.length) return;

    try {
      setIsDeletingProducts(true);
      await deleteOfferingProducts({
        innovationId,
        offeringId,
        productIds: selectedProducts[offeringId],
      });

      // Refresh the products list after deletion
      handleExpandRow(index, offeringId);

      // Clear selection for this offering
      setSelectedProducts((prev) => ({
        ...prev,
        [offeringId]: [],
      }));
    } catch (error) {
      console.error("Failed to delete products:", error);
    } finally {
      setIsDeletingProducts(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl px-6 my-6">
      <FormSection title="Offerings">
        <div className="flex justify-end ">
          <Button
            type="button"
            variant="outline"
            className="border-primary bg-transparent border-2 text-primary text-sm font-medium px-4 py-2 hover:bg-primary hover:text-white transition-all duration-300"
            leftSection={<PlusIcon size={16} />}
            onClick={handleAddOffering}
          >
            Add offering
          </Button>
        </div>

        <Grid>
          <Grid.Col span={12}>
            <div className="relative border border-primary rounded-xl overflow-hidden">
              <Table.ScrollContainer minWidth={768}>
                <Table verticalSpacing="md" borderColor="transparent">
                  <Table.Thead>
                    <Table.Tr className="bg-primary text-white">
                      <Table.Th className="text-white font-medium">
                        Offering number
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Forecast deadline
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Global ICW
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Global OCD
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Status
                      </Table.Th>
                      <Table.Th className="text-white font-medium">
                        Product amount
                      </Table.Th>
                      <Table.Th className="text-white font-medium w-16"></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {offerings?.map((offering, index) => (
                      <React.Fragment key={offering.id ?? index}>
                        <Table.Tr
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-gray-100 cursor-pointer transition-colors`}
                        >
                          <Table.Td className="font-medium">
                            {offering.number}
                          </Table.Td>
                          <Table.Td>{dateToLocalString(offering.icw)}</Table.Td>
                          <Table.Td>{dateToLocalString(offering.icw)}</Table.Td>
                          <Table.Td>{dateToLocalString(offering.ocd)}</Table.Td>
                          <Table.Td>
                            <span className="text-sm text-gray-600">
                              {offering.type || "Status example"}
                            </span>
                          </Table.Td>
                          <Table.Td className="font-medium">
                            {offering.products?.length || 0}
                          </Table.Td>
                          <Table.Td>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditOffering(index)}
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOffering(index)}
                              >
                                <Trash2 className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof offering.id === "number") {
                                    handleExpandRow(index, offering.id);
                                  }
                                }}
                              >
                                {expandedRows.has(index) ? (
                                  <ChevronUp className="size-5" />
                                ) : (
                                  <ChevronDown className="size-5" />
                                )}
                              </button>
                            </div>
                          </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td colSpan={7} className="p-0">
                            <Collapse in={expandedRows.has(index)}>
                              <div className="p-4 bg-gray-50 border-t">
                                {expandedRows.has(index) ? (
                                  loadingOfferings.has(offering.id || 0) ? (
                                    <div>Loading products...</div>
                                  ) : (
                                    <>
                                      <Group mt="md" mb="lg">
                                        <Button
                                          leftSection={<PlusIcon size={16} />}
                                          className="bg-primary text-white hover:bg-primary/90 rounded-lg"
                                        >
                                          Bulk product upload
                                        </Button>
                                        <Button
                                          leftSection={<PlusIcon size={16} />}
                                          className="bg-primary text-white hover:bg-primary/90 rounded-lg"
                                          onClick={() =>
                                            handleOpenProductModal(index)
                                          }
                                        >
                                          Add single product
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="border-primary text-primary hover:bg-primary/10 rounded-lg"
                                          onClick={() =>
                                            offering.id &&
                                            handleDeleteProducts(
                                              offering.id as number,
                                              index
                                            )
                                          }
                                          disabled={
                                            !selectedProducts[
                                              offering.id as number
                                            ]?.length || isDeletingProducts
                                          }
                                        >
                                          {isDeletingProducts
                                            ? "Deleting..."
                                            : "Delete product list"}
                                        </Button>
                                      </Group>
                                      <Grid gutter="lg">
                                        <Grid.Col span={{ base: 16, md: 8 }}>
                                          <h3 className="text-lg font-semibold text-primary mb-2">
                                            Product list
                                          </h3>
                                          {offering.id && (
                                            <OfferingProductsTable
                                              products={
                                                offeringProducts[offering.id] ||
                                                []
                                              }
                                              productsTableStates={
                                                productsTableStates
                                              }
                                              setProductsTableStates={
                                                setProductsTableStates
                                              }
                                              index={index}
                                              offeringId={offering.id}
                                            />
                                          )}
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 8, md: 4 }}>
                                          {offering.id && (
                                            <InnovationDistributorPrices
                                              distributors={
                                                offeringDistributors[
                                                  offering.id
                                                ] || []
                                              }
                                              selectedRow={
                                                distributorPricesStates[index]
                                                  ?.selectedRow || null
                                              }
                                              setSelectedRow={(
                                                selectedRowValue
                                              ) => {
                                                const newStates = [
                                                  ...distributorPricesStates,
                                                ];
                                                if (newStates[index]) {
                                                  newStates[index].selectedRow =
                                                    selectedRowValue;
                                                  setDistributorPricesStates(
                                                    newStates
                                                  );
                                                }
                                              }}
                                              tableHeader={[
                                                "Distributor IRC",
                                                "Price",
                                                "RRSP",
                                              ]}
                                              tableFields={[
                                                "irc",
                                                "billing_price",
                                                "rrsp",
                                              ]}
                                              scrollTop={
                                                distributorPricesStates[index]
                                                  ?.scrollTop || 0
                                              }
                                              setScrollTop={(
                                                scrollTopValue
                                              ) => {
                                                const newStates = [
                                                  ...distributorPricesStates,
                                                ];
                                                if (newStates[index]) {
                                                  newStates[index].scrollTop =
                                                    scrollTopValue;
                                                  newStates[
                                                    index
                                                  ].scrollSource =
                                                    "distributor";
                                                  setDistributorPricesStates(
                                                    newStates
                                                  );
                                                }
                                              }}
                                              scrollSource={
                                                distributorPricesStates[index]
                                                  ?.scrollSource || null
                                              }
                                              onPriceEdit={(irc, price) => {
                                                console.log(
                                                  "Price edit:",
                                                  irc,
                                                  price
                                                );
                                              }}
                                              onRRSPEdit={(irc, rrsp) => {
                                                console.log(
                                                  "RRSP edit:",
                                                  irc,
                                                  rrsp
                                                );
                                              }}
                                            />
                                          )}
                                        </Grid.Col>
                                      </Grid>
                                    </>
                                  )
                                ) : null}
                              </div>
                            </Collapse>
                          </Table.Td>
                        </Table.Tr>
                      </React.Fragment>
                    ))}
                    {(!offerings || offerings.length === 0) && (
                      <Table.Tr>
                        <Table.Td
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No offerings added yet. Click "Add offering" to get
                          started.
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* Add/Edit Offering Modal */}
      <Modal.Root
        opened={modalOpened}
        onClose={closeModal}
        withinPortal={false}
        trapFocus={false}
        className={
          modalOpened ? "absolute top-0 left-0 h-full w-full" : "hidden"
        }
      >
        <Modal.Overlay
          bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
          blur={3}
        />
        <Modal.Content className="!items-center min-w-[70%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl px-6 mt-6">
              <div className="space-y-6">
                <FormSection
                  title={modalMode === "add" ? "Add Offering" : "Edit Offering"}
                >
                  <Grid gutter={{ sm: 32, base: 16 }}>
                    <Grid.Col span={{ sm: 6, base: 12 }}>
                      <TextInput
                        value={offeringForm.number}
                        onChange={(e) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            number: e.target.value,
                          }))
                        }
                        placeholder="Offering Number"
                        label="Offering number"
                        classNames={textInputStyles}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 6, base: 12 }}>
                      <DateInput
                        value={offeringForm.deadline}
                        onChange={(date) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            deadline: date || new Date(),
                          }))
                        }
                        label="Forecast deadline"
                        valueFormat="YYYY MMM DD"
                        placeholder="Select date"
                        rightSection={<DateIcon />}
                        classNames={textInputStyles}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 4, base: 12 }}>
                      <DateInput
                        value={offeringForm.icw}
                        onChange={(date) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            icw: date || new Date(),
                          }))
                        }
                        label="Global ICW"
                        valueFormat="YYYY MMM DD"
                        placeholder="Select date"
                        rightSection={<DateIcon />}
                        classNames={textInputStyles}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 4, base: 12 }}>
                      <DateInput
                        value={offeringForm.ocd}
                        onChange={(date) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            ocd: date || new Date(),
                          }))
                        }
                        label="Global OCD"
                        valueFormat="YYYY MMM DD"
                        placeholder="Select date"
                        rightSection={<DateIcon />}
                        classNames={textInputStyles}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 4, base: 12 }}>
                      <Select
                        value={offeringForm.type}
                        onChange={(value) =>
                          setOfferingForm((prev) => ({
                            ...prev,
                            type: value || "",
                          }))
                        }
                        label="Type"
                        placeholder="Select type"
                        data={[
                          { value: "saleable", label: "Saleable" },
                          { value: "non saleable", label: "Non Saleable" },
                        ]}
                        rightSection={<ChevronDownIcon />}
                        classNames={selectStyles}
                        clearable
                      />
                    </Grid.Col>
                    <Grid.Col span={{ sm: 6, base: 12 }}>
                      <FormField label="Deck file">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.ppt,.pptx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, "deck");
                                }
                              }}
                              style={{ display: "none" }}
                              id="offering_deck_input"
                            />
                            <Button
                              type="button"
                              variant="filled"
                              className="bg-primary hover:bg-primary/90 text-white"
                              onClick={() =>
                                document
                                  .getElementById("offering_deck_input")
                                  ?.click()
                              }
                              leftSection={<Upload size={16} />}
                            >
                              Upload Deck
                            </Button>
                          </div>
                          {offeringForm.deck && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <span>deck-file.pdf</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setOfferingForm((prev) => ({
                                    ...prev,
                                    deck: "",
                                  }))
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormField>
                    </Grid.Col>
                    <Grid.Col span={{ sm: 6, base: 12 }}>
                      <FormField label="Market deck file">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.ppt,.pptx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, "market_deck");
                                }
                              }}
                              style={{ display: "none" }}
                              id="offering_market_deck_input"
                            />
                            <Button
                              type="button"
                              variant="filled"
                              className="bg-primary hover:bg-primary/90 text-white"
                              onClick={() =>
                                document
                                  .getElementById("offering_market_deck_input")
                                  ?.click()
                              }
                              leftSection={<Upload size={16} />}
                            >
                              Upload Market Deck
                            </Button>
                          </div>
                          {offeringForm.market_deck && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <span>market-deck-file.pdf</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setOfferingForm((prev) => ({
                                    ...prev,
                                    market_deck: "",
                                  }))
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormField>
                    </Grid.Col>
                  </Grid>
                </FormSection>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={handleSubmitOffering}
                  >
                    {modalMode === "add" ? "Add Offering" : "Update Offering"}
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      {/* Delete Confirmation Modal */}
      <Modal.Root
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        withinPortal={false}
        trapFocus={false}
        className={
          deleteModalOpened ? "absolute top-0 left-0 h-full w-full" : "hidden"
        }
      >
        <Modal.Overlay
          bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
          blur={3}
        />
        <Modal.Content className="!items-center min-w-[40%]">
          <Modal.Body>
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6 text-primary">
                Delete Offering
              </h2>
              <p className="mb-4">
                Are you sure you want to delete this offering? This action
                cannot be undone.
              </p>
              <div className="space-y-6">
                <Group justify="flex-end" mt="xl" gap={10}>
                  <Button
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 bg-red-500 border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-red-600 transition-all ease-in-out duration-300"
                    onClick={confirmDeleteOffering}
                  >
                    Delete
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      {/* Add Product To Offering Modal */}
      <AddProductToOfferingModal
        opened={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleAddProductToOffering}
      />
    </div>
  );
};

export default OfferingTable;
