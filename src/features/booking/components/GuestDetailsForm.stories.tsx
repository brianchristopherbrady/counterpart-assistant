import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect, waitFor } from "@storybook/test";
import { GuestDetailsForm } from "./GuestDetailsForm";

const meta: Meta<typeof GuestDetailsForm> = {
  title: "Booking/GuestDetailsForm",
  component: GuestDetailsForm,
  args: {
    onSubmit: () => {},
    onBack: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof GuestDetailsForm>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: {
    defaultValues: {
      fullName: "Jordan Blake",
      dateOfBirth: "1988-04-12",
      contact: { method: "email", value: "jordan.blake@example.com" },
    },
  },
};

/** Submitting empty marks every field invalid. The error text itself lives inside ds-field's
 * Shadow DOM, invisible to DOM-only queries — assert on the reflected `invalid` attribute instead. */
export const ValidationOnEmptySubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ds-button's accessible role lives inside its Shadow DOM, invisible to DOM-only role
    // queries — match by its slotted (light-DOM) text content instead.
    await userEvent.click(canvas.getByText(/continue to review/i));
    await waitFor(() => {
      const fields = canvasElement.querySelectorAll("ds-field");
      expect(fields.length).toBeGreaterThan(0);
      fields.forEach((field) => expect(field.hasAttribute("invalid")).toBe(true));
    });
  },
};
