import { createComponent } from "./createComponent";
import type { DsFieldElement } from "@/design-system/elements/field";

export interface FieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  hint?: string;
  errorMessage?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "tel" | "date";
  autocomplete?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface WrappedFieldProps extends Omit<FieldProps, "label" | "onValueChange"> {
  onFieldInput?: (e: Event) => void;
}

const WrappedField = createComponent<DsFieldElement, WrappedFieldProps>({
  tagName: "ds-field",
  events: { onFieldInput: "input" },
});

/** Wires the input event to a plain string callback instead of exposing the raw Event. */
export function Field({ label, onValueChange, ...rest }: FieldProps) {
  return (
    <WrappedField
      {...rest}
      onFieldInput={(e: Event) => onValueChange?.((e.target as HTMLInputElement).value)}
    >
      {label}
    </WrappedField>
  );
}

