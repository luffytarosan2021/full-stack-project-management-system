import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { FormAlert } from "@/components/FormAlert";
import { TextField } from "@/components/TextField";
import { authApi } from "@/features/auth/authApi.js";
import { useAuth } from "@/features/auth/authContext.js";
import { AuthLink } from "@/features/auth/AuthLink";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { registerSchema } from "@/features/auth/authSchemas.js";
import { applyServerErrors } from "@/lib/formErrors.js";

const FIELDS = ["fullName", "email", "password"];

export default function RegisterScreen() {
  const { startSession } = useAuth();
  const [formError, setFormError] = useState(null);

  const {
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { fullName: "", email: "", password: "" } });

  // Registration returns a token too, so the user is logged in straight away.
  const register = useMutation({
    mutationFn: async (values) => startSession(await authApi.register(values)),
    onError: (error) => setFormError(applyServerErrors(error, setError, FIELDS)),
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    register.mutate(values);
  });

  return (
    <AuthScreen
      title="Create an account"
      description="Create an account to manage your projects and tasks."
      footer={<AuthLink prompt="Already have an account?" label="Log in" href="/login" />}
    >
      <FormAlert>{formError}</FormAlert>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { ref, value, onChange, onBlur } }) => (
          <TextField
            ref={ref}
            label="Full name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            maxLength={100}
            returnKeyType="next"
            onSubmitEditing={() => setFocus("email")}
            submitBehavior="submit"
            error={errors.fullName?.message}
          />
        )}
      />
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
            maxLength={255}
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
            autoComplete="new-password"
            textContentType="newPassword"
            hint="At least 8 characters."
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            error={errors.password?.message}
          />
        )}
      />
      <Button onPress={onSubmit} pending={register.isPending} pendingLabel="Creating account…">
        Create account
      </Button>
    </AuthScreen>
  );
}
