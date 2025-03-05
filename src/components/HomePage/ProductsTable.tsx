import { getProducts } from "@/api/products/get-products";
import { useUserStore } from "@/stores/userStore";
import { Filters, Meta, Product } from "@/types";
import { Loader, Table } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EyeIcon from "../Icons/EyeIcon";
import PencilIcon from "../Icons/PencilIcon";

function ProductsTable({
  filters,
  initialData,
  initialMeta,
}: {
  initialData: Product[];
  initialMeta: Meta;
  filters: Filters;
}) {
  const navigate = useNavigate();
  const role = useUserStore((state) => state.user)?.role;

  const [products, setProducts] = useState<Product[]>(initialData);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [hasMore, setHasMore] = useState(initialMeta.has_next);

  // ✅ Reset product list when filters change
  useEffect(() => {
    setProducts(initialData);
    setMeta(initialMeta);
    setHasMore(initialMeta.has_next);
  }, [filters, initialData, initialMeta]);

  const fetchMoreProducts = async () => {
    if (!meta?.has_next) return;

    try {
      const response = await getProducts({
        cursor: meta.cursor,
        page_size: 20,
        filters,
      });

      setProducts((prev) => [...prev, ...response.data]);
      setMeta(response.meta);
      setHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more products:", error);
      setHasMore(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-5">
      <div className="relative border border-primary rounded-xl border-t-0">
        <InfiniteScroll
          dataLength={products.length}
          next={fetchMoreProducts}
          hasMore={hasMore}
          loader={
            <div className="text-center py-4">
              <Loader size="md" />
            </div>
          }
          endMessage={
            <p className="text-center text-gray-500 py-4">
              No more products to load.
            </p>
          }
        >
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
                  <Table.Th>Brand Type</Table.Th>
                  <Table.Th>Brand Pillar</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Distributor</Table.Th>
                  <Table.Th>IRC</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th className="rounded-se-xl"></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {products.map((product) => (
                  <Table.Tr key={product.id}>
                    <Table.Td className="first:rounded-es-xl">
                      {product.brand.name}
                    </Table.Td>
                    <Table.Td>{product.brand.type}</Table.Td>
                    <Table.Td>{product.brand.name}</Table.Td>
                    <Table.Td>{product.material_description}</Table.Td>
                    <Table.Td>{product.brand_pillar.name}</Table.Td>
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
                            params: {
                              productId: `${product.id}`,
                            },
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
                            params: {
                              productId: `${product.id}`,
                            },
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
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default ProductsTable;
