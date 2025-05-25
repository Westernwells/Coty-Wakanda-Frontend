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
import { PlusIcon, ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";
import React, { useState, useEffect } from "react";
import ChevronDownIcon from "../Icons/ChevronDownIcon";
import DateIcon from "../Icons/DateIcon";
import { FormSection } from "../Shared/Form/Section";
import { selectStyles, textInputStyles } from "../Shared/Styles";
import { getOfferingProducts } from "@/api/products/get-offering-products";
import { useDeleteOfferingProduct } from "@/api/innovations/offerings/products/delete-product";
import { useCreateOfferingProduct } from "@/api/innovations/offerings/products/create-product";
import { useUpdateOfferingProduct } from "@/api/innovations/offerings/products/update-product";
import { CreateOfferingProductDTO } from "@/api/innovations/offerings/products/create-product";

// Placeholder imports - actual components might have different props/structure
import InnovationProductsTable from "./InnovationProductsTable";
import { Product } from "@/types";
import {
  AddProductToOfferingModal,
  OfferingProductFormValues,
} from "./AddProductToOfferingModal"; // Import the new modal
import CombinedInnovationTables from "./CombinedInnovationTables";

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
  innovationId: string;
}

// Define interface for mapped product (from EditInnovationForm mapping)
interface OfferingMappedProduct {
  id?: number;
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
  brand_type?: string | null;
  brand_category?: string | null;
  launch_date?: Date | null;
  discontinue_date?: Date | null;
  offering_number?: string | null;
  sku?: string;
  material_tr?: string | null;
  ean_upc?: string | null;
  house?: string | null;
  line?: string | null;
  line_id?: string | null;
  article_sub_type?: string | null;
  division?: string | null;
  icp_eur?: string | null;
  icp_usd?: string | null;
  factory?: string | null;
  commodity_id?: string | null;
  gender?: string | null;
  size?: string | null;
  length?: string | null;
  height?: string | null;
  width?: string | null;
  volume?: string | null;
  gross_weight?: string | null;
  net_weight?: string | null;
  units?: string | null;
  cssp_trex_eur?: string | null;
  cssp_trex_usd?: string | null;
  shade?: string | null;
  is_innovation_product?: boolean;
  created_at?: string;
  brand?: {
    id: number;
    name: string;
    type: string;
    created_at: string;
  } | null;
  brand_pillar?: {
    id: number;
    name: string;
    created_at: string;
    brand: {
      id: number;
      name: string;
      type: string;
      created_at: string;
    };
  } | null;
  category?: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  country?: {
    id: number;
    name: string;
    official_name: string;
    iso2: string;
    iso3: string;
    flag_url: string;
    created_at: string;
  } | null;
  market?: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  subcategory?: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  segment?: {
    id: number;
    name: string;
    created_at: string;
  } | null;
  price_benchmark?: import("@/types").PriceBenchmark | null;
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

export const OfferingTable: React.FC<OfferingTableProps> = ({
  offerings,
  onAdd,
  onEdit,
  onDelete,
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<{
    number: boolean;
    type: boolean;
  }>({
    number: false,
    type: false,
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
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Add state for fetched products per offering
  const [offeringProducts, setOfferingProducts] = useState<
    Record<string, OfferingMappedProduct[]>
  >({});
  const [offeringDistributors, setOfferingDistributors] = useState<
    Record<number, DistributorData[]>
  >({});
  const [loadingOfferings, setLoadingOfferings] = useState<Set<number>>(
    new Set()
  );

  console.log("offeringProducts", offeringProducts);

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
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Add state for edit mode
  const [editMode, setEditMode] = useState(false);
  const [editInitialData, setEditInitialData] = useState<Product | null>(null);

  // Add isDeleteMode state near other states
  const [isDeleteMode, setIsDeleteMode] = useState(false);

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
    setIsSubmitted(false);
    setTouchedFields({
      number: false,
      type: false,
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

  const [isAddingOffering, setIsAddingOffering] = useState(false);
  const [isEditingOffering, setIsEditingOffering] = useState(false);
  const [isDeletingOffering, setIsDeletingOffering] = useState(false);

  const handleSubmit = async () => {
    // Since offeringForm doesn't have a validate method, let's do manual validation
    if (!offeringForm.number.trim() || !offeringForm.type) {
      setIsSubmitted(true);
      return;
    }

    const newOffering = {
      id:
        modalMode === "add"
          ? undefined
          : editingIndex !== null
            ? offerings[editingIndex].id
            : undefined,
      number: offeringForm.number.trim(),
      icw: offeringForm.icw,
      ocd: offeringForm.ocd,
      type: offeringForm.type,
      deck: offeringForm.deck,
      market_deck: offeringForm.market_deck,
      products: [],
    };

    try {
      if (modalMode === "add") {
        setIsAddingOffering(true);
        await onAdd(newOffering);
      } else if (modalMode === "edit" && editingIndex !== null) {
        setIsEditingOffering(true);
        await onEdit(editingIndex, newOffering);
      }
      resetForm();
      closeModal();
    } catch (error) {
      console.error("Failed to save offering:", error);
    } finally {
      setIsAddingOffering(false);
      setIsEditingOffering(false);
    }
  };

  const confirmDeleteOffering = async () => {
    if (deletingIndex !== null) {
      try {
        setIsDeletingOffering(true);
        await onDelete(deletingIndex);
        setDeletingIndex(null);
        closeDeleteModal();
      } catch (error) {
        console.error("Failed to delete offering:", error);
      } finally {
        setIsDeletingOffering(false);
      }
    }
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

  // Update the handleOpenProductModal function
  function handleOpenProductModal(index: number, editData?: Product) {
    setSelectedOffering(index);
    if (editData) {
      setEditMode(true);
      setEditInitialData(editData);
    } else {
      setEditMode(false);
      setEditInitialData(null);
    }
    setIsAddProductModalOpen(true);
  }

  // Update the handleAddProductToOffering function
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  const createProductMutation = useCreateOfferingProduct({
    mutationConfig: {
      onSuccess: (response, variables) => {
        // Add the new product to the current offering's products
        const newProduct = response.data;
        console.log("newProduct", newProduct);

        if (newProduct) {
          setOfferingProducts((prev) => ({
            ...prev,
            [variables.offeringId.toString()]: [
              ...(prev[variables.offeringId.toString()] || []),
              {
                irc: newProduct.irc,
                currency: newProduct.currency,
                price: newProduct.price,
                icp_cost: newProduct.icp_cost,
                product_type: newProduct.product_type,
                pref: newProduct.pref,
                grouping: newProduct.grouping,
                material_description: newProduct.material_description,
                brand_id: newProduct.brand_id,
                sub_brand_id: newProduct.sub_brand_id,
              },
            ],
          }));
        }
      },
      onError: (error) => {
        console.error("Failed to create product:", error);
      },
    },
  });

  const updateProductMutation = useUpdateOfferingProduct({});
  const deleteProductMutation = useDeleteOfferingProduct({});

  // Add new function to handle product creation
  const handleAddProductToOffering = async (
    product: Omit<OfferingProductFormValues, "icp_cost"> & { icp_cost: number },
    offeringId: number
  ) => {
    if (!innovationId) return;

    try {
      setIsAddingProduct(true);

      // Call the create product endpoint
      await createProductMutation.mutateAsync({
        innovationId,
        offeringId,
        data: {
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
        },
      });

      // Close the modal
      setIsAddProductModalOpen(false);
      setSelectedOffering(null);

      // Refresh the products list for this offering
      if (expandedRows.has(offerings.findIndex((o) => o.id === offeringId))) {
        await handleExpandRow(
          offerings.findIndex((o) => o.id === offeringId),
          offeringId
        );
      }
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Add new function to handle product update
  const handleUpdateProduct = async (product: Product, offeringId: number) => {
    if (!innovationId) return;

    try {
      setIsUpdatingProduct(true);

      // Convert the product data to match the API's expected format
      const submissionData: CreateOfferingProductDTO = {
        irc: product.irc,
        material_description: product.material_description,
        icp_cost: Number(product.icp_eur) || Number(product.icp_usd) || 0,
        price: Number(product.icp_eur) || Number(product.icp_usd) || 0,
        currency: (product.icp_eur ? "EUR" : "USD") as "EUR" | "USD",
        brand_id: String(product.brand.id),
        sub_brand_id: product.brand_pillar?.id
          ? String(product.brand_pillar.id)
          : undefined,
        product_type:
          product.product_type === "saleable" ||
          product.product_type === "non-saleable"
            ? product.product_type
            : "saleable",
        pref:
          product.pref === "pref" || product.pref === "non-pref"
            ? product.pref
            : "pref",
        grouping: "1",
      };

      await updateProductMutation.mutateAsync({
        innovationId,
        offeringId,
        id: product.id,
        data: submissionData,
      });

      // Refresh the products list
      handleExpandRow(
        offerings.findIndex((o) => o.id === offeringId),
        offeringId
      );
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  // Update handleExpandRow to be callable from other functions
  const handleExpandRow = async (index: number, offeringId: number) => {
    // If not already expanded, expand it
    if (!expandedRows.has(index)) {
      toggleRow(index);
    }

    // // Initialize empty arrays for new offerings
    // if (!offeringProducts[offeringId]) {
    //   setOfferingProducts((prev) => ({
    //     ...prev,
    //     [offeringId]: [],
    //   }));
    //   setOfferingDistributors((prev) => ({
    //     ...prev,
    //     [offeringId]: [],
    //   }));
    // }

    // Only fetch from API if we have an innovationId and it's not a temporary ID
    if (innovationId && offeringId) {
      setLoadingOfferings((prev) => new Set(prev).add(offeringId));
      try {
        const response = await getOfferingProducts(innovationId, offeringId);
        console.log("response", response);
        const { products, distributors } = response.data;
        console.log("products from offering table", products);

        // Map products to the format expected by the component
        const mappedProducts: OfferingMappedProduct[] = products.map((p) => ({
          id: p.id,
          irc: p.irc || "",
          currency: p.icp_eur ? "EUR" : p.icp_usd ? "USD" : "EUR",
          price:
            typeof p.price === "number"
              ? p.price
              : Number(p.icp_eur || p.icp_usd || 0),
          icp_cost: p.icp_eur
            ? Number(p.icp_eur)
            : p.icp_usd
              ? Number(p.icp_usd)
              : 0,
          product_type: p.product_type || p.article_type || "",
          pref: p.pref || "non-pref",
          grouping: p.grouping ? String(p.grouping) : "1",
          material_description: p.material_description || "",
          brand_id: p.brand?.id ? String(p.brand.id) : "",
          sub_brand_id: p.brand_pillar?.id ? String(p.brand_pillar.id) : "",
          // Include all other fields for downstream consumers
          brand_type: p.brand_type || null,
          brand_category: p.brand_category || null,
          launch_date: p.launch_date ? new Date(p.launch_date) : null,
          discontinue_date: p.discontinue_date
            ? new Date(p.discontinue_date)
            : null,
          offering_number: p.offering_number || null,
          sku: p.sku || "",
          material_tr: p.material_tr || null,
          ean_upc: p.ean_upc || null,
          house: p.house || null,
          line: p.line || null,
          line_id: p.line_id || null,
          article_sub_type: p.article_sub_type || null,
          division: p.division || null,
          icp_eur: p.icp_eur || null,
          icp_usd: p.icp_usd || null,
          factory: p.factory || null,
          commodity_id: p.commodity_id || null,
          gender: p.gender || null,
          size: p.size || null,
          length: p.length || null,
          height: p.height || null,
          width: p.width || null,
          volume: p.volume || null,
          gross_weight: p.gross_weight || null,
          net_weight: p.net_weight || null,
          units: p.units || null,
          cssp_trex_eur: p.cssp_trex_eur || null,
          cssp_trex_usd: p.cssp_trex_usd || null,
          shade: p.shade || null,
          is_innovation_product: p.is_innovation_product,
          created_at: p.created_at,
          brand: p.brand,
          brand_pillar: p.brand_pillar,
          category: p.category,
          country: p.country,
          market: p.market,
          subcategory: p.subcategory,
          segment: p.segment,
          price_benchmark: p.price_benchmark,
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
  };

  // Handler for after product addition
  const handleProductAdded = async (index: number, offeringId: number) => {
    await handleExpandRow(index, offeringId);
  };

  // Update OfferingProductsTable to accept products as a prop

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
      setIsDeletingProduct(true);

      // Delete each selected product one by one
      await Promise.all(
        selectedProducts[offeringId].map((productId) =>
          deleteProductMutation.mutateAsync({
            innovationId,
            offeringId,
            productId,
          })
        )
      );

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
      setIsDeletingProduct(false);
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
                                          onClick={() => {
                                            if (isDeleteMode) {
                                              if (
                                                offering.id &&
                                                selectedProducts[offering.id]
                                                  ?.length
                                              ) {
                                                handleDeleteProducts(
                                                  offering.id as number,
                                                  index
                                                );
                                              }
                                              setIsDeleteMode(false);
                                            } else {
                                              setIsDeleteMode(true);
                                            }
                                          }}
                                        >
                                          {isDeleteMode
                                            ? "Cancel Delete"
                                            : "Delete product list"}
                                        </Button>
                                      </Group>
                                      <Grid gutter="lg">
                                        <Grid.Col>
                                          {offering.id && (
                                            <CombinedInnovationTables
                                              products={(
                                                offeringProducts[offering.id] ||
                                                []
                                              ).map((p, i) => ({
                                                id: p.id || 0,
                                                pref: p.pref,
                                                product_type: p.product_type,
                                                brand_pillar: {
                                                  id: 0,
                                                  name: "",
                                                },
                                                grouping: Number(p.grouping),
                                                price: String(p.price),
                                                launch_date: new Date(),
                                                discontinue_date: new Date(),
                                                offering_number: "",
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
                                                icp_eur:
                                                  p.currency === "EUR"
                                                    ? String(p.icp_cost)
                                                    : "0",
                                                icp_usd:
                                                  p.currency === "USD"
                                                    ? String(p.icp_cost)
                                                    : "0",
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
                                                    brand_id:
                                                      Number(p.brand_id) || 0,
                                                  },
                                                },
                                                pricing: {
                                                  distributor_id: 0,
                                                  icp_usd:
                                                    p.currency === "USD"
                                                      ? p.icp_cost
                                                      : 0,
                                                  icp_eur:
                                                    p.currency === "EUR"
                                                      ? p.icp_cost
                                                      : 0,
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
                                              isEdit={
                                                productsTableStates[index]
                                                  ?.isEdit || false
                                              }
                                              setIsEdit={(isEditValue) => {
                                                const newStates = [
                                                  ...productsTableStates,
                                                ];
                                                if (newStates[index]) {
                                                  newStates[index].isEdit =
                                                    typeof isEditValue ===
                                                    "function"
                                                      ? isEditValue(
                                                          newStates[index]
                                                            .isEdit
                                                        )
                                                      : isEditValue;
                                                  setProductsTableStates(
                                                    newStates
                                                  );
                                                }
                                              }}
                                              onProductSelect={
                                                handleProductSelect
                                              }
                                              brandOptions={brandOptions}
                                              brandPillarOptions={
                                                brandPillarOptions
                                              }
                                              onBulkUpdate={(products) => {
                                                console.log(
                                                  "Bulk update:",
                                                  products
                                                );
                                              }}
                                              selectedProducts={
                                                selectedProducts[offering.id] ||
                                                []
                                              }
                                              onSelectedProductsChange={(
                                                productIds
                                              ) => {
                                                setSelectedProducts((prev) => ({
                                                  ...prev,
                                                  [offering.id as number]:
                                                    productIds,
                                                }));
                                              }}
                                              distributors={
                                                offeringDistributors[
                                                  offering.id
                                                ] || []
                                              }
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
                                              innovationId={innovationId}
                                              offeringId={offering.id.toString()}
                                              onLocalEdit={(product) => {
                                                if (
                                                  typeof offering.id ===
                                                  "number"
                                                ) {
                                                  handleOpenProductModal(
                                                    index,
                                                    product
                                                  );
                                                }
                                              }}
                                              onLocalDelete={(product) => {
                                                // Handle local deletion
                                                const offeringId = offering.id;
                                                if (
                                                  offeringId &&
                                                  typeof offeringId === "number"
                                                ) {
                                                  setOfferingProducts(
                                                    (prev) => {
                                                      const updatedProducts = {
                                                        ...prev,
                                                      };
                                                      if (
                                                        updatedProducts[
                                                          offeringId
                                                        ]
                                                      ) {
                                                        updatedProducts[
                                                          offeringId
                                                        ] = updatedProducts[
                                                          offeringId
                                                        ].filter(
                                                          (
                                                            p: OfferingMappedProduct
                                                          ) =>
                                                            p.irc !==
                                                            product.irc
                                                        );
                                                      }
                                                      return updatedProducts;
                                                    }
                                                  );
                                                }
                                              }}
                                              isDeleteMode={isDeleteMode}
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
                        onChange={(e) => {
                          setOfferingForm((prev) => ({
                            ...prev,
                            number: e.target.value,
                          }));
                          setTouchedFields((prev) => ({
                            ...prev,
                            number: true,
                          }));
                        }}
                        placeholder="Offering Number"
                        label="Offering number"
                        classNames={textInputStyles}
                        required
                        error={
                          (isSubmitted || touchedFields.number) &&
                          offeringForm.number.trim() === ""
                            ? "Offering number is required"
                            : null
                        }
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
                        onChange={(value) => {
                          setOfferingForm((prev) => ({
                            ...prev,
                            type: value || "",
                          }));
                          setTouchedFields((prev) => ({
                            ...prev,
                            type: true,
                          }));
                        }}
                        label="Type"
                        placeholder="Select type"
                        data={[
                          { value: "saleable", label: "Saleable" },
                          { value: "non saleable", label: "Non Saleable" },
                        ]}
                        rightSection={<ChevronDownIcon />}
                        classNames={selectStyles}
                        required
                        error={
                          (isSubmitted || touchedFields.type) &&
                          offeringForm.type === ""
                            ? "Type is required"
                            : null
                        }
                        clearable
                      />
                    </Grid.Col>
                  </Grid>
                </FormSection>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={closeModal}
                    disabled={isAddingOffering || isEditingOffering}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 hover:bg-opacity-40 transition-all ease-in-out duration-300"
                    onClick={handleSubmit}
                    disabled={isAddingOffering || isEditingOffering}
                  >
                    {isAddingOffering || isEditingOffering
                      ? "Saving..."
                      : modalMode === "add"
                        ? "Add Offering"
                        : "Update Offering"}
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
                    disabled={isDeletingOffering}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 bg-red-500 border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-red-600 transition-all ease-in-out duration-300"
                    onClick={confirmDeleteOffering}
                    disabled={isDeletingOffering}
                  >
                    {isDeletingOffering ? "Deleting..." : "Delete"}
                  </Button>
                </Group>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      {/* Add Product To Offering Modal */}
      {selectedOffering !== null && offerings[selectedOffering]?.id && (
        <AddProductToOfferingModal
          opened={isAddProductModalOpen}
          onClose={() => {
            setIsAddProductModalOpen(false);
            setSelectedOffering(null);
            setEditMode(false);
            setEditInitialData(null);
          }}
          onSubmit={async (product) => {
            if (editMode && editInitialData) {
              // Handle edit submission
              const updatedProduct = {
                ...editInitialData,
                grouping: Number(product.grouping),
                product_type: product.product_type as
                  | "saleable"
                  | "non-saleable",
                pref: product.pref as "pref" | "non-pref",
                irc: product.irc,
                material_description: product.material_description,
                brand: {
                  ...editInitialData.brand,
                  id: Number(product.brand_id),
                },
                brand_pillar: {
                  id: Number(product.sub_brand_id || 0),
                  name: editInitialData.brand_pillar?.name || "",
                },
              };

              await handleUpdateProduct(
                updatedProduct as Product, // Force type assertion since we know the structure matches
                offerings[selectedOffering].id!
              );
            } else {
              // Handle add submission
              await handleAddProductToOffering(
                {
                  ...product,
                  icp_cost: Number(product.icp_cost) || 0,
                },
                offerings[selectedOffering].id!
              );
            }
            // After successful submission
            if (selectedOffering !== null && offerings[selectedOffering]?.id) {
              await handleProductAdded(
                selectedOffering,
                offerings[selectedOffering].id!
              );
            }
            setIsAddProductModalOpen(false);
            setSelectedOffering(null);
            setEditMode(false);
            setEditInitialData(null);
          }}
          innovationId={innovationId}
          offeringId={offerings[selectedOffering].id!.toString()}
          editMode={editMode}
          initialData={editInitialData || undefined}
        />
      )}
    </div>
  );
};

export default OfferingTable;
