import React from "react";
import { Button } from "@mantine/core";

interface ModalActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  mode: "add" | "edit";
}

export const ModalActions: React.FC<ModalActionsProps> = ({
  onClose,
  onSubmit,
  isProcessing,
  mode,
}) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        type="button"
        variant="outline"
        className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:bg-opacity-40 transition-all ease-in-out duration-300"
        onClick={onClose}
        disabled={isProcessing}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="outline"
        className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-primary/90 hover:bg-opacity-40 transition-all ease-in-out duration-300"
        onClick={onSubmit}
        disabled={isProcessing}
      >
        {isProcessing
          ? "Saving..."
          : mode === "add"
            ? "Add Offering"
            : "Update Offering"}
      </Button>
    </div>
  );
};

export default ModalActions;
