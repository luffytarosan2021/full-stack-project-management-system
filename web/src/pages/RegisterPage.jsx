import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { FormAlert } from "@/components/FormAlert";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { authApi } from "@/features/auth/authApi.js";
import { useAuth } from "@/features/auth/authContext.js";
import { registerSchema } from "@/features/auth/authSchemas.js";
import { applyServerErrors } from "@/lib/formErrors.js";

const FIELDS = ["fullName", "email", "password"];

export function RegisterPage() {
  const { startSession } = useAuth();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const createAccount = useMutation({
    mutationFn: authApi.register,
    onSuccess: startSession,
    onError: (error) => setFormError(applyServerErrors(error, setError, FIELDS)),
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    createAccount.mutate(values);
  });

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <CardDescription>Create an account to manage your projects and tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormAlert>{formError}</FormAlert>
          <FormField
            label="Full name"
            autoComplete="name"
            maxLength={100}
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            maxLength={255}
            error={errors.email?.message}
            {...register("email")}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters."
            error={errors.password?.message}
            {...register("password")}
          />
          <SubmitButton pending={createAccount.isPending} pendingLabel="Creating account…">
            Create account
          </SubmitButton>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover hover:underline">
            Log in
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
