import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { FormAlert } from "@/components/FormAlert";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
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
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start planning projects and finishing tasks today.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <FormAlert>{formError}</FormAlert>
        <FormField
          variant="auth"
          label="Full Name"
          autoComplete="name"
          maxLength={100}
          placeholder="Jane Smith"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <FormField
          variant="auth"
          label="Email address"
          type="email"
          autoComplete="email"
          maxLength={255}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          variant="auth"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register("password")}
        />

        <SubmitButton pending={createAccount.isPending} pendingLabel="Creating account…" className="mt-1 h-11 w-full rounded-full text-sm font-medium">
          Create Account
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
