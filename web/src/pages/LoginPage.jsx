import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { FormAlert } from "@/components/FormAlert";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { authApi } from "@/features/auth/authApi.js";
import { useAuth } from "@/features/auth/authContext.js";
import { loginSchema } from "@/features/auth/authSchemas.js";
import { applyServerErrors } from "@/lib/formErrors.js";

const FIELDS = ["email", "password"];

export function LoginPage() {
  const { notice, clearNotice, startSession } = useAuth();
  // Keep the session-expired / logged-out notice for this visit, but show it only once.
  const [visibleNotice] = useState(notice);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    clearNotice();
  }, [clearNotice]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: startSession,
    onError: (error) => setFormError(applyServerErrors(error, setError, FIELDS)),
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    login.mutate(values);
  });

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Welcome back to HamroProject</h1>
      </div>

      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <FormAlert tone="info">{formError ? null : visibleNotice}</FormAlert>
        <FormAlert>{formError}</FormAlert>

        <FormField
          variant="auth"
          label="Username or Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="grid gap-1">
          <FormField
            variant="auth"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          {/* Forgot password is not supported by the API — omit the feature */}
        </div>

        <SubmitButton pending={login.isPending} pendingLabel="Signing in…" className="mt-1 h-11 w-full rounded-full text-sm font-medium">
          Sign In
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to HamroProject?{" "}
        <Link to="/register" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}
