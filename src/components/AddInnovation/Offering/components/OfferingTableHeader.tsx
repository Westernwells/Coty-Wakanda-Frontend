import React from "react";
import { Table } from "@mantine/core";

export const OfferingTableHeader: React.FC = () => {
  return (
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
  );
};

export default OfferingTableHeader;
