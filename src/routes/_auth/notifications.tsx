import LightBulbIcon from "@/components/Icons/LightBulbIcon";
import Headline from "@/components/Shared/Headline";
import { Button, Notification } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Headline title="Notifications" />
      <div className="bg-white shadow-md rounded-lg p-6 mt-5">
        <Notification
          radius="xs"
          className="mt-5"
          classNames={{
            root: "bg-[#0244CF1A]",
          }}
        >
          <div className="flex">
            <LightBulbIcon fill="#0F62FE" />
            <div className="ms-5">
              <p className="font-semibold">
                orem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <p>
                Vestibulum malesuada lectus sed mollis fringilla. Nam quis
                libero a erat tempus condimentum. Vestibulum sed fermentum leo.
                Nullam in condimentum dolor.
              </p>
              <Button className="mt-5">Hello</Button>
            </div>
          </div>
        </Notification>
        <Notification
          radius="xs"
          className="mt-5"
          classNames={{
            root: "bg-[#0244CF1A]",
          }}
        >
          <div className="flex">
            <LightBulbIcon fill="#0F62FE" />
            <div className="ms-5">
              <p className="font-semibold">
                orem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <p>
                Vestibulum malesuada lectus sed mollis fringilla. Nam quis
                libero a erat tempus condimentum. Vestibulum sed fermentum leo.
                Nullam in condimentum dolor.
              </p>
              <Button className="mt-5">Hello</Button>
            </div>
          </div>
        </Notification>
      </div>
    </div>
  );
}
