import ChevronDownIcon from "@/components/Icons/ChevronDownIcon";
import { FormSection } from "@/components/Shared/Form/Section";
import Headline from "@/components/Shared/Headline";
// import { textInputStyles } from "@/components/Shared/Styles";
import { Button, Grid, TextInput } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/products/$productId")({
  component: RouteComponent,
});

function RouteComponent() {
  // const { productId } = Route.useParams();
  // here we get product details but i just make placeholder for now.
  return (
    <div className="w-full">
      <Headline title="Product name" />
      <section className="mt-3 sm:mt-8">
        <Button
          leftSection={
            <div className="rotate-90">
              <ChevronDownIcon />
            </div>
          }
          variant="default"
          className="border-none bg-transparent   text-primary text-sm font-medium  p-0 before:content-none"
          component={Link}
          to="/products"
        >
          Back to Products
        </Button>
      </section>

      <FormSection title="Product Details">
        <Grid
          gutter={{
            sm: 32,
            base: 16,
          }}
        >
          <Grid.Col
            span={{
              base: 12,
            }}
          >
            <TextInput
              label="Brand"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="Burberry"
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
              label="Offering number"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="160439542"
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
              label="Market"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="North Africa Selective"
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
              label="Location"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="LEXAF"
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
              label="Demand group"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="NAFRICA"
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
              label="IRC"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="99350214927"
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
              label="Descritpion"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="HB BOT PM 24 EDP 50ml PREM IV"
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
              label="Factory"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="Factory - Chartres"
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
              label="Order multiple"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="1"
              disabled
            />
          </Grid.Col>
        </Grid>
      </FormSection>
      <FormSection title="Product Pricing">
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
              label="Pre-active RRSP"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="135"
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
              label="Active RRSP"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="0"
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
              label="BIlling"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="30"
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
              label="Currency"
              classNames={{
                label: "text-primary font-medium text-sm mb-1",
              }}
              placeholder="00"
              disabled
            />
          </Grid.Col>
        </Grid>
      </FormSection>
    </div>
  );
}
