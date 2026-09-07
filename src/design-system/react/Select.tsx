import { createComponent } from "./createComponent";
import type { DsSelectElement } from "@/design-system/elements/select";
import type { DsOptionElement } from "@/design-system/elements/option";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  "aria-label"?: string;
  className?: string;
}

interface WrappedSelectProps {
  value?: string;
  disabled?: boolean;
  onSelectChange?: (e: Event) => void;
  "aria-label"?: string;
}

interface WrappedOptionProps {
  value?: string;
  disabled?: boolean;
}

const WrappedSelect = createComponent<DsSelectElement, WrappedSelectProps>({
  tagName: "ds-select",
  events: { onSelectChange: "change" },
});

const WrappedOption = createComponent<DsOptionElement, WrappedOptionProps>({ tagName: "ds-option" });

export function Select({ value, options, disabled, onValueChange, className, ...rest }: SelectProps) {
  return (
    <WrappedSelect
      className={className}
      value={value}
      disabled={disabled}
      onSelectChange={(e: Event) => onValueChange?.((e.target as DsSelectElement).value)}
      {...rest}
    >
      {options.map((option) => (
        <WrappedOption key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </WrappedOption>
      ))}
    </WrappedSelect>
  );
}
