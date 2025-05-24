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
  Box,
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
import PencilIcon from "../Icons/PencilIcon";
import { FormField } from "../Shared/Form/Field";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";

// Placeholder imports - actual components might have different props/structure
import ProductsTable from "../HomePage/ProductsTable";
import DistributorPrices from "../Distributors/DistributorPrices";
import { Product, Meta, Filters, MasterDistributor } from "@/types"; // Assuming these types are needed
import {
  AddProductToOfferingModal,
  OfferingProductFormValues,
} from "./AddProductToOfferingModal"; // Import the new modal
import { getOfferingProducts } from "@/api/products/get-offering-products";
import { useQuery } from "@tanstack/react-query";
import type { PriceBenchmark } from "@/types";

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

// Mock data for ProductsTable and DistributorPrices (replace with actual data fetching/props)
const mockProducts: Product[] = []; // Populate with mock Product data if needed for initial render
const mockMeta: Meta = {
  page: 1,
  total: 0,
  page_size: 10,
  cursor: 1,
  has_next: false,
};
const mockFilters: Filters = {
  search: "",
  brand_id: "",
  sub_brand_id: "",
  distributor_id: "",
  region_id: "",
  market_id: "",
};
const mockDistributors: MasterDistributor[] = []; // Populate with mock MasterDistributor data

// Helper to check if an object is a valid PriceBenchmark
function isValidPriceBenchmark(obj: unknown): obj is PriceBenchmark {
  return (
    !!obj &&
    typeof obj === "object" &&
    typeof (obj as any).brand_id !== "undefined" &&
    typeof (obj as any).product_id !== "undefined" &&
    typeof (obj as any).index_value !== "undefined" &&
    typeof (obj as any).comment !== "undefined"
  );
}

const OfferingTable: React.FC<OfferingTableProps> = ({
  offerings,
  onAdd,
  onEdit,
  onDelete,
  onOpenProductModal,
  innovationId,
}) => {
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

  console.log("offerings", offerings);

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

  // Handler to add product to the correct offering
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
    const updatedOfferings = offerings.map((offering, idx) => {
      if (idx === targetOfferingIndex) {
        return {
          ...offering,
          products: [...(offering.products || []), productWithPrice],
        };
      }
      return offering;
    });
    onEdit(targetOfferingIndex, updatedOfferings[targetOfferingIndex]);
    setIsProductModalOpen(false);
    setTargetOfferingIndex(null);
  }

  // Create a new component for the products table
  interface OfferingProductsTableProps {
    innovationId: string | number;
    offeringId: string | number;
    productsTableStates: Array<{ isEdit: boolean }>;
    setProductsTableStates: React.Dispatch<
      React.SetStateAction<Array<{ isEdit: boolean }>>
    >;
    index: number;
  }
  function OfferingProductsTable({
    innovationId,
    offeringId,
    productsTableStates,
    setProductsTableStates,
    index,
  }: OfferingProductsTableProps) {
    const { data: products, isLoading } = useQuery({
      queryKey: ["offering-products", innovationId, offeringId],
      queryFn: () => getOfferingProducts(innovationId, offeringId),
      select: (res) =>
        (res.data || []).map((p, i) => ({
          id: p.id || i + 1,
          pref: p.pref,
          product_type: p.product_type,
          brand_pillar: p.brand_pillar || { id: 0, name: "" },
          grouping: Number(p.grouping),
          price: String(p.icp_eur || p.icp_usd || 0),
          launch_date: p.launch_date ? new Date(p.launch_date) : new Date(),
          discontinue_date: p.discontinue_date
            ? new Date(p.discontinue_date)
            : new Date(),
          offering_number: p.offering_number || "",
          irc: p.irc,
          sku: p.irc,
          material_description: p.material_description || "",
          ean_upc: p.ean_upc || "",
          house: p.house || "",
          line: p.line || "",
          line_id: p.line_id || "",
          line_number: "",
          article_type: p.article_type || "",
          article_sub_type: p.article_sub_type || "",
          division: p.division || "",
          segment: p.segment || { id: 0, name: "", created_at: "" },
          icp_eur: String(p.icp_eur || 0),
          icp_usd: String(p.icp_usd || 0),
          factory: p.factory || "",
          commodity_id: p.commodity_id || "",
          gender: p.gender || "",
          size: p.size || "",
          length: p.length || "",
          height: p.height || "",
          width: p.width || "",
          volume: p.volume || "",
          gross_weight: p.gross_weight || "",
          net_weight: p.net_weight || "",
          units: p.units || "",
          created_at: p.created_at || "",
          brand: {
            id: p.brand?.id || 0,
            brand_type_id: 0,
            name: p.brand?.name || "",
            active: true,
            type: (p.brand?.type as "Luxury" | "Mass") || "Mass",
            created_at: p.brand?.created_at || "",
            updated_at: "",
            deleted_at: null,
            pivot: {
              distributor_id: 0,
              brand_id: p.brand?.id || 0,
            },
          },
          pricing: {
            distributor_id: 0,
            icp_usd: Number(p.icp_usd || 0),
            icp_eur: Number(p.icp_eur || 0),
            french_usd: null,
            french_eur: null,
            rrsp: null,
            regional_billing_price: null,
            c1: null,
            cssp: null,
            status: "",
          },
          category: p.category || { id: 0, name: "", created_at: "" },
          country: p.country || {
            id: 0,
            name: "",
            official_name: "",
            iso2: "",
            iso3: "",
            flag_url: "",
            created_at: "",
          },
          market: p.market || null,
          subcategory: p.subcategory || { id: 0, name: "", created_at: "" },
          price_benchmark: isValidPriceBenchmark(p.price_benchmark)
            ? p.price_benchmark
            : null,
          documents: [],
          distributor_pricing: [],
          gmm_category: { id: 0, name: "", created_at: "" },
          gmm_subCategory: { id: 0, name: "", created_at: "" },
          gmm_market: { id: 0, name: "", created_at: "" },
          gmm_segment: { id: 0, name: "", created_at: "" },
        })),
      enabled: !!innovationId && !!offeringId,
    });

    console.log("products", products);

    if (isLoading) return <div>Loading products...</div>;

    return (
      <ProductsTable
        initialData={products || []}
        initialMeta={{
          page: 1,
          total: products?.length || 0,
          page_size: 10,
          cursor: 1,
          has_next: false,
        }}
        filters={mockFilters}
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
      />
    );
  }

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
                                onClick={() => toggleRow(index)}
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
                                {expandedRows.has(index) &&
                                offering.id &&
                                innovationId ? (
                                  <OfferingProductsTable
                                    innovationId={innovationId}
                                    offeringId={offering.id}
                                    productsTableStates={productsTableStates}
                                    setProductsTableStates={
                                      setProductsTableStates
                                    }
                                    index={index}
                                  />
                                ) : null}
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
                                  >
                                    Delete product list
                                  </Button>
                                </Group>
                                <Grid gutter="lg">
                                  <Grid.Col span={{ base: 16, md: 8 }}>
                                    <h3 className="text-lg font-semibold text-primary mb-2">
                                      Product list
                                    </h3>
                                    <ProductsTable
                                      initialData={(
                                        offering.products || []
                                      ).map((p, i) => ({
                                        id: i + 1, // fallback id
                                        pref: p.pref,
                                        product_type: p.product_type,
                                        brand_pillar: { id: 0, name: "" },
                                        grouping: Number(p.grouping),
                                        price: String(p.price),
                                        launch_date: new Date(),
                                        discontinue_date: new Date(),
                                        offering_number: offering.number,
                                        irc: p.irc,
                                        sku: p.irc,
                                        material_description:
                                          p.material_description || "",
                                        ean_upc: "",
                                        house: "",
                                        line: "",
                                        line_id: "",
                                        line_number: "",
                                        article_type: p.product_type,
                                        article_sub_type: "",
                                        division: "",
                                        segment: {
                                          id: 0,
                                          name: "",
                                          created_at: "",
                                        },
                                        icp_eur: String(p.icp_cost),
                                        icp_usd: String(p.icp_cost),
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
                                          id: 0,
                                          brand_type_id: 0,
                                          name: "",
                                          active: true,
                                          type: "Mass",
                                          created_at: "",
                                          updated_at: "",
                                          deleted_at: null,
                                          pivot: {
                                            distributor_id: 0,
                                            brand_id: 0,
                                          },
                                        },
                                        pricing: {
                                          distributor_id: 0,
                                          icp_usd: Number(p.icp_cost),
                                          icp_eur: Number(p.icp_cost),
                                          french_usd: null,
                                          french_eur: null,
                                          rrsp: null,
                                          regional_billing_price: null,
                                          c1: null,
                                          cssp: null,
                                          status: "",
                                        },
                                        category: {
                                          id: 0,
                                          name: "",
                                          created_at: "",
                                        },
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
                                        subcategory: {
                                          id: 0,
                                          name: "",
                                          created_at: "",
                                        },
                                        price_benchmark: null,
                                        documents: [],
                                        distributor_pricing: [],
                                        gmm_category: {
                                          id: 0,
                                          name: "",
                                          created_at: "",
                                        },
                                        gmm_subCategory: {
                                          id: 0,
                                          name: "",
                                          created_at: "",
                                        },
                                        gmm_market: {
                                          id: 0,
                                          name: "",
                                          created_at: "",
                                        },
                                        gmm_segment: {
                                          id: 0,
                                          name: "",
                                          created_at: "",
                                        },
                                      }))}
                                      initialMeta={{
                                        page: 1,
                                        total: offering.products?.length || 0,
                                        page_size: 10,
                                        cursor: 1,
                                        has_next: false,
                                      }}
                                      filters={mockFilters}
                                      isEdit={
                                        productsTableStates[index]?.isEdit ||
                                        false
                                      }
                                      setIsEdit={(isEditValue) => {
                                        const newStates = [
                                          ...productsTableStates,
                                        ];
                                        if (newStates[index]) {
                                          newStates[index].isEdit =
                                            typeof isEditValue === "function"
                                              ? isEditValue(
                                                  newStates[index].isEdit
                                                )
                                              : isEditValue;
                                          setProductsTableStates(newStates);
                                        }
                                      }}
                                    />
                                  </Grid.Col>
                                  <Grid.Col span={{ base: 8, md: 4 }}>
                                    <DistributorPrices
                                      distributors={mockDistributors}
                                      selectedRow={
                                        distributorPricesStates[index]
                                          ?.selectedRow || null
                                      }
                                      setSelectedRow={(selectedRowValue) => {
                                        const newStates = [
                                          ...distributorPricesStates,
                                        ];
                                        if (newStates[index]) {
                                          newStates[index].selectedRow =
                                            selectedRowValue;
                                          setDistributorPricesStates(newStates);
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
                                      setScrollTop={(scrollTopValue) => {
                                        const newStates = [
                                          ...distributorPricesStates,
                                        ];
                                        if (newStates[index]) {
                                          newStates[index].scrollTop =
                                            scrollTopValue;
                                          newStates[index].scrollSource =
                                            "distributor";
                                          setDistributorPricesStates(newStates);
                                        }
                                      }}
                                      scrollSource={
                                        distributorPricesStates[index]
                                          ?.scrollSource || null
                                      }
                                    />
                                  </Grid.Col>
                                </Grid>
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
