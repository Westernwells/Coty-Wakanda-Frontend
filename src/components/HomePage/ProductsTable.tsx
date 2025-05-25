import { getProducts } from "@/api/products/get-products";
import { useUserStore } from "@/stores/userStore";
import { Filters, Meta, Product } from "@/types";
import { Loader, NumberInput, Table, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EyeIcon from "../Icons/EyeIcon";
import PencilIcon from "../Icons/PencilIcon";
import { getBrands } from "@/api/get-brands";
import { getBrandPillars } from "@/api/get-brandPillars";
import { CustomSelect } from "./CustomSelect";
import { useBulkUpdateProduct } from "@/api/products/bulk-update";

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
    product_id: product.id,
    icp_eur: product.icp_eur,
    icp_usd: product.icp_usd,
    brand_id: product.brand.id.toString(),
    brand_type: product.brand.type,
    brand_pillar_id: product.brand_pillar?.id || "",
    sub_brand_id: product.subcategory?.id || "",
    material_description: product.material_description ?? "",
    irc: product.irc ?? "",
  }));

  const form = useForm({
    initialValues: {
      products: initialValues,
    },
  });

  // Track edited fields as a set of keys like "products.2.icp_eur"
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const initialValuesRef = useRef(initialValues);

  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [brandPillarOptions, setBrandPillarOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const {
    mutate: bulkUpdate,
    isPending: isBulkUpdating,
    isSuccess: isBulkUpdateSuccess,
    isError: isBulkUpdateError,
    error: bulkUpdateError,
  } = useBulkUpdateProduct({});

  function handleNumberInputChange(path: string, value: number | "") {
    form.setFieldValue(path, value);
    // Parse index and field from path, e.g., "products.2.icp_eur"
    const parts = path.split(".");
    const idx = Number(parts[1]);
    const field = parts[2] as "icp_eur" | "icp_usd";
    const initial = initialValuesRef.current?.[idx]?.[field];
    // Convert value to string for comparison, since initial is string
    const valueStr = value === "" ? "" : String(value);
    if (valueStr !== initial) {
      setEditedFields((prev) => new Set(prev).add(path));
    } else {
      setEditedFields((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  }

  function handleTextInputChange(path: string, value: string) {
    form.setFieldValue(path, value);
    const parts = path.split(".");
    const idx = Number(parts[1]);
    const field = parts[2] as "material_description" | "irc";
    const initial = initialValuesRef.current?.[idx]?.[field];
    if (value !== initial) {
      setEditedFields((prev) => new Set(prev).add(path));
    } else {
      setEditedFields((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  }

  // ✅ Reset product list when filters change
  useEffect(() => {
    setProducts(initialData);
    form.reset();
    setMeta(initialMeta);
    setHasMore(initialMeta.has_next);
  }, [filters, initialData, initialMeta]);

  useEffect(() => {
    getBrands().then((res) => {
      setBrandOptions(
        res.data.map((brand) => ({
          value: brand.id.toString(),
          label: brand.name,
        }))
      );
    });
    getBrandPillars().then((res) => {
      setBrandPillarOptions(
        res.data.map((pillar) => ({
          value: pillar.id.toString(),
          label: pillar.name,
        }))
      );
    });
  }, []);

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
          product_id: product.id,
          brand_id: product.brand.id.toString(),
          division: product.division,
          icp_eur: product.icp_eur,
          icp_usd: product.icp_usd,
          brand_type: product.brand.type,
          brand_pillar_id: product.brand_pillar?.id?.toString() || "",
          sub_brand_id: product.subcategory?.id || "",
          material_description: product.material_description ?? "",
          irc: product.irc ?? "",
        })
      );
      setMeta(response.meta);
      setHasMore(response.meta.has_next);
    } catch (error) {
      console.error("Error fetching more products:", error);
      setHasMore(false);
    }
  };

  function getChangedProducts() {
    const changedIndices = Array.from(editedFields)
      .map((path) => Number(path.split(".")[1]))
      .filter((v, i, a) => a.indexOf(v) === i);

    const changedProducts = changedIndices.map((idx) => {
      // Get the original product
      const original = products[idx];
      // Get the edited values
      const edited = form.values.products[idx];

      // Build the full payload, using original for all required fields,
      // and edited for the fields that can be changed in the UI
      return {
        product_id: Number(edited.product_id),
        brand_id: Number(edited.brand_id),
        sub_brand_id: edited.sub_brand_id
          ? Number(edited.sub_brand_id)
          : undefined,
        division: original.division,
        material_description: edited.material_description,
        irc: edited.irc,
        icp_eur: edited.icp_eur !== "" ? String(edited.icp_eur) : undefined,
        icp_usd: edited.icp_usd !== "" ? String(edited.icp_usd) : undefined,
      };
    });

    return { products: changedProducts };
  }

  if (!initialData.length) {
    return <p>Sorry no data with current filters, please try changing them</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg  mt-5">
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
                      {isEdit ? (
                        brandOptions.length > 0 ? (
                          <CustomSelect
                            value={String(
                              form.values.products[index].brand_id ?? ""
                            )}
                            options={brandOptions}
                            onChange={(val) => {
                              form.setFieldValue(
                                `products.${index}.brand_id`,
                                val
                              );
                              setEditedFields((prev) => {
                                const next = new Set(prev);
                                next.add(`products.${index}.brand_id`);
                                return next;
                              });
                            }}
                            isChanged={editedFields.has(
                              `products.${index}.brand_id`
                            )}
                          />
                        ) : (
                          <div className="w-full h-10 bg-gray-100 rounded animate-pulse" />
                        )
                      ) : (
                        product.brand.name
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <CustomSelect
                          value={String(
                            form.values.products[index].brand_type ?? ""
                          )}
                          options={[
                            { value: "Mass", label: "Mass" },
                            { value: "Luxury", label: "Luxury" },
                          ]}
                          onChange={(val) => {
                            form.setFieldValue(
                              `products.${index}.brand_type`,
                              val
                            );
                            setEditedFields((prev) => {
                              const next = new Set(prev);
                              next.add(`products.${index}.brand_type`);
                              return next;
                            });
                          }}
                          isChanged={editedFields.has(
                            `products.${index}.brand_type`
                          )}
                        />
                      ) : (
                        product.brand.type
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        brandPillarOptions.length > 0 ? (
                          <CustomSelect
                            value={String(
                              form.values.products[index].brand_pillar_id ?? ""
                            )}
                            options={brandPillarOptions}
                            onChange={(val) => {
                              form.setFieldValue(
                                `products.${index}.brand_pillar_id`,
                                val
                              );
                              setEditedFields((prev) => {
                                const next = new Set(prev);
                                next.add(`products.${index}.brand_pillar_id`);
                                return next;
                              });
                            }}
                            isChanged={editedFields.has(
                              `products.${index}.brand_pillar_id`
                            )}
                          />
                        ) : (
                          <div className="w-full h-10 bg-gray-100 rounded animate-pulse" />
                        )
                      ) : (
                        product.brand_pillar?.name || "-"
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <TextInput
                          {...form.getInputProps(
                            `products.${index}.material_description`
                          )}
                          styles={{
                            input: {
                              border: editedFields.has(
                                `products.${index}.material_description`
                              )
                                ? "1px solid #0F62FE"
                                : "1px solid #94a3b8", // Tailwind border-gray-400
                              backgroundColor: "transparent",
                              textAlign: "center",
                              padding: "2px",
                              fontSize: "12px",
                            },
                          }}
                          onChange={(e) =>
                            handleTextInputChange(
                              `products.${index}.material_description`,
                              e.currentTarget.value
                            )
                          }
                          value={
                            form.values.products[index].material_description
                          }
                          data-testid="material-description-input"
                        />
                      ) : (
                        product.material_description
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <TextInput
                          {...form.getInputProps(`products.${index}.irc`)}
                          styles={{
                            input: {
                              border: editedFields.has(`products.${index}.irc`)
                                ? "px solid #0F62FE"
                                : "1px solid #94a3b8",
                              backgroundColor: "transparent",
                              textAlign: "center",
                              padding: "2px",
                              fontSize: "12px",
                            },
                          }}
                          onChange={(e) =>
                            handleTextInputChange(
                              `products.${index}.irc`,
                              e.currentTarget.value
                            )
                          }
                          value={form.values.products[index].irc}
                          data-testid="irc-input"
                        />
                      ) : (
                        product.irc
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isEdit ? (
                        <NumberInput
                          {...form.getInputProps(`products.${index}.icp_eur`)}
                          hideControls
                          allowNegative={false}
                          onChange={(value) => {
                            if (typeof value === "number" || value === "") {
                              handleNumberInputChange(
                                `products.${index}.icp_eur`,
                                value
                              );
                            }
                          }}
                          styles={{
                            input: {
                              border: editedFields.has(
                                `products.${index}.icp_eur`
                              )
                                ? "1px solid #0F62FE"
                                : "1px solid #94a3b8",
                              backgroundColor: "transparent",
                              textAlign: "center",
                              padding: "2px",
                              fontSize: "12px",
                            },
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
                          onChange={(value) => {
                            if (typeof value === "number" || value === "") {
                              handleNumberInputChange(
                                `products.${index}.icp_usd`,
                                value
                              );
                            }
                          }}
                          styles={{
                            input: {
                              border: editedFields.has(
                                `products.${index}.icp_usd`
                              )
                                ? "1px solid #0F62FE"
                                : "1px solid #94a3b8",
                              backgroundColor: "transparent",
                              textAlign: "center",
                              padding: "2px",
                              fontSize: "12px",
                            },
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
          <div className="fixed left-1/2 bottom-3 z-10 pl-40 -translate-x-1/2">
            <div className="flex items-center bg-primary rounded-2xl px-8 py-3 shadow-lg w-max">
              <button
                type="button"
                className="text-white text-base font-medium px-6 py-2 focus:outline-none transition-colors hover:bg-white hover:text-primary rounded-xl"
                onClick={() => {
                  setIsEdit(false);
                  setEditedFields(new Set());
                  form.reset();
                }}
              >
                Cancel editing
              </button>
              <div className="h-6 w-px bg-gray-500 mx-4" />
              <button
                type="submit"
                className="text-white text-base font-medium px-6 py-2 focus:outline-none transition-colors hover:bg-white hover:text-primary rounded-xl disabled:opacity-60"
                disabled={isBulkUpdating}
                onClick={() => {
                  const changed = getChangedProducts();
                  bulkUpdate(
                    { data: { products: changed.products } },
                    {
                      onSuccess: () => {
                        setIsEdit(false);
                      },
                    }
                  );
                }}
              >
                {isBulkUpdating ? "Saving..." : "Save & done edit"}
              </button>
            </div>
          </div>
        )}
        {isBulkUpdateError && (
          <div className="text-red-500 text-sm mt-2">
            {bulkUpdateError?.message || "Failed to update products."}
          </div>
        )}
        {isBulkUpdateSuccess && (
          <div className="text-green-600 text-sm mt-2">
            Products updated successfully!
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsTable;
