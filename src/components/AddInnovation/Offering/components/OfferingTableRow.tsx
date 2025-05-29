import React from "react";
import { Table } from "@mantine/core";
import { Offering, OfferingMappedProduct, DistributorData } from "../types";
import { Product } from "@/types";
import OfferingRow from "./OfferingRow";
import ExpandableOfferingContent from "./ExpandableOfferingContent";

interface OfferingTableRowProps {
  offering: Offering;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  innovationId: string;
  offeringProducts: OfferingMappedProduct[];
  offeringDistributors: DistributorData[];
  isLoading: boolean;
  onAddProduct: (index: number) => void;
  onEditProduct: (index: number, product: Product) => void;
  onProductSelect: (product: Product) => void;
  selectedProducts: number[];
  onSelectedProductsChange: (productIds: number[]) => void;
  isDeleteMode: boolean;
  setIsDeleteMode: (isDeleteMode: boolean) => void;
  onDeleteProducts: (offeringId: number, index: number) => Promise<void>;
  brandOptions: Array<{ value: string; label: string }>;
  brandPillarOptions: Array<{ value: string; label: string }>;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean | ((prevState: boolean) => boolean)) => void;
}

export const OfferingTableRow: React.FC<OfferingTableRowProps> = ({
  offering,
  index,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  innovationId,
  offeringProducts,
  offeringDistributors,
  isLoading,
  onAddProduct,
  onEditProduct,
  selectedProducts,
  onSelectedProductsChange,
  isDeleteMode,
  setIsDeleteMode,
  onDeleteProducts,
  brandOptions,
  brandPillarOptions,
  isEdit,
  setIsEdit,
}) => {
  return (
    <React.Fragment>
      <OfferingRow
        offering={offering}
        index={index}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <Table.Tr>
        <Table.Td colSpan={7} className="p-0">
          <ExpandableOfferingContent
            isExpanded={isExpanded}
            isLoading={isLoading}
            offeringId={offering.id as number}
            innovationId={innovationId}
            index={index}
            products={offeringProducts}
            distributors={offeringDistributors}
            selectedProducts={selectedProducts}
            onSelectedProductsChange={onSelectedProductsChange}
            isDeleteMode={isDeleteMode}
            setIsDeleteMode={setIsDeleteMode}
            onDeleteProducts={() => onDeleteProducts(offering.id as number, index)}
            onAddProduct={() => onAddProduct(index)}
            onEditProduct={(product) => onEditProduct(index, product)}
            brandOptions={brandOptions}
            brandPillarOptions={brandPillarOptions}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
          />
        </Table.Td>
      </Table.Tr>
    </React.Fragment>
  );
};

export default OfferingTableRow;
