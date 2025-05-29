import { useState } from "react";
import useProductData from "./useProductData";
import useProductOperations from "./useProductOperations";
import { OfferingProductFormValues } from "../../AddProductToOfferingModal";
import { Product } from "@/types";
import { OfferingMappedProduct } from "../types";

export const useOfferingProducts = (innovationId: string) => {
  const [selectedProducts, setSelectedProducts] = useState<Record<number, number[]>>({});
  
  const {
    offeringProducts,
    offeringDistributors,
    loadingOfferings,
    fetchOfferingProducts,
    addProductToState,
    updateProductInState,
    removeProductsFromState,
  } = useProductData(innovationId);
  
  const {
    isAddingProduct,
    isUpdatingProduct,
    isDeletingProduct,
    addProductToOffering,
    updateProduct,
    deleteProducts,
  } = useProductOperations(innovationId);

  const addProduct = async (
    product: Omit<OfferingProductFormValues, "icp_cost"> & { icp_cost: number },
    offeringId: number
  ) => {
    const newProduct = await addProductToOffering(product, offeringId);
    if (newProduct) {
      await fetchOfferingProducts(offeringId);
      return true;
    }
    return false;
  };

  const updateProductWithRefresh = async (product: Product, offeringId: number) => {
    const updatedProduct = await updateProduct(product, offeringId);
    if (updatedProduct) {
      await fetchOfferingProducts(offeringId);
      return true;
    }
    return false;
  };

  const deleteProductsWithRefresh = async (offeringId: number, index: number): Promise<void> => {
    if (!selectedProducts[offeringId]?.length) return;
    
    const success = await deleteProducts(offeringId, selectedProducts[offeringId]);
    if (success) {
      await fetchOfferingProducts(offeringId);
      setSelectedProducts((prev) => ({
        ...prev,
        [offeringId]: [],
      }));
    }
  };

  const updateSelectedProducts = (offeringId: number, productIds: number[]) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [offeringId]: productIds,
    }));
  };

  return {
    offeringProducts,
    offeringDistributors,
    loadingOfferings,
    selectedProducts,
    isAddingProduct,
    isUpdatingProduct,
    isDeletingProduct,
    fetchOfferingProducts,
    addProduct,
    updateProductWithRefresh,
    deleteProductsWithRefresh,
    updateSelectedProducts,
  };
};

export default useOfferingProducts;
