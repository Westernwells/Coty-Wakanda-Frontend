import { Product } from "@/types";
import { Button, Grid, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FormSection } from "../../Shared/Form/Section";
import { AddProductToOfferingModal, OfferingProductFormValues } from "../AddProductToOfferingModal";
import { Offering, OfferingTableProps } from "./types";

import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import EmptyOfferingsMessage from "./components/EmptyOfferingsMessage";
import OfferingFormModal from "./components/OfferingFormModal";
import OfferingTableHeader from "./components/OfferingTableHeader";
import OfferingTableRow from "./components/OfferingTableRow";

import { getProducts } from "@/api/products/get-products";
import { useImportProducts } from "@/api/products/import-products";
import { useCsvProductBulkUploader } from "@/lib/hooks/useCsvProductBulkUploader";
import { Product as InnovationProduct } from "@/types/InnovationOfferProduct";
import { toast } from "react-toastify";
import { useOfferingProducts } from "./hooks/useOfferingProducts";

export const OfferingTable: React.FC<OfferingTableProps> = ({
  offerings,
  onAdd,
  onEdit,
  onDelete,
  innovationId,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  
  const [isAddingOffering, setIsAddingOffering] = useState(false);
  const [isEditingOffering, setIsEditingOffering] = useState(false);
  const [isDeletingOffering, setIsDeletingOffering] = useState(false);
  
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editInitialData, setEditInitialData] = useState<Product | null>(null);
  
  const [productsTableStates, setProductsTableStates] = useState<Array<{ isEdit: boolean }>>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  const [brandOptions, setBrandOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [brandPillarOptions, setBrandPillarOptions] = useState<Array<{ value: string; label: string }>>([]);

  const {
    offeringProducts,
    offeringDistributors,
    loadingOfferings,
    selectedProducts,
    fetchOfferingProducts,
    addProduct,
    updateProductWithRefresh,
    deleteProductsWithRefresh,
    updateSelectedProducts,
  } = useOfferingProducts(innovationId);

  useEffect(() => {
    setProductsTableStates(offerings.map(() => ({ isEdit: false })));
  }, [offerings]);

  const toggleRow = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
      if (offerings[index]?.id) {
        fetchOfferingProducts(offerings[index].id as number);
      }
    }
    setExpandedRows(newExpandedRows);
  };

  const handleAddOffering = () => {
    setModalMode("add");
    setEditingIndex(null);
    openModal();
  };

  const handleEditOffering = (index: number) => {
    setModalMode("edit");
    setEditingIndex(index);
    openModal();
  };

  const handleDeleteOffering = (index: number) => {
    setDeletingIndex(index);
    openDeleteModal();
  };

  const handleSubmitOffering = async (offering: Offering) => {
    try {
      if (modalMode === "add") {
        setIsAddingOffering(true);
        await onAdd(offering);
      } else if (modalMode === "edit" && editingIndex !== null) {
        setIsEditingOffering(true);
        await onEdit(editingIndex, offering);
      }
    } catch (error) {
      console.error("Failed to save offering:", error);
      throw error;
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

  const handleOpenProductModal = (index: number, editData?: Product) => {
    setSelectedOffering(index);
    if (editData) {
      setEditMode(true);
      setEditInitialData(editData);
    } else {
      setEditMode(false);
      setEditInitialData(null);
    }
    setIsAddProductModalOpen(true);
  };

  const handleProductSelect = (product: Product) => {
    console.log("Product selected:", product);
  };
  const [rows, setRows] = useState<OfferingProductFormValues[]>([]);
  const { mutate: importCsv } = useImportProducts({
      mutationConfig: {
        onError: (err) => toast.error(`Error importing products: ${err}`),
        onSuccess: async (data, variables, context) => {
          const { offeringId } = variables as { offeringId: number };
          console.log("CSV import successful:", data);
          await fetchOfferingProducts(offeringId);
        }
      },
    })

  const { handleFileUpload } = useCsvProductBulkUploader((parsedRows) => {
    setRows(parsedRows);
    
  },(file, offeringId)=>{
    console.log(file.name, file.type)
    importCsv({
      innovationId: Number(innovationId),
      offeringId,
      file,
      type: file.type.includes("text/csv") ? "pim" : "trex",
    });
  });
  const { data: productsResp } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ page_size: 9999, filter: { is_innovation_product: true } }),
  });

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
                  <OfferingTableHeader />
                  <Table.Tbody>
                    {offerings?.map((offering, index) => (
                      <OfferingTableRow
                        key={offering.id ?? index}
                        offering={offering}
                        index={index}
                        isExpanded={expandedRows.has(index)}
                        onToggleExpand={toggleRow}
                        onEdit={handleEditOffering}
                        onDelete={handleDeleteOffering}
                        innovationId={innovationId}
                        offeringProducts={offeringProducts[offering.id as number] || []}
                        offeringDistributors={offeringDistributors[offering.id as number] || []}
                        isLoading={loadingOfferings.has(offering.id as number)}
                        onAddProduct={(index) => handleOpenProductModal(index)}
                        onEditProduct={(index, product) => handleOpenProductModal(index, product)}
                        onProductSelect={handleProductSelect}
                        selectedProducts={selectedProducts[offering.id as number] || []}
                        onSelectedProductsChange={(productIds) => {
                          updateSelectedProducts(offering.id as number, productIds);
                        }}
                        isDeleteMode={isDeleteMode}
                        setIsDeleteMode={setIsDeleteMode}
                        onDeleteProducts={deleteProductsWithRefresh}
                        brandOptions={brandOptions}
                        brandPillarOptions={brandPillarOptions}
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
                        onBulkProductUpload={(e, index) => {
                          handleFileUpload(e, Number(offering.id));
                        }}
                        productListData={productsResp?.data as unknown as InnovationProduct[] || []}
                      />
                    ))}
                    {(!offerings || offerings.length === 0) && <EmptyOfferingsMessage />}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* Add/Edit Offering Modal */}
      <OfferingFormModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleSubmitOffering}
        mode={modalMode}
        initialData={editingIndex !== null ? offerings[editingIndex] : undefined}
        editingIndex={editingIndex}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteOffering}
        title="Delete Offering"
        message="Are you sure you want to delete this offering? This action cannot be undone."
        isDeleting={isDeletingOffering}
      />

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
              try {
                await fetchOfferingProducts(offerings[selectedOffering].id!);
              } catch (error) {
                console.error("Error updating product data:", error);
              }
            } else {
              await addProduct(
                {
                  ...product,
                  icp_cost: Number(product.icp_cost) || 0,
                },
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
