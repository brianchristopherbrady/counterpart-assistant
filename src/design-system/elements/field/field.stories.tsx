import type { Meta, StoryObj } from "@storybook/react";
import { Field } from "@/design-system/react/Field";

const meta: Meta<typeof Field> = {
  title: "Design System/Field",
  component: Field,
  args: { label: "Full name" },
};
export default meta;

type Story = StoryObj<typeof Field>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { label: "Date of birth", hint: "Used to confirm your identity at check-in.", type: "date" },
};

export const Invalid: Story = {
  args: { invalid: true, errorMessage: "Enter your full name." },
};

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, value: "Jordan Blake" } };

export const LongLabel: Story = {
  args: { label: "Preferred contact method for appointment reminders and updates" },
};
