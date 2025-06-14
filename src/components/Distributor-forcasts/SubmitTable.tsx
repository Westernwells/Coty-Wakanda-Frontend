import { FormSection } from "../Shared/Form/Section";
import { Table } from "@mantine/core";
import DateSwitch from "./DateSwitch";

interface SubmitTableProps {
  title?: string;
  forecast: {
    [key: string]: string;
  }[];
  months?: string[];
}

const SubmitTable = ({ title = "Offering", forecast, months = [] }: SubmitTableProps) => {
  return (
    <FormSection title={title} rightSide={<DateSwitch />}>
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
                {months.map((month) => (
                  <Table.Th key={month}>{month}</Table.Th>
                ))}
                <Table.Th className="rounded-se-xl">Sub Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {forecast.map((element, index) => {
                const subtotal = months.reduce((sum, month) => {
                  return sum + (Number(element[month]) || 0);
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
                    {months.map((month) => (
                      <Table.Td key={month}>{element[month]}</Table.Td>
                    ))}
                    <Table.Td className="last:rounded-ee-xl text-center !pr-2">
                      ${subtotal}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
    </FormSection>
  );
};

export default SubmitTable;
