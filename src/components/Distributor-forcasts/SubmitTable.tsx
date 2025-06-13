"use client";

import { FormSection } from "../Shared/Form/Section";
import { Table } from "@mantine/core";
import DateSwitch from "./DateSwitch";
import { useState } from "react";

const SubmitTable = ({
  forecast,
}: {
  forecast: {
    [key: string]: string;
  }[];
}) => {
  const [editableForecast, setEditableForecast] = useState(forecast);

  const handleInputChange = (index: number, key: string, value: string) => {
    const updated = [...editableForecast];
    updated[index][key] = value;
    setEditableForecast(updated);
  };

  const renderTable = (data: typeof editableForecast) => (
    <div className="relative border border-primary rounded-xl border-t-0">
      <Table.ScrollContainer minWidth={768}>
        <Table
          verticalSpacing="sm"
          borderColor="transparent"
          striped="even"
          stripedColor="#F2F4F6"
        >
          <Table.Thead>
            <Table.Tr className="bg-primary text-white">
              <Table.Th className="rounded-ss-xl">Brand</Table.Th>
              <Table.Th>Brand pillar</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Launch ID</Table.Th>
              <Table.Th>Cost</Table.Th>
              <Table.Th>Mar 25</Table.Th>
              <Table.Th>Apr 25</Table.Th>
              <Table.Th>May 25</Table.Th>
              <Table.Th>Jun 25</Table.Th>
              <Table.Th>Jul 25</Table.Th>
              <Table.Th>Aug 25</Table.Th>
              <Table.Th className="rounded-se-xl">Sub Total</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((element, index) => {
              const subtotal = [
                "date1",
                "date2",
                "date3",
                "date4",
                "date5",
                "date6",
              ].reduce((sum, key) => {
                const value = parseFloat(element[key] || "0");
                return sum + (isNaN(value) ? 0 : value);
              }, 0);

              return (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {element.brand}
                  </Table.Td>
                  <Table.Td>{element.pillar}</Table.Td>
                  <Table.Td>{element.sku}</Table.Td>
                  <Table.Td>{element.launchId}</Table.Td>
                  <Table.Td>{element.cost}</Table.Td>

                  {["date1", "date2", "date3", "date4", "date5", "date6"].map(
                    (key) => (
                      <Table.Td key={key}>
                        <input
                          type="text"
                          value={element[key]}
                          onChange={(e) =>
                            handleInputChange(index, key, e.target.value)
                          }
                          className="w-10 bg-transparent rounded px-2 py-1 text-sm text-gray-900"
                        />
                      </Table.Td>
                    )
                  )}

                  <Table.Td className="last:rounded-ee-xl text-center !pr-2">
                    ${subtotal.toFixed(2)}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </div>
  );

  return (
    <div>
      <FormSection title="Offering 121312344" rightSide={<DateSwitch />}>
        {renderTable(editableForecast)}
      </FormSection>

      <FormSection title="Offering 121312344" rightSide={<DateSwitch />}>
        {renderTable(editableForecast)}
      </FormSection>
    </div>
  );
};

export default SubmitTable;
