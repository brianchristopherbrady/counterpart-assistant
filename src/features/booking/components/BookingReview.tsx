import { Button, StatusMessage } from "@/design-system/react";
import { formatInstant, formatZoneAbbreviation } from "@/lib/datetime";
import type { Appointment, AppointmentType, BookingSubject, Location, Provider, Slot } from "@/domain/models";

export interface BookingReviewProps {
  subject: BookingSubject;
  provider: Provider;
  slot: Slot;
  appointmentType: AppointmentType;
  location: Location;
  displayZone: string;
  onEditProvider: () => void;
  onEditDetails: () => void;
  onConfirm: () => void;
  pending: boolean;
  errorMessage?: string;
  reschedulingFrom?: Appointment;
}

/** GOV.UK-style check-answers pattern: summary rows each carry their own specific edit action. */
export function BookingReview({
  subject,
  provider,
  slot,
  appointmentType,
  location,
  displayZone,
  onEditProvider,
  onEditDetails,
  onConfirm,
  pending,
  errorMessage,
  reschedulingFrom,
}: BookingReviewProps) {
  const zoneLabel = formatZoneAbbreviation(slot.startInstant, displayZone);

  return (
    <div className="flex max-w-lg flex-col gap-4">
      {reschedulingFrom ? (
        <StatusMessage intent="info">
          Rescheduling from {formatInstant(reschedulingFrom.startInstant, displayZone)}. The original stays booked
          until this new time is confirmed.
        </StatusMessage>
      ) : null}

      <dl className="divide-y divide-border rounded-md border border-border bg-surface-raised">
        <ReviewRow label="Patient" value={`${subject.fullName} (${subject.dateOfBirth})`} onEdit={onEditDetails} />
        <ReviewRow label="Contact" value={subject.contact.value} onEdit={onEditDetails} />
        <ReviewRow
          label="Provider"
          value={`${provider.name} — ${provider.role}`}
          onEdit={onEditProvider}
        />
        <ReviewRow label="Visit type" value={`${appointmentType.label} (${appointmentType.durationMinutes} min)`} />
        <ReviewRow label="Mode / location" value={`${slot.mode === "in-person" ? "In-person" : "Virtual"} · ${location.name}`} onEdit={onEditProvider} />
        <ReviewRow
          label="Date and time"
          value={`${formatInstant(slot.startInstant, displayZone)} (${zoneLabel})`}
          onEdit={onEditProvider}
        />
      </dl>

      {errorMessage ? <StatusMessage intent="error">{errorMessage}</StatusMessage> : null}

      <div>
        <Button pending={pending} onClick={onConfirm}>
          {reschedulingFrom ? "Confirm reschedule" : "Confirm booking"}
        </Button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <div>
        <dt className="text-sm text-text-muted">{label}</dt>
        <dd className="text-text-primary">{value}</dd>
      </div>
      {onEdit ? (
        <Button intent="secondary" size="sm" onClick={onEdit}>
          Change
        </Button>
      ) : null}
    </div>
  );
}
