import { Button, Group, Modal } from "@mantine/core";
import ExitIcon from "../Icons/ExitIcon";
import RefreshIcon from "../Icons/RefreshIcon";

const SubmitModal = ({
  opened,
  close,
  title = "Submit",
  onSubmit,
}: {
  opened: boolean;
  close: () => void;
  title?: string;
  onSubmit?: (type: "save" | "submit") => void;
}) => {
  return (
    <Modal.Root
      opened={opened}
      onClose={close}
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
          <div className="bg-white rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6 text-primary">{title}</h2>
            <div className="space-y-6">
              <p>
                No edits can be made after submitting, are you sure you want to
                proceed?
              </p>
              <Group justify="flex-end" mt="xl" gap={10}>
                <Button
                  variant="outline"
                  className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  leftSection={<ExitIcon />}
                  onClick={() => {
                    close();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  leftSection={<RefreshIcon />}
                  type="submit"
                  variant="outline"
                  className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                  // disabled={addCoefficientMutations.isPending}
                  onClick={() => {
                    if (onSubmit) {
                      onSubmit("submit");
                    }
                    close();
                  }}
                >
                  Submit
                </Button>
              </Group>
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default SubmitModal;
