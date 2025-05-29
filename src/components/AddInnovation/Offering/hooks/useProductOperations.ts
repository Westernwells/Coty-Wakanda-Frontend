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

      const response = await createProductMutation.mutateAsync({
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

      return response.data;
    } catch (error) {
      console.error("Failed to add product:", error);
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

      const response = await updateProductMutation.mutateAsync({
        innovationId,
        offeringId,
        id: product.id,
        data: submissionData,
      });

      return response.data;
    } catch (error) {
      console.error("Failed to update product:", error);
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
