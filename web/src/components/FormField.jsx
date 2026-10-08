import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

// Label + control + error/hint text. `children` receives the accessibility props for any control.
export function Field({ label, error, hint, id, variant, children }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const isAuth = variant === "auth";

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className={isAuth ? "auth-label" : undefined}>{label}</Label>
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

export function SelectField({ label, error, hint, name, id = name, options, variant, ...selectProps }) {
  return (
    <Field label={label} error={error} hint={hint} id={id} variant={variant}>
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

export function FormField({ label, error, hint, name, id = name, variant, ...inputProps }) {
  const isAuth = variant === "auth";
  return (
    <Field label={label} error={error} hint={hint} id={id} variant={variant}>
      {(controlProps) =>
        isAuth ? (
          <input name={name} className="auth-input" {...controlProps} {...inputProps} />
        ) : (
          <Input name={name} className="h-10" {...controlProps} {...inputProps} />
        )
      }
    </Field>
  );
}
