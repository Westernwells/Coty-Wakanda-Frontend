import {
    updateProfileInputSchema,
    useUpdateProfile,
} from "@/api/user/post-user";
import ExitIcon from "@/components/Icons/ExitIcon";
import RefreshIcon from "@/components/Icons/RefreshIcon";
import { FormSection } from "@/components/Shared/Form/Section";
import Headline from "@/components/Shared/Headline";
import { selectStyles, textInputStyles } from "@/components/Shared/Styles";
import { useUserStore } from "@/stores/userStore";
import { User } from "@/types";
import { Button, Grid, Group, Select, TextInput } from "@mantine/core";
import { Form, useForm, zodResolver } from "@mantine/form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/profile")({
    component: RouteComponent,
});

function RouteComponent() {
    const user = useUserStore((state) => state.user);
    const form = useForm<User>({
        initialValues: user as User,
        validate: zodResolver(updateProfileInputSchema),
    });

    const updateUserProfile = useUpdateProfile();

    return (
        <div className="w-full">
            <Headline title="Profile" />
            <Form
                form={form}
                onSubmit={() => {
                    const values = form.getValues();
                    const parsing = updateProfileInputSchema.safeParse(values);
                    if (!parsing.success) {
                        parsing.error.issues.map((issue) => {
                            console.log(issue);
                            form.setFieldError(
                                issue.path[0] as string,
                                issue.message
                            );
                        });
                        return;
                    }
                    updateUserProfile.mutate({ data: form.getValues() });
                }}
            >
                <FormSection title="Personal Details">
                    <Grid
                        gutter={{
                            sm: 32,
                            base: 16,
                        }}
                    >
                        <Grid.Col
                            span={{
                                sm: 6,
                                base: 12,
                            }}
                        >
                            <TextInput
                                {...form.getInputProps("name")}
                                label="Name"
                                classNames={textInputStyles}
                            />
                        </Grid.Col>
                        <Grid.Col
                            span={{
                                sm: 6,
                                base: 12,
                            }}
                        >
                            <TextInput
                                {...form.getInputProps("surname")}
                                label="Surname"
                                classNames={textInputStyles}
                            />
                        </Grid.Col>
                        <Grid.Col
                            span={{
                                sm: 6,
                                base: 12,
                            }}
                        >
                            <TextInput
                                {...form.getInputProps("email")}
                                label="Email"
                                type="email"
                                classNames={textInputStyles}
                                disabled
                            />
                        </Grid.Col>
                        <Grid.Col
                            span={{
                                sm: 6,
                                base: 12,
                            }}
                        >
                            <TextInput
                                {...form.getInputProps("phone")}
                                label="Contact number"
                                classNames={textInputStyles}
                                disabled
                            />
                        </Grid.Col>
                        <Grid.Col
                            span={{
                                sm: 6,
                                base: 12,
                            }}
                        >
                            <Select
                                {...form.getInputProps("department")}
                                label="Department"
                                classNames={selectStyles}
                                data={[
                                    { label: "1", value: "1" },
                                    { label: "2", value: "2" },
                                ]}
                                clearable
                                searchable
                            />
                        </Grid.Col>
                    </Grid>
                </FormSection>
                <FormSection title="Security">
                    <Grid
                        gutter={{
                            sm: 32,
                            base: 16,
                        }}
                    >
                        <Grid.Col
                            span={{
                                sm: 6,
                                base: 12,
                            }}
                        >
                            <TextInput
                                {...form.getInputProps("password")}
                                label="Password"
                                type="password"
                                disabled
                                classNames={textInputStyles}
                            />
                        </Grid.Col>
                    </Grid>
                </FormSection>
                <Group justify="end" mt="md">
                    <Button
                        variant="outline"
                        className="border-primary bg-transparent border-s-e rounded-ee-xl border-2 text-primary text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                        leftSection={<ExitIcon />}
                    >
                        Cancel
                    </Button>
                    <Button
                        leftSection={<RefreshIcon />}
                        type="submit"
                        variant="outline"
                        className="border-primary bg-primary border-s-e rounded-ee-xl border-2 text-white text-sm font-medium px-1 md:px-[10px] hover:bg-white  hover:bg-opacity-40 transition-all ease-in-out duration-300"
                        disabled={updateUserProfile.isPending}
                    >
                        Update
                    </Button>
                </Group>
            </Form>
        </div>
    );
}
