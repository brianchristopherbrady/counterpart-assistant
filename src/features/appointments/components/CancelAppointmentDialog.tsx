import { useState } from "react";
import { Button, Dialog, StatusMessage } from "@/design-system/react";
import { useCancelAppointment } from "../hooks/useCancelAppointment";
import { generateId } from "@/lib/id";
import { formatInstant } from "@/lib/datetime";
import type { Appointment, ActorContext } from "@/domain/models";

export interface CancelAppointmentDialogProps {
  appointment: Appointment;
  providerName: string;
  displayZone: string;
  actor: ActorContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A failed cancel leaves the appointment booked and offers a retry with the same idempotency key. */
export function CancelAppointmentDialog({
  appointment,
  providerName,
  displayZone,
  actor,
  open,
  onOpenChange,
}: CancelAppointmentDialogProps) {
  const [idempotencyKey] = useState(() => generateId("idem"));
  const cancelMutation = useCancelAppointment();

  function handleConfirm() {
    cancelMutation.mutate(
      { input: { appointmentId: appointment.id, appointmentVersion: appointment.version }, actor, key: idempotencyKey },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onDismiss={() => onOpenChange(false)} aria-label="Cancel appointment">
      <div className="flex max-w-sm flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">Cancel this appointment?</h2>
        <p className="text-text-primary">
          {providerName} · {formatInstant(appointment.startInstant, displayZone)}
        </p>
        <p className="text-sm text-text-muted">This releases the time slot so another patient can book it.</p>
        {cancelMutation.isError ? (
          <StatusMessage intent="error">Something went wrong canceling this appointment. Please try again.</StatusMessage>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button intent="secondary" onClick={() => onOpenChange(false)}>
            Keep appointment
          </Button>
          <Button intent="destructive" pending={cancelMutation.isPending} onClick={handleConfirm}>
            Cancel appointment
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
