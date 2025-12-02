"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Routes } from "@/constants/router";
import { useSignupMutation } from "@/lib/store/api/auth/mutations";
import { applyFormErrors } from "@/lib/utils/formErrors";
import { SignUpInput, signUpSchema } from "@/lib/validations/auth";
import { isFieldErrors } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

export function SignUp({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [signup, { isLoading }] = useSignupMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      // Call API - success and error toasts will be shown via middleware
      const result = await signup(data).unwrap();

      if (result.success) {
        // Clear form
        reset();
        // Redirect to sign in
        router.push(Routes.SIGN_IN);
      }
    } catch (error) {
      // Handle server-side field validation errors
      if (error && typeof error === "object" && "data" in error) {
        const apiErrorData = error.data as {
          error?: string | Record<string, { type: string; message: string }>;
        };
        if (apiErrorData.error && isFieldErrors(apiErrorData.error)) {
          applyFormErrors(apiErrorData.error, setError);
        }
        // Toast middleware will show general error messages
      }
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <FieldError className="text-red-600">
                  {errors.name.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
              {errors.email && (
                <FieldError className="text-red-600">
                  {errors.email.message}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    id="confirm-password"
                    type="password"
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
              {errors.confirmPassword && (
                <FieldError className="text-red-600">
                  {errors.confirmPassword.message}
                </FieldError>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account?{" "}
                  <Link href={Routes.SIGN_IN}>Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
