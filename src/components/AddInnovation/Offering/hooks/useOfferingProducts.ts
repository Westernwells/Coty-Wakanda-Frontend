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
    try {
      const existingProducts = offeringProducts[offeringId] || [];
      const duplicateIRC = existingProducts.find(p => p.irc === product.irc);
      
      if (duplicateIRC) {
        console.error("Product with this IRC already exists");
        return false;
      }
      
      const newProduct = await addProductToOffering(product, offeringId);
      
      await fetchOfferingProducts(offeringId);
      
      if (newProduct) {
        const tempProduct: OfferingMappedProduct = {
          id: newProduct.id,
          irc: product.irc || "",
          currency: product.currency || "EUR",
          price: product.icp_cost || 0,
          icp_cost: product.icp_cost || 0,
          product_type: product.product_type || "saleable",
          pref: product.pref || "non-pref",
          grouping: product.grouping || "1",
          material_description: product.material_description || "",
          brand_id: product.brand_id || "",
          sub_brand_id: product.sub_brand_id || "",
          brand: { 
            id: Number(product.brand_id) || 0, 
            name: "", 
            type: "", 
            created_at: new Date().toISOString() 
          },
          brand_pillar: product.sub_brand_id ? { 
            id: Number(product.sub_brand_id), 
            name: "", 
            created_at: new Date().toISOString(),
            brand: { 
              id: Number(product.brand_id) || 0, 
              name: "", 
              type: "", 
              created_at: new Date().toISOString() 
            } 
          } : null,
          created_at: new Date().toISOString(),
          is_innovation_product: true
        };
        
        // Add to local state for immediate UI update
        addProductToState(offeringId, tempProduct);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding product:", error);
      try {
        await fetchOfferingProducts(offeringId);
      } catch (fetchError) {
        console.error("Error fetching products after add failure:", fetchError);
      }
      return false;
    }
  };

  const updateProductWithRefresh = async (product: Product, offeringId: number) => {
    try {
      // Check if the IRC is being changed to one that already exists
      if (product.irc) {
        const existingProducts = offeringProducts[offeringId] || [];
        const duplicateIRC = existingProducts.find(p => p.irc === product.irc && p.id !== product.id);
        
        if (duplicateIRC) {
          console.error("Another product with this IRC already exists");
          return false;
        }
      }
      
      const updatedProduct = await updateProduct(product, offeringId);
      if (updatedProduct) {
        console.log("Product updated:", updatedProduct);
        
        // Update the product in local state for immediate UI feedback
        updateProductInState(offeringId, product.id, {
          id: product.id,
          irc: product.irc || "",
          currency: product.icp_eur ? "EUR" : product.icp_usd ? "USD" : "EUR",
          price: Number(product.icp_eur || product.icp_usd || 0),
          icp_cost: Number(product.icp_eur || product.icp_usd || 0),
          product_type: product.product_type || "",
          pref: product.pref || "non-pref",
          grouping: String(product.grouping || "1"),
          material_description: product.material_description || "",
          brand_id: product.brand?.id ? String(product.brand.id) : "",
          sub_brand_id: product.brand_pillar?.id ? String(product.brand_pillar.id) : "",
          brand: product.brand,
          brand_pillar: product.brand_pillar,
          created_at: product.created_at || new Date().toISOString(),
          is_innovation_product: true,
        });
        
        // Then fetch the complete data from the server
        setTimeout(() => {
          fetchOfferingProducts(offeringId);
        }, 500);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
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
