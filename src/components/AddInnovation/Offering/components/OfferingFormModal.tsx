import React, { useState, useEffect } from "react";
import { Modal } from "@mantine/core";
import { FormSection } from "../../../Shared/Form/Section";
import { Offering, OfferingFormState } from "../types";
import { useFileUpload } from "@/api/products/upload-document";
import OfferingFormFields from "./OfferingFormFields";
import ModalActions from "./ModalActions";

interface OfferingFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (offering: Offering) => Promise<void>;
  mode: "add" | "edit";
  initialData?: Offering;
  editingIndex?: number | null;
}

export const OfferingFormModal: React.FC<OfferingFormModalProps> = ({
  opened,
  onClose,
  onSubmit,
  mode,
  initialData,
  editingIndex,
}) => {
  const [offeringForm, setOfferingForm] = useState<OfferingFormState>({
    number: "",
    deadline: new Date(),
    icw: new Date(),
    ocd: new Date(),
    type: "",
    deck: "",
    market_deck: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<{
    number: boolean;
    type: boolean;
  }>({
    number: false,
    type: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // File upload mutation
  const fileUploadMutation = useFileUpload({
    mutationConfig: {
      onSuccess: (response, variables) => {
        const fileType = variables.data.get("file_type") as string;
        const publicUrl = response?.data?.data?.public_url;

        if (publicUrl && fileType) {
          setOfferingForm((prev) => ({
            ...prev,
            [fileType]: publicUrl,
          }));
        }
      },
      onError: (error) => {
        console.error("File upload failed:", error);
      },
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setOfferingForm({
        number: initialData.number,
        deadline: initialData.icw,
        icw: initialData.icw,
        ocd: initialData.ocd,
        type: initialData.type,
        deck: initialData.deck,
        market_deck: initialData.market_deck,
      });
    } else {
      resetForm();
    }
  }, [mode, initialData, opened]);

  const resetForm = () => {
    setOfferingForm({
      number: "",
      deadline: new Date(),
      icw: new Date(),
      ocd: new Date(),
      type: "",
      deck: "",
      market_deck: "",
    });
    setIsSubmitted(false);
    setTouchedFields({
      number: false,
      type: false,
    });
  };

  const handleSubmit = async () => {
    if (!offeringForm.number.trim() || !offeringForm.type) {
      setIsSubmitted(true);
      return;
    }

    const newOffering: Offering = {
      id: mode === "edit" ? initialData?.id : undefined,
      number: offeringForm.number.trim(),
      icw: offeringForm.icw,
      ocd: offeringForm.ocd,
      type: offeringForm.type,
      deck: offeringForm.deck,
      market_deck: offeringForm.market_deck,
      products: initialData?.products || [],
    };

    try {
      setIsProcessing(true);
      await onSubmit(newOffering);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to save offering:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (file: File, fileType: "deck" | "market_deck") => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    fileUploadMutation.mutate({ data: formData });
  };

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
      <Modal.Content className="!items-center min-w-[70%]">
        <Modal.Body>
          <div className="bg-white rounded-2xl px-6 mt-6">
            <div className="space-y-6">
              <FormSection title={mode === "add" ? "Add Offering" : "Edit Offering"}>
                <OfferingFormFields
                  offeringForm={offeringForm}
                  setOfferingForm={setOfferingForm}
                  touchedFields={touchedFields}
                  setTouchedFields={setTouchedFields}
                  isSubmitted={isSubmitted}
                />
              </FormSection>

              <ModalActions
                onClose={onClose}
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
                mode={mode}
              />
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default OfferingFormModal;
