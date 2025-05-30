import React from "react";
import { Collapse } from "@mantine/core";
import { OfferingMappedProduct, DistributorData } from "../types";
import ProductActions from "./ProductActions";
import ProductTableContent from "./ProductTableContent";
import { Product } from "@/types";

interface ExpandableOfferingContentProps {
  isExpanded: boolean;
  isLoading: boolean;
  offeringId: number;
  innovationId: string;
  index: number;
  products: OfferingMappedProduct[];
  distributors: DistributorData[];
  selectedProducts: number[];
  onSelectedProductsChange: (productIds: number[]) => void;
  isDeleteMode: boolean;
  setIsDeleteMode: (isDeleteMode: boolean) => void;
  onDeleteProducts: () => Promise<void>;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  brandOptions: Array<{ value: string; label: string }>;
  brandPillarOptions: Array<{ value: string; label: string }>;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean | ((prevState: boolean) => boolean)) => void;
}

export const ExpandableOfferingContent: React.FC<ExpandableOfferingContentProps> = ({
  isExpanded,
  isLoading,
  offeringId,
  innovationId,
  index,
  products,
  distributors,
  selectedProducts,
  onSelectedProductsChange,
  isDeleteMode,
  setIsDeleteMode,
  onDeleteProducts,
  onAddProduct,
  onEditProduct,
  brandOptions,
  brandPillarOptions,
  isEdit,
  setIsEdit,
}) => {
  return (
    <Collapse in={isExpanded}>
      <div className="p-4 bg-gray-50 border-t">
        {isExpanded ? (
          isLoading ? (
            <div>Loading products...</div>
          ) : (
            <>
              <ProductActions
                onAddProduct={onAddProduct}
                isDeleteMode={isDeleteMode}
                setIsDeleteMode={setIsDeleteMode}
                onDeleteProducts={onDeleteProducts}
                hasSelectedProducts={selectedProducts.length > 0}
              />
              
              <ProductTableContent
                offeringId={offeringId}
                innovationId={innovationId}
                products={products}
                distributors={distributors}
                isEdit={isEdit}
                setIsEdit={setIsEdit}
                onProductSelect={() => {}}
                selectedProducts={selectedProducts}
                onSelectedProductsChange={onSelectedProductsChange}
                onLocalEdit={onEditProduct}
                onLocalDelete={(product) => {
                  console.log("Local delete:", product);
                }}
                isDeleteMode={isDeleteMode}
                brandOptions={brandOptions}
                brandPillarOptions={brandPillarOptions}
              />
            </>
          )
        ) : null}
      </div>
    </Collapse>
  );
};

export default ExpandableOfferingContent;
