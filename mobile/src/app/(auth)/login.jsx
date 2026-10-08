import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { FormAlert } from "@/components/FormAlert";
import { TextField } from "@/components/TextField";
import { authApi } from "@/features/auth/authApi.js";
import { useAuth } from "@/features/auth/authContext.js";
import { AuthLink } from "@/features/auth/AuthLink";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { loginSchema } from "@/features/auth/authSchemas.js";
import { applyServerErrors } from "@/lib/formErrors.js";

const FIELDS = ["email", "password"];

export default function LoginScreen() {
  const { notice, clearNotice, startSession } = useAuth();
  // Keep the session-expired / logged-out notice for this visit, but show it only once.
  const [visibleNotice] = useState(notice);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    clearNotice();
  }, [clearNotice]);

  const {
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  // On success the protected routes switch over and the app opens the Dashboard.
  const login = useMutation({
    mutationFn: async (values) => startSession(await authApi.login(values)),
    onError: (error) => setFormError(applyServerErrors(error, setError, FIELDS)),
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    login.mutate(values);
  });

  return (
    <AuthScreen
      title="Log in"
      description="Enter your email and password to continue."
      footer={<AuthLink prompt="Don't have an account?" label="Create one" href="/register" />}
    >
      <FormAlert tone="info">{formError ? null : visibleNotice}</FormAlert>
      <FormAlert>{formError}</FormAlert>
      <Controller
        control={control}
        name="email"
        render={({ field: { ref, value, onChange, onBlur } }) => (
          <TextField
            ref={ref}
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => setFocus("password")}
            submitBehavior="submit"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { ref, value, onChange, onBlur } }) => (
          <TextField
            ref={ref}
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            error={errors.password?.message}
          />
        )}
      />
      <Button onPress={onSubmit} pending={login.isPending} pendingLabel="Logging in…">
        Log in
      </Button>
    </AuthScreen>
  );
}
