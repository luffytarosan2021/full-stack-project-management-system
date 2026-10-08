import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { ChoiceField } from "@/components/ChoiceField";
import { DateField } from "@/components/DateField";
import { FormAlert } from "@/components/FormAlert";
import { TextField } from "@/components/TextField";
import { applyServerErrors } from "@/lib/formErrors.js";
import { colors, radius, spacing } from "@/theme";
import { TASK_PRIORITIES, TASK_STATUSES } from "./taskOptions.js";
import { TASK_FIELDS, taskFormSchema, toFormValues } from "./taskSchema.js";

// Task Form (docs/DESIGN.md section 6): name, description, priority, status, due date, and the fixed
// project (shown when `projectName` is given; the edit screen shows it in its own header instead).
// `onSave(values)` returns a promise; server validation errors are mapped back onto the fields.
// When editing, Save stays disabled until something changed.
export function TaskForm({ task, projectName, onSave, saving, footer }) {
  const [formError, setFormError] = useState(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(taskFormSchema), defaultValues: toFormValues(task) });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSave(values);
    } catch (error) {
      setFormError(applyServerErrors(error, setError, TASK_FIELDS));
    }
  });

  return (
    <View style={styles.form}>
      <FormAlert>{formError}</FormAlert>

      {projectName ? (
        <View style={styles.project} accessible accessibilityLabel={`Project: ${projectName}`}>
          <AppText variant="captionMedium" muted>
            Project
          </AppText>
          <AppText variant="bodyMedium" numberOfLines={2}>
            {projectName}
          </AppText>
        </View>
      ) : null}

      <Controller
        control={control}
        name="name"
        render={({ field: { ref, value, onChange, onBlur } }) => (
          <TextField
            ref={ref}
            label="Name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            maxLength={150}
            returnKeyType="next"
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { ref, value, onChange, onBlur } }) => (
          <TextField
            ref={ref}
            label="Description (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            maxLength={2000}
            multiline
            error={errors.description?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="priority"
        render={({ field: { value, onChange } }) => (
          <ChoiceField label="Priority" options={TASK_PRIORITIES} value={value} onChange={onChange} error={errors.priority?.message} />
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange } }) => (
          <ChoiceField label="Status" options={TASK_STATUSES} value={value} onChange={onChange} error={errors.status?.message} />
        )}
      />
      <Controller
        control={control}
        name="dueDate"
        render={({ field: { value, onChange } }) => (
          <DateField label="Due date" value={value} onChange={onChange} error={errors.dueDate?.message} />
        )}
      />

      <Button onPress={submit} pending={saving} pendingLabel="Saving…" disabled={Boolean(task) && !isDirty}>
        {task ? "Save changes" : "Create task"}
      </Button>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  project: {
    gap: 2,
    padding: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.track,
  },
});
