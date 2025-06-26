"use client";

import { FormSection } from "../Shared/Form/Section";
import { Table } from "@mantine/core";
import DateSwitch from "./DateSwitch";
import { useState } from "react";

const SubmitTable = ({ forecast }: {
  forecast: {
    [key: string]: string
  }[]
}) => {
  return (
    <div>
      <FormSection title="Offering 121312344" rightSide={<DateSwitch />}>
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
                {forecast.map((element, index) => (
                  <Table.Tr key={index}>
                    <Table.Td className="first:rounded-es-xl">
                      {element.brand}
                    </Table.Td>
                    <Table.Td>{element.pillar}</Table.Td>
                    <Table.Td>{element.sku}</Table.Td>
                    <Table.Td>{element.launchId}</Table.Td>
                    <Table.Td>{element.cost}</Table.Td>
                    <Table.Td>{element.date1}</Table.Td>
                    <Table.Td>{element.date2}</Table.Td>
                    <Table.Td>{element.date3}</Table.Td>
                    <Table.Td>{element.date4}</Table.Td>
                    <Table.Td>{element.date5}</Table.Td>
                    <Table.Td>{element.date6}</Table.Td>
                    <Table.Td className="last:rounded-ee-xl text-center !pr-2">
                      $00
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </div>
      </FormSection>
      <FormSection title="Offering 121312344" rightSide={<DateSwitch />}>
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
                {forecast.map((element, index) => (
                  <Table.Tr key={index}>
                    <Table.Td className="first:rounded-es-xl">
                      {element.brand}
                    </Table.Td>
                    <Table.Td>{element.pillar}</Table.Td>
                    <Table.Td>{element.sku}</Table.Td>
                    <Table.Td>{element.launchId}</Table.Td>
                    <Table.Td>{element.cost}</Table.Td>
                    <Table.Td>{element.date1}</Table.Td>
                    <Table.Td>{element.date2}</Table.Td>
                    <Table.Td>{element.date3}</Table.Td>
                    <Table.Td>{element.date4}</Table.Td>
                    <Table.Td>{element.date5}</Table.Td>
                    <Table.Td>{element.date6}</Table.Td>
                    <Table.Td className="last:rounded-ee-xl text-center !pr-2">
                      $00
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </div>
      </FormSection>
    </div>
  );
};

export default SubmitTable;