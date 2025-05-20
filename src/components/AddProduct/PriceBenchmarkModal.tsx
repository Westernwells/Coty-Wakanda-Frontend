import { Modal, Button } from "@mantine/core";
import { PriceBenchmarkSection } from "./PriceBenchmarkSection";
import { Category } from "@/types";
import { Brand } from "@/types";
import { Product } from "@/types";

interface PriceBenchmarkModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: () => void;
  form: unknown;
  brandsData: Brand[];
  productsListData: Product[];
  categoriesData: Category[];
}

export function PriceBenchmarkModal({
  opened,
  onClose,
  onSave,
  form,
  brandsData,
  productsListData,
  categoriesData,
}: PriceBenchmarkModalProps) {
  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      withinPortal={false}
      trapFocus={false}
      className={opened ? "absolute top-0 left-0 h-full w-full" : "hidden"}
    >
      <Modal.Overlay
        bg="linear-gradient(180deg, rgba(0, 37, 84, 0.7) 0%, rgba(0, 235, 178, 0.7) 100%)"
        blur={3}
      />
      <Modal.Content className="!items-center min-w-[50%]">
        <Modal.Body>
          <div className="bg-white rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">
              Set Price Benchmark
            </h2>
            <PriceBenchmarkSection
              form={form}
              brandsData={{
                data: brandsData.map((brand) => ({ ...brand, group: "other" })),
              }}
              productsListData={{
                data: productsListData.map((product) => ({
                  ...product,
                  brand_id: product.brand.id,
                })),
              }}
              categoriesData={{
                data: categoriesData.map((category) => ({
                  ...category,
                  type: "luxury",
                })),
              }}
            />
            <div className="flex justify-end gap-4 mt-8">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="filled" onClick={onSave}>
                Save
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
