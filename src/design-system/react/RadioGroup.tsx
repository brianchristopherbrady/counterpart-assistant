import { createComponent } from "./createComponent";
import type { DsRadioGroupElement } from "@/design-system/elements/radio-group";
import type { DsRadioElement } from "@/design-system/elements/radio";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  value?: string;
  options: RadioOption[];
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  required?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface WrappedRadioGroupProps {
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onGroupChange?: (e: Event) => void;
}

interface WrappedRadioProps {
  value?: string;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
}

const WrappedRadioGroup = createComponent<DsRadioGroupElement, WrappedRadioGroupProps>({
  tagName: "ds-radio-group",
  events: { onGroupChange: "change" },
});

const WrappedRadio = createComponent<DsRadioElement, WrappedRadioProps>({ tagName: "ds-radio" });

/** SlotPicker-style consumers pass a plain options array; this owns rendering the individual ds-radio children. */
export function RadioGroup({
  name,
  label,
  value,
  options,
  orientation,
  disabled,
  required,
  onValueChange,
  className,
}: RadioGroupProps) {
  return (
    <WrappedRadioGroup
      className={className}
      value={value}
      orientation={orientation}
      disabled={disabled}
      required={required}
      onGroupChange={(e: Event) => onValueChange?.((e.target as DsRadioGroupElement).value)}
    >
      {label ? <span slot="label">{label}</span> : null}
      {options.map((option) => (
        <WrappedRadio
          key={option.value}
          name={name}
          value={option.value}
          checked={option.value === value}
          disabled={option.disabled ?? disabled}
        >
          {option.label}
        </WrappedRadio>
      ))}
    </WrappedRadioGroup>
  );
}
