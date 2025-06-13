import React from "react";
import { Button } from "@mantine/core";

interface ConfirmationModalProps {
  open: boolean;
  title?: string;
  subtext?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

function ConfirmationModal({
  open,
  title = "Are you sure?",
  subtext,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
  confirmButtonClassName = "",
  cancelButtonClassName = "",
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-lg">
        <h2 className="text-2xl font-bold text-[#00214D] mb-4">{title}</h2>
        {subtext && <div className="text-[#00214D] mb-8">{subtext}</div>}
        <div className="flex gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className={`border-primary rounded-ee-xl text-primary text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300 ${cancelButtonClassName}`}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant="default"
            className={`border-none w-28 bg-primary rounded-ee-xl text-white text-sm font-medium px-[14px] hover:bg-opacity-90 transition-all ease-in-out duration-300 ${confirmButtonClassName}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ConfirmationModal };