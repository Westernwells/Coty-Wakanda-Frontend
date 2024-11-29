import { Group, Title } from "@mantine/core";
import Logout from "./Logout";

const Headline = ({ title }: { title: string }) => {
    return (
        <header className="py-3 mt-[62px] md:mt-10  w-full container md:py-0">
            <Group justify="space-between" align="center">
                <Title
                    order={1}
                    className="text-primary font-semibold text-4xl"
                >
                    {title}
                </Title>
                <Logout />
            </Group>
        </header>
    );
};

export default Headline;
