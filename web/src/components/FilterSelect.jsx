import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

// Dropdown filter with an "All" option (empty value = no filter). Applies immediately.
export function FilterSelect({ label, value, options, onChange, allLabel = "All", className = "w-full sm:w-48" }) {
  return (
    <NativeSelect aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={className}>
      <NativeSelectOption value="">{allLabel}</NativeSelectOption>
      {options.map((option) => (
        <NativeSelectOption key={option.value} value={option.value}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
