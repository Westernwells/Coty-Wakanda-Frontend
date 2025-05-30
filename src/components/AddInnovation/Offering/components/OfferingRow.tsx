import React from "react";
import { Table } from "@mantine/core";
import { ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";
import { dateToLocalString } from "@/lib/utils";
import { Offering } from "../types";

interface OfferingRowProps {
  offering: Offering;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const OfferingRow: React.FC<OfferingRowProps> = ({
  offering,
  index,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}) => {
  return (
    <Table.Tr
      className={`${
        index % 2 === 0 ? "bg-gray-50" : "bg-white"
      } hover:bg-gray-100 cursor-pointer transition-colors`}
    >
      <Table.Td className="font-medium">{offering.number}</Table.Td>
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
          <button type="button" onClick={() => onEdit(index)}>
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={() => onDelete(index)}>
            <Trash2 className="size-4" />
          </button>
          <button type="button" onClick={() => onToggleExpand(index)}>
            {isExpanded ? (
              <ChevronUp className="size-5" />
            ) : (
              <ChevronDown className="size-5" />
            )}
          </button>
        </div>
      </Table.Td>
    </Table.Tr>
  );
};

export default OfferingRow;
