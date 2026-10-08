import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

// Label + control + error/hint text. `children` receives the accessibility props for any control.
export function Field({ label, error, hint, id, children }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField({ label, error, hint, name, id = name, options, ...selectProps }) {
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      {(controlProps) => (
        <NativeSelect name={name} className="w-full" {...controlProps} {...selectProps}>
          {options.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      )}
    </Field>
  );
}

export function FormField({ label, error, hint, name, id = name, ...inputProps }) {
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      {(controlProps) => <Input name={name} className="h-10" {...controlProps} {...inputProps} />}
    </Field>
  );
}
