import { Pagination, Table } from "@mantine/core";

import ChevronDownIcon from "../Icons/ChevronDownIcon";
import PencilIcon from "../Icons/PencilIcon";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import EyeIcon from "../Icons/EyeIcon";
import { Filters, Product } from "@/types";

function ProductsTable({
  filters,
  data,
}: {
  data: Product[];
  filters: Filters;
}) {
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const role = useUserStore((state) => state.user)?.role;

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      // Search filter (case-insensitive)
      const searchTerm = filters.search.toLowerCase();
      const searchMatch =
        !filters.search ||
        item.category.name.toLowerCase().includes(searchTerm) ||
        item.house.toLowerCase().includes(searchTerm) ||
        item.gender.toLowerCase().includes(searchTerm);

      // brand filter
      const brandMatch =
        !filters.brand ||
        item.brand.name.toLowerCase() === filters.brand.toLowerCase();

      return searchMatch && brandMatch;
    });
  }, [data, filters]);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, activePage]);

  // Reset to first page when filters change
  useEffect(() => {
    setActivePage(1);
  }, [filters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-5">
      {/* Table */}
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
                <Table.Th>Description</Table.Th>
                <Table.Th>Distributor</Table.Th>
                <Table.Th>IRC</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th className="rounded-se-xl"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedData.map((product, index) => (
                <Table.Tr key={index}>
                  <Table.Td className="first:rounded-es-xl">
                    {product.brand.name}
                  </Table.Td>
                  <Table.Td>{product.brand.name}</Table.Td>
                  <Table.Td>{product.material_description}</Table.Td>
                  <Table.Td>{product.factory}</Table.Td>
                  <Table.Td>{product.irc}</Table.Td>
                  <Table.Td>
                    <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                      {product.pref}
                    </span>
                  </Table.Td>
                  {role === "admin" ? (
                    <Table.Td
                      className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                      onClick={() => {
                        navigate({
                          to: "/edit-product/$productId",
                          params: { productId: `${product.id}` },
                        });
                      }}
                    >
                      <PencilIcon />
                    </Table.Td>
                  ) : (
                    <Table.Td
                      className="last:rounded-ee-xl text-center !pr-2 cursor-pointer"
                      onClick={() => {
                        navigate({
                          to: "/products/$productId",
                          params: { productId: `${product.id}` },
                        });
                      }}
                    >
                      <EyeIcon />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 w-full">
          <div className="hidden sm:block">
            <Pagination.Root
              total={totalPages}
              value={activePage}
              onChange={setActivePage}
              color="#00EBB2"
              radius="xl"
              siblings={1}
              boundaries={3}
              classNames={{
                root: "w-full flex justify-center items-center",
                control:
                  "text-primary text-sm font-medium data-[active=true]:bg-green border-none size-10",
              }}
            >
              <Pagination.Previous
                icon={() => (
                  <button className="text-primary opacity-50 text-sm font-medium flex items-center gap-2 pointer-events-none pr-20">
                    <span className="transform rotate-90">
                      <ChevronDownIcon />
                    </span>
                    Previous
                  </button>
                )}
              />
              <Pagination.Items />
              <Pagination.Next
                icon={() => (
                  <button className="text-primary gap-2 text-sm font-medium flex items-center pl-4">
                    Next
                    <span className="transform -rotate-90">
                      <ChevronDownIcon />
                    </span>
                  </button>
                )}
              />
            </Pagination.Root>
          </div>
          {/* Mobile pagination */}
          <div className="sm:hidden w-full">
            <Pagination.Root
              total={totalPages}
              value={activePage}
              onChange={setActivePage}
              color="#00EBB2"
              radius="xl"
              siblings={1}
              boundaries={1}
              classNames={{
                root: "w-full flex justify-center",
                control:
                  "text-primary text-sm font-medium data-[active=true]:bg-green border-none",
              }}
            >
              <Pagination.Previous
                icon={() => (
                  <button className="text-primary opacity-50 text-sm font-medium flex items-center gap-2 pointer-events-none pr-4">
                    <span className="transform rotate-90">
                      <ChevronDownIcon />
                    </span>
                    Previous
                  </button>
                )}
              />
              <Pagination.Items />
              <Pagination.Next
                icon={() => (
                  <button className="text-primary gap-2 text-sm font-medium flex items-center pl-4">
                    Next
                    <span className="transform -rotate-90">
                      <ChevronDownIcon />
                    </span>
                  </button>
                )}
              />
            </Pagination.Root>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsTable;
