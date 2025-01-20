import { useUserLogin } from "@/api/post-login";
import { useUserStore } from "@/stores/userStore";
import {
  Box,
  Button,
  Container,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth) {
      throw redirect({ to: search.redirect || "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const login = useUserStore((state) => state.signIn);
  const user = useUserStore((state) => state.user);
  const userLoginMutations = useUserLogin({
    mutationConfig: {
      onSuccess: (e) => {
        login(e.data.data.user, e.data.data.token);
        navigate({ to: search.redirect || "/" });
      },
    },
  });

  useEffect(() => {
    if (user) {
      navigate({ to: search.redirect || "/" });
    }
  }, [user]);
  return (
    <Container
      size={420}
      className="flex flex-col align-middle justify-center h-screen pt-[60px] md:pt-0"
    >
      <Title ta="center" className="font-extrabold">
        Welcome back!
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form
          onSubmit={form.onSubmit((values) =>
            userLoginMutations.mutate({ data: values })
          )}
        >
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />
          <Button
            type="submit"
            variant="outline"
            className="border-primary w-full mt-6 bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white hover:text-primary hover:bg-opacity-40 transition-all ease-in-out duration-300"
            disabled={userLoginMutations.isPending}
          >
            Sign in
          </Button>
          {userLoginMutations.isError && (
            <Text className="text-[#fa5252]" size="sm">
              Your Email or Password are incorrect
            </Text>
          )}
        </form>
      </Paper>
      {userLoginMutations.isPending && (
        <Box pos="absolute" top={0} left={0} w="100%" h="100%">
          <LoadingOverlay
            visible={userLoginMutations.isPending}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          {/* ...other content */}
        </Box>
      )}
    </Container>
  );
}
