import type { Meta, StoryObj } from "@storybook/react";
import { BookingReview } from "./BookingReview";
import { providers, locations, appointmentTypes } from "@/data/fixtures";
import type { Appointment, BookingSubject, Slot } from "@/domain/models";

const subject: BookingSubject = {
  fullName: "Taylor Reyes",
  dateOfBirth: "1995-05-20",
  contact: { method: "email", value: "taylor.reyes@example.com" },
};

const slot: Slot = {
  id: "slot-1",
  providerId: providers[0]!.id,
  locationId: locations[0]!.id,
  mode: "in-person",
  appointmentTypeId: "type-new-patient",
  startInstant: "2026-09-08T14:00:00.000Z",
  endInstant: "2026-09-08T14:30:00.000Z",
  version: 1,
};

const originalAppointment: Appointment = {
  id: "appt-1",
  reference: "CB-ABC123",
  subjectName: subject.fullName,
  subjectDateOfBirth: subject.dateOfBirth,
  subjectContact: subject.contact,
  bookedByActor: { kind: "guest", sessionId: "session-1" },
  providerId: providers[1]!.id,
  appointmentTypeId: "type-new-patient",
  mode: "virtual",
  locationId: locations[0]!.id,
  startInstant: "2026-09-08T09:00:00.000Z",
  endInstant: "2026-09-08T09:30:00.000Z",
  status: "confirmed",
  version: 1,
  createdAt: "2026-09-01T00:00:00.000Z",
};

const meta: Meta<typeof BookingReview> = {
  title: "Booking/BookingReview",
  component: BookingReview,
  args: {
    subject,
    provider: providers[0]!,
    slot,
    appointmentType: appointmentTypes[0]!,
    location: locations[0]!,
    displayZone: locations[0]!.timeZone,
    onEditProvider: () => {},
    onEditDetails: () => {},
    onConfirm: () => {},
    pending: false,
  },
};
export default meta;

type Story = StoryObj<typeof BookingReview>;

export const Default: Story = {};

export const Pending: Story = { args: { pending: true } };

export const ErrorState: Story = { args: { errorMessage: "Something went wrong confirming this booking. Please try again." } };

export const Rescheduling: Story = { args: { reschedulingFrom: originalAppointment, onEditDetails: undefined } };

export const LongContent: Story = {
  args: {
    subject: { ...subject, fullName: "Alexandria Featherington-Worthington the Third" },
  },
};

export const Narrow: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};
