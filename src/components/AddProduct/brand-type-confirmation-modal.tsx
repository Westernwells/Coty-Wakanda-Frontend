import { Button } from "@mantine/core";

interface BrandTypeConfirmationModalProps {
  open: boolean;
  oldType: string;
  newType: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function BrandTypeConfirmationModal({
  open,
  oldType,
  newType,
  onCancel,
  onConfirm,
}: BrandTypeConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-lg">
        <h2 className="text-2xl font-bold text-[#00214D] mb-4">
          Are you sure?
        </h2>
        <p className="font-bold text-[#00214D] mb-1">
          <span className="font-semibold">“Brand type”</span> was changed from{" "}
          {oldType} to {newType}.
        </p>
        <p className="text-[#00214D] mb-8">
          Making this change will have an effect on all related distributers and
          products.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-primary  border-s-e rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
          >
            Keep editing
          </Button>
          <Button
            variant="default"
            className="border-none w-28 bg-primary border-s-e rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300"
            onClick={onConfirm}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export { BrandTypeConfirmationModal };
