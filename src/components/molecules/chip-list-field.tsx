import { Chip } from "./chip";
import { FormField } from "./form-field";

export interface ChipListFieldProps {
  label: string;
  htmlFor: string;
  options: string[];
  selectedOptions: string[];
}

export function ChipListField({
  label,
  htmlFor,
  options,
  selectedOptions,
}: ChipListFieldProps) {
  return (
    <FormField label={label} htmlFor={htmlFor}>
      <div id={htmlFor} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip key={option} selected={selectedOptions.includes(option)}>
            {option}
          </Chip>
        ))}
      </div>
    </FormField>
  );
}
