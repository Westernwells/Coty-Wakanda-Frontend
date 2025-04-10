import { Group, Title } from "@mantine/core";
import Logout from "./Logout";

const Headline = ({ title }: { title: string }) => {
  return (
    <header className="pt-3 md:mt-10  w-full md:py-0">
      <Group justify="space-between" align="center">
        <Title
          order={1}
          className="text-primary font-semibold text-2xl sm:text-4xl"
        >
          {title}
        </Title>
        <Logout />
      </Group>
    </header>
  );
};

export default Headline;
