import { useState } from "react";
import { useCreateOfferingProduct } from "@/api/innovations/offerings/products/create-product";
import { useUpdateOfferingProduct } from "@/api/innovations/offerings/products/update-product";
import { useDeleteOfferingProduct } from "@/api/innovations/offerings/products/delete-product";
import { CreateOfferingProductDTO } from "@/api/innovations/offerings/products/create-product";
import { OfferingProductFormValues } from "../../AddProductToOfferingModal";
import { Product } from "@/types";

export const useProductOperations = (innovationId: string) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const createProductMutation = useCreateOfferingProduct({
    mutationConfig: {
      onError: (error) => {
        console.error("Failed to create product:", error);
      },
    },
  });

  const updateProductMutation = useUpdateOfferingProduct({});
  const deleteProductMutation = useDeleteOfferingProduct({});

  const addProductToOffering = async (
    product: Omit<OfferingProductFormValues, "icp_cost"> & { icp_cost: number },
    offeringId: number
  ) => {
    if (!innovationId) return false;

    try {
      setIsAddingProduct(true);
      
      const productData: CreateOfferingProductDTO = {
        irc: product.irc,
        material_description: product.material_description || "",
        icp_cost: Number(product.icp_cost) || 0,
        price: Number(product.icp_cost) || 0,
        currency: product.currency || "EUR",
        brand_id: product.brand_id || "",
        sub_brand_id: product.sub_brand_id,
        product_type: product.product_type || "saleable",
        pref: product.pref || "non-pref",
        grouping: product.grouping || "1",
      };
      
      const response = await createProductMutation.mutateAsync({
        innovationId,
        offeringId,
        data: productData,
      });

      return response.data;
    } catch (error: any) {
      console.error("Failed to add product:", error);
      if (error.response?.data) {
        console.error("Server validation errors:", error.response.data);
      }
      return false;
    } finally {
      setIsAddingProduct(false);
    }
  };

  const updateProduct = async (product: Product, offeringId: number) => {
    if (!innovationId) return false;

    try {
      setIsUpdatingProduct(true);

      const submissionData: CreateOfferingProductDTO = {
        irc: product.irc || "",
        material_description: product.material_description || "",
        icp_cost: Number(product.icp_eur) || Number(product.icp_usd) || 0,
        price: Number(product.icp_eur) || Number(product.icp_usd) || 0,
        currency: (product.icp_eur ? "EUR" : "USD") as "EUR" | "USD",
        brand_id: product.brand?.id ? String(product.brand.id) : "",
        sub_brand_id: product.brand_pillar?.id ? String(product.brand_pillar.id) : undefined,
        product_type: (product.product_type === "saleable" || product.product_type === "non-saleable")
          ? product.product_type
          : "saleable",
        pref: (product.pref === "pref" || product.pref === "non-pref")
          ? product.pref
          : "non-pref",
        grouping: product.grouping?.toString() as "1" | "2" | "3" || "1",
      };
      
      const response = await updateProductMutation.mutateAsync({
        innovationId,
        offeringId,
        id: product.id,
        data: submissionData,
      });

      return response.data;
    } catch (error: any) {
      // Enhanced error logging to help diagnose validation issues
      console.error("Failed to update product:", error);
      if (error.response?.data) {
        console.error("Server validation errors:", error.response.data);
      }
      return false;
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const deleteProducts = async (offeringId: number, productIds: number[]) => {
    if (!innovationId || !productIds.length) return false;

    try {
      setIsDeletingProduct(true);

      await Promise.all(
        productIds.map((productId) =>
          deleteProductMutation.mutateAsync({
            innovationId,
            offeringId,
            productId,
          })
        )
      );

      return true;
    } catch (error) {
      console.error("Failed to delete products:", error);
      return false;
    } finally {
      setIsDeletingProduct(false);
    }
  };

  return {
    isAddingProduct,
    isUpdatingProduct,
    isDeletingProduct,
    addProductToOffering,
    updateProduct,
    deleteProducts,
  };
};

export default useProductOperations;
