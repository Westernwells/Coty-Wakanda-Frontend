import React from "react";
import { Table } from "@mantine/core";

export const EmptyOfferingsMessage: React.FC = () => {
  return (
    <Table.Tr>
      <Table.Td
        colSpan={7}
        className="text-center py-8 text-gray-500"
      >
        No offerings added yet. Click "Add offering" to get started.
      </Table.Td>
    </Table.Tr>
  );
};

export default EmptyOfferingsMessage;
