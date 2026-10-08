import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { FormAlert } from "@/components/FormAlert";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold">Log in</h1>
        <CardDescription>Enter your email and password to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormAlert tone="info">{formError ? null : visibleNotice}</FormAlert>
          <FormAlert>{formError}</FormAlert>
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <SubmitButton pending={login.isPending} pendingLabel="Logging in…">
            Log in
          </SubmitButton>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:text-primary-hover hover:underline">
            Create one
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
