import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/design-system/react/Button";

const meta: Meta<typeof Button> = {
  title: "Design System/Button",
  component: Button,
  args: { children: "Confirm booking" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = { args: { intent: "secondary" } };

export const Destructive: Story = { args: { intent: "destructive", children: "Cancel appointment" } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const Pending: Story = { args: { pending: true, children: "Booking…" } };

export const Disabled: Story = { args: { disabled: true } };

export const LongContent: Story = {
  args: { children: "Confirm this new-patient booking with Dr. Maria Chen at Downtown Clinic" },
};
