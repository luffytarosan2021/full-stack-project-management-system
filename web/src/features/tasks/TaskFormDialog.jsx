import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/FormAlert";
import { Field, FormField, SelectField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { useToast } from "@/components/toastContext.js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { applyServerErrors } from "@/lib/formErrors.js";
import { TASK_PRIORITIES, TASK_STATUSES } from "./taskOptions.js";
import { useSaveTask } from "./taskQueries.js";
import { TASK_FIELDS, taskFormSchema, toCreateBody, toFormValues, toUpdateBody } from "./taskSchema.js";

// Create when `task` is absent (inside `projectId`), edit otherwise. The form unmounts on close.
export function TaskFormDialog({ open, onOpenChange, projectId, task, onSaved }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>{task ? "Update the task details." : "Add a task to this project."}</DialogDescription>
        </DialogHeader>
        <TaskForm projectId={projectId} task={task} onSaved={onSaved} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({ projectId, task, onSaved, onCancel }) {
  const showToast = useToast();
  const [formError, setFormError] = useState(null);
  const saveTask = useSaveTask(task);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(taskFormSchema), defaultValues: toFormValues(task) });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const body = task ? toUpdateBody(task, values) : toCreateBody(projectId, values);
    if (task && Object.keys(body).length === 0) {
      onSaved(task);
      return;
    }

    saveTask.mutate(body, {
      onSuccess: (saved) => {
        showToast("Task saved.");
        onSaved(saved);
      },
      onError: (error) => setFormError(applyServerErrors(error, setError, TASK_FIELDS)),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormAlert>{formError}</FormAlert>
      <FormField label="Name" maxLength={150} error={errors.name?.message} {...register("name")} />
      <Field label="Description (optional)" id="description" error={errors.description?.message}>
        {(controlProps) => (
          <Textarea rows={3} maxLength={2000} className="max-h-60 min-h-20" {...controlProps} {...register("description")} />
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Priority" options={TASK_PRIORITIES} error={errors.priority?.message} {...register("priority")} />
        <SelectField label="Status" options={TASK_STATUSES} error={errors.status?.message} {...register("status")} />
      </div>
      <FormField label="Due date" type="date" error={errors.dueDate?.message} {...register("dueDate")} />
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton pending={saveTask.isPending} pendingLabel="Saving…" className="sm:min-w-28">
          {task ? "Save changes" : "Create task"}
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}
