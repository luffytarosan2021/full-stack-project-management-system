import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/FormAlert";
import { Field, FormField } from "@/components/FormField";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { applyServerErrors } from "@/lib/formErrors.js";
import { useSaveProject } from "./projectQueries.js";
import { PROJECT_FIELDS, projectFormSchema, toCreateBody, toFormValues, toUpdateBody } from "./projectSchema.js";
import { PROJECT_STATUSES } from "./projectStatus.js";

// Create when `project` is absent, edit otherwise. The form unmounts on close, so it always reopens fresh.
export function ProjectFormDialog({ open, onOpenChange, project, onSaved }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            {project ? "Update the project details." : "Add a project, then track its progress with tasks."}
          </DialogDescription>
        </DialogHeader>
        <ProjectForm project={project} onSaved={onSaved} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ProjectForm({ project, onSaved, onCancel }) {
  const showToast = useToast();
  const [formError, setFormError] = useState(null);
  const saveProject = useSaveProject(project);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(projectFormSchema), defaultValues: toFormValues(project) });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const body = project ? toUpdateBody(project, values) : toCreateBody(values);
    if (project && Object.keys(body).length === 0) {
      onSaved(project);
      return;
    }

    saveProject.mutate(body, {
      onSuccess: (saved) => {
        showToast("Project saved.");
        onSaved(saved);
      },
      onError: (error) => setFormError(applyServerErrors(error, setError, PROJECT_FIELDS)),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormAlert>{formError}</FormAlert>
      <FormField label="Name" maxLength={150} error={errors.name?.message} {...register("name")} />
      <Field label="Description (optional)" id="description" error={errors.description?.message}>
        {(controlProps) => (
          <Textarea rows={4} maxLength={2000} className="max-h-60 min-h-24" {...controlProps} {...register("description")} />
        )}
      </Field>
      <Field label="Status" id="status" error={errors.status?.message}>
        {(controlProps) => (
          <NativeSelect className="w-full" {...controlProps} {...register("status")}>
            {PROJECT_STATUSES.map((status) => (
              <NativeSelectOption key={status.value} value={status.value}>
                {status.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start date" type="date" error={errors.startDate?.message} {...register("startDate")} />
        <FormField label="End date" type="date" error={errors.endDate?.message} {...register("endDate")} />
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton pending={saveProject.isPending} pendingLabel="Saving…" className="sm:min-w-28">
          {project ? "Save changes" : "Create project"}
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}
