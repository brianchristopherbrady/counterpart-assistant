import type { Meta, StoryObj } from "@storybook/react";
import { ProviderResults } from "./ProviderResults";
import { providers } from "@/data/fixtures";
import { zoneForSlot } from "../utils/zone";
import type { Slot } from "@/domain/models";

const sampleSlot: Slot = {
  id: "slot-1",
  providerId: providers[0]!.id,
  locationId: providers[0]!.locationIds[0]!,
  mode: "in-person",
  appointmentTypeId: "type-new-patient",
  startInstant: "2026-09-08T14:00:00.000Z",
  endInstant: "2026-09-08T14:30:00.000Z",
  version: 1,
};

const nextAvailableByProvider = new Map(providers.slice(0, 4).map((p) => [p.id, sampleSlot]));

const meta: Meta<typeof ProviderResults> = {
  title: "Booking/ProviderResults",
  component: ProviderResults,
  args: {
    providers: providers.slice(0, 4),
    nextAvailableByProvider,
    zoneForSlot,
    status: "success",
    onSelect: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof ProviderResults>;

export const Default: Story = {};

export const Selected: Story = { args: { selectedProviderId: providers[0]!.id } };

export const Pending: Story = { args: { status: "pending" } };

export const ErrorState: Story = { args: { status: "error" } };

export const Empty: Story = { args: { providers: [] } };

export const NoAvailability: Story = { args: { nextAvailableByProvider: new Map() } };

export const LongContent: Story = {
  args: {
    providers: [
      {
        ...providers[0]!,
        name: "Dr. Alexandria Featherington-Worthington the Third",
        role: "Family Medicine, Internal Medicine, and Preventive Care Specialist",
      },
    ],
  },
};

export const Narrow: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};
