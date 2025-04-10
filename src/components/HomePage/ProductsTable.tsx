import { getProducts } from "@/api/products/get-products";
import { useUserStore } from "@/stores/userStore";
import { Filters, Meta, Product } from "@/types";
import { Button, Group, Loader, NumberInput, Table } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EyeIcon from "../Icons/EyeIcon";
import FileDownloadIcon from "../Icons/FileDownloadIcon";
import PencilIcon from "../Icons/PencilIcon";
import PlusIcon from "../Icons/PlusIcon";

function ProductsTable({
  filters,
  initialData,
  initialMeta,
  isEdit,
  setIsEdit,
}: {
  initialData: Product[];
  initialMeta: Meta;
  filters: Filters;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const role = useUserStore((state) => state.user)?.role;

  const [products, setProducts] = useState<Product[]>(initialData);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [hasMore, setHasMore] = useState(initialMeta.has_next);
  const initialValues = products.map((product) => ({
    id: product.id,
    icp_eur: product.icp_eur,
    icp_usd: product.icp_usd,
  }));

  const form = useForm({
    initialValues: {
      products: initialValues,
    },
  });

  // ✅ Reset product list when filters change
  useEffect(() => {
    setProducts(initialData);
    form.reset();
    setMeta(initialMeta);
    setHasMore(initialMeta.has_next);
  }, [filters, initialData, initialMeta]);

  const fetchMoreProducts = async () => {
    if (!meta?.has_next) return;

    try {
      const response = await getProducts({
        cursor: meta.cursor,
        page_size: 20,
        filter: filters,
      });

      setProducts((prev) => [...prev, ...response.data]);
      response.data.map((product) =>
        form.insertListItem("products", {
          id: product.id,
          icp_eur: product.icp_eur,
          icp_usd: product.icp_usd,
        })
      );
      setMeta(response.meta);
      setHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more products:", error);
      setHasMore(false);
    }
  };

  if (!initialData.length) {
    return <p>Sorry no data with current filters, please try changing them</p>;
  }

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
                  <Table.Th>IRC</Table.Th>
                  <Table.Th>ICP EU</Table.Th>
                  <Table.Th>ICP USD</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th className="rounded-se-xl"></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {products.map((product, index) => (
                  <Table.Tr key={product.id}>
                    <Table.Td className="first:rounded-es-xl">
                      {product.brand.name}
                    </Table.Td>
                    <Table.Td>{product.brand.type}</Table.Td>
                    <Table.Td>{product.brand.name}</Table.Td>
                    <Table.Td>{product.material_description}</Table.Td>
                    <Table.Td>{product.irc}</Table.Td>
                    {/* <Table.Td>{product.icp_eur}</Table.Td> */}
                    <Table.Td>
                      {isEdit ? (
                        <NumberInput
                          {...form.getInputProps(`products.${index}.icp_eur`)}
                          hideControls
                          allowNegative={false}
                          classNames={{
                            input:
                              "!bg-primary/40 border-2 p-px text-center border-primary",
                          }}
                        />
                      ) : (
                        product.icp_eur
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <NumberInput
                          {...form.getInputProps(`products.${index}.icp_usd`)}
                          hideControls
                          allowNegative={false}
                          classNames={{
                            input:
                              "!bg-primary/40 border-2 p-px text-center border-primary",
                          }}
                        />
                      ) : (
                        product.icp_usd
                      )}
                    </Table.Td>
                    <Table.Td>
                      <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                        {product.pref}
                      </span>
                    </Table.Td>

                    <Table.Td>
                      <span className="text-white bg-blue px-[10px] py-0.5 rounded-full text-nowrap">
                        {product.product_type}
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
        {isEdit && (
          <Group
            className="fixed bg-white rounded-3xl border border-primary bottom-3 left-1/2 py-3 px-10 z-10"
            justify="flex-end"
            mt="xl"
            gap={10}
          >
            <Button
              variant="outline"
              className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
              leftSection={<FileDownloadIcon />}
              onClick={() => setIsEdit(false)}
            >
              Save
            </Button>
            <Button
              leftSection={<PlusIcon />}
              type="submit"
              variant="outline"
              className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
              onClick={() => console.log(form.getValues())}
            >
              Submit
            </Button>
          </Group>
        )}
      </div>
    </div>
  );
}

export default ProductsTable;
