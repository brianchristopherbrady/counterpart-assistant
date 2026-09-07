import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Button } from "@/design-system/react";
import type { BookingSubject } from "@/domain/models";

const guestDetailsSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name."),
  dateOfBirth: z
    .string()
    .min(1, "Enter your date of birth.")
    .refine((val) => !Number.isNaN(Date.parse(val)), "Enter a valid date."),
  contactValue: z.string().trim().min(1, "Enter an email address.").email("Enter a valid email address."),
});

type GuestDetailsFormValues = z.infer<typeof guestDetailsSchema>;

export interface GuestDetailsFormProps {
  defaultValues?: Partial<BookingSubject>;
  onSubmit: (subject: BookingSubject) => void;
  onBack: () => void;
}

/** Uses RHF's Controller (not register/ref spread) since Field is a controlled web-component wrapper, not a native input. */
export function GuestDetailsForm({ defaultValues, onSubmit, onBack }: GuestDetailsFormProps) {
  const { control, handleSubmit } = useForm<GuestDetailsFormValues>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      dateOfBirth: defaultValues?.dateOfBirth ?? "",
      contactValue: defaultValues?.contact?.value ?? "",
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      fullName: values.fullName,
      dateOfBirth: values.dateOfBirth,
      contact: { method: "email", value: values.contactValue },
    });
  });

  return (
    <form onSubmit={submit} noValidate className="flex max-w-md flex-col gap-4">
      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <Field
            label="Full name"
            required
            value={field.value}
            onValueChange={field.onChange}
            invalid={Boolean(fieldState.error)}
            errorMessage={fieldState.error?.message}
            autocomplete="name"
          />
        )}
      />
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field, fieldState }) => (
          <Field
            label="Date of birth"
            type="date"
            required
            value={field.value}
            onValueChange={field.onChange}
            invalid={Boolean(fieldState.error)}
            errorMessage={fieldState.error?.message}
            hint="Used to confirm your identity at check-in."
          />
        )}
      />
      <Controller
        control={control}
        name="contactValue"
        render={({ field, fieldState }) => (
          <Field
            label="Email address"
            type="email"
            required
            value={field.value}
            onValueChange={field.onChange}
            invalid={Boolean(fieldState.error)}
            errorMessage={fieldState.error?.message}
            autocomplete="email"
          />
        )}
      />
      <div className="flex gap-2">
        <Button type="button" intent="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue to review</Button>
      </div>
    </form>
  );
}
