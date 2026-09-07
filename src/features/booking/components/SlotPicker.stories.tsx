import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect } from "@storybook/test";
import { SlotPicker } from "./SlotPicker";
import { providers, locations } from "@/data/fixtures";
import { zoneForSlot } from "../utils/zone";
import type { Slot } from "@/domain/models";

function makeSlot(id: string, hour: number, mode: "in-person" | "virtual" = "in-person"): Slot {
  return {
    id,
    providerId: providers[0]!.id,
    locationId: locations[0]!.id,
    mode,
    appointmentTypeId: "type-new-patient",
    startInstant: `2026-09-08T${String(hour).padStart(2, "0")}:00:00.000Z`,
    endInstant: `2026-09-08T${String(hour).padStart(2, "0")}:30:00.000Z`,
    version: 1,
  };
}

const sampleSlots: Slot[] = [makeSlot("slot-1", 14), makeSlot("slot-2", 15), makeSlot("slot-3", 18, "virtual")];

const meta: Meta<typeof SlotPicker> = {
  title: "Booking/SlotPicker",
  component: SlotPicker,
  args: {
    slots: sampleSlots,
    zoneForSlot,
    status: "success",
    onSelect: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof SlotPicker>;

export const Default: Story = {};

export const Selected: Story = { args: { selectedSlotId: "slot-2" } };

export const Pending: Story = { args: { status: "pending" } };

export const ErrorState: Story = { args: { status: "error" } };

export const Empty: Story = { args: { slots: [] } };

export const Narrow: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};

/** Verifies a slot is keyboard-focusable and then selectable — matches how FAST's radio activates. */
export const KeyboardSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstOption = await canvas.findByRole("radio", { name: /9:00 AM/i });
    firstOption.focus();
    await expect(firstOption).toHaveFocus();
    await userEvent.click(firstOption);
    await expect(firstOption).toBeChecked();
  },
};
