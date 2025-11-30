# Form Management and API Route Handler Patterns

This document outlines the standardized patterns for form management and API route handlers in this application.

---

## Table of Contents

1. [Form Management](#form-management)
2. [API Route Handlers](#api-route-handlers)
3. [Error Handling](#error-handling)
4. [Complete Example](#complete-example)
5. [Best Practices](#best-practices)

---

## Form Management

### Overview

We use **React Hook Form** with **Zod** for schema validation and the **Controller** component pattern for consistent form handling.

### Form Implementation Pattern

#### 1. Define Zod Schema

Create validation schemas in `src/lib/validations/`:

```typescript
// src/lib/validations/auth.ts
import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
```

#### 2. Setup React Hook Form

Use `useForm` with `zodResolver`:

```typescript
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpInput, signUpSchema } from "@/lib/validations/auth";

const {
  control,
  handleSubmit,
  formState: { errors },
  setError,
  reset,
} = useForm<SignUpInput>({
  resolver: zodResolver(signUpSchema),
  mode: "onBlur", // Validate when field loses focus
});
```

#### 3. Use Controller Component

Wrap each input with `<Controller />`:

```tsx
<Controller
  name="email"
  control={control}
  render={({ field }) => (
    <Input
      id="email"
      type="email"
      placeholder="me@example.com"
      disabled={isLoading}
      {...field}
    />
  )}
/>
{errors.email && (
  <FieldDescription className="text-red-600">
    {errors.email.message}
  </FieldDescription>
)}
```

#### 4. Handle Form Submission

```typescript
const onSubmit = async (data: SignUpInput) => {
  try {
    const result = await mutation(data).unwrap();

    if (result.success) {
      reset(); // Clear form
      router.push("/success-page");
    }
  } catch (error) {
    // Handle server-side field validation errors
    if (error && typeof error === "object" && "data" in error) {
      const apiErrorData = error.data as {
        error?: string | FormFieldErrors;
      };
      if (apiErrorData.error && isFieldErrors(apiErrorData.error)) {
        applyFormErrors(apiErrorData.error, setError);
      }
    }
  }
};
```

#### 5. Apply Server Errors to Form

Use the `applyFormErrors` utility:

```typescript
import { applyFormErrors } from "@/lib/utils/formErrors";
import { isFieldErrors } from "@/types/api";

// In catch block
if (apiErrorData.error && isFieldErrors(apiErrorData.error)) {
  applyFormErrors(apiErrorData.error, setError);
}
```

---

## API Route Handlers

### Overview

All API routes follow a consistent response structure using the `ApiResponse<T>` type.

### Response Structure

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | FormFieldErrors;
}
```

### Response Types

#### Success Response
```typescript
{
  success: true,
  data: { id: "123", email: "user@example.com" },
  message: "Account created successfully"
}
```

#### Field Errors (React Hook Form Format)
```typescript
{
  success: false,
  error: {
    email: { type: "validation", message: "Email already exists" },
    password: { type: "validation", message: "Too weak" }
  },
  message: "Validation failed"
}
```

#### General Error (Handled by Toast Middleware)
```typescript
{
  success: false,
  error: "An error occurred during signup",
  message: "Internal server error"
}
```

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiResponse } from "@/types/api";
import { yourSchema } from "@/lib/validations/your-module";
import { serviceFunction } from "@/services/your-service";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate with Zod
    const validatedData = yourSchema.parse(body);

    // 3. Business logic (use service layer for Prisma)
    const existingRecord = await serviceFunction(validatedData.email);

    if (existingRecord) {
      const response: ApiResponse = {
        success: false,
        error: "Resource already exists",
        message: "Duplicate entry",
      };
      return NextResponse.json(response, { status: 409 });
    }

    // 4. Create/Update resource
    const result = await createServiceFunction(validatedData);

    // 5. Return success response
    const response: ApiResponse = {
      success: true,
      data: result,
      message: "Operation successful",
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    // Handle Zod validation errors - return in React Hook Form format
    if (error instanceof ZodError) {
      const response: ApiResponse = {
        success: false,
        error: error.issues.reduce(
          (acc: Record<string, { type: string; message: string }>, err) => {
            const fieldName = err.path.join(".");
            acc[fieldName] = {
              type: "validation",
              message: err.message,
            };
            return acc;
          },
          {}
        ),
        message: "Validation failed",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Handle other errors
    console.error("Error:", error);
    const response: ApiResponse = {
      success: false,
      error: "An error occurred",
      message: "Internal server error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
```

---

## Error Handling

### Client-Side Error Handling

#### 1. Field-Specific Errors
Displayed inline under each form field using React Hook Form's error state.

```tsx
{errors.email && (
  <FieldDescription className="text-red-600">
    {errors.email.message}
  </FieldDescription>
)}
```

#### 2. General Errors
Automatically displayed as toast notifications via Redux middleware.

#### 3. Success Messages
Automatically displayed as toast notifications via Redux middleware when API returns a `message` field.

### Server-Side Error Handling

#### Validation Errors (400)
```typescript
{
  success: false,
  error: {
    email: { type: "validation", message: "Invalid email" }
  },
  message: "Validation failed"
}
```

#### Business Logic Errors (409, etc.)
```typescript
{
  success: false,
  error: "User with this email already exists",
  message: "Email already in use"
}
```

#### Server Errors (500)
```typescript
{
  success: false,
  error: "An error occurred during signup",
  message: "Internal server error"
}
```

---

## Complete Example

### 1. Validation Schema

```typescript
// src/lib/validations/profile.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

### 2. Service Layer

```typescript
// src/services/profile.ts
import { prisma } from "@/lib/db";

export async function updateUserProfile(userId: string, data: {
  name: string;
  bio?: string;
  website?: string;
}) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      bio: true,
      website: true,
    },
  });
}
```

### 3. API Route

```typescript
// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiResponse } from "@/types/api";
import { updateProfileSchema } from "@/lib/validations/profile";
import { updateUserProfile } from "@/services/profile";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const profile = await updateUserProfile(session.user.id, validatedData);

    const response: ApiResponse = {
      success: true,
      data: profile,
      message: "Profile updated successfully",
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof ZodError) {
      const response: ApiResponse = {
        success: false,
        error: error.issues.reduce(
          (acc: Record<string, { type: string; message: string }>, err) => {
            acc[err.path.join(".")] = {
              type: "validation",
              message: err.message,
            };
            return acc;
          },
          {}
        ),
        message: "Validation failed",
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.error("Profile update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
```

### 4. RTK Query Mutation

```typescript
// src/lib/store/api/profile/mutations.ts
import { UpdateProfileInput } from "@/lib/validations/profile";
import { ApiResponse } from "@/types/api";
import { baseApi } from "../index";

interface Profile {
  id: string;
  name: string;
  bio?: string;
  website?: string;
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<ApiResponse<Profile>, UpdateProfileInput>({
      query: (data) => ({
        url: "/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useUpdateProfileMutation } = profileApi;
```

### 5. Form Component

```tsx
// src/components/profile/profile-form.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileInput, updateProfileSchema } from "@/lib/validations/profile";
import { useUpdateProfileMutation } from "@/lib/store/api/profile/mutations";
import { applyFormErrors } from "@/lib/utils/formErrors";
import { isFieldErrors } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm() {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      const result = await updateProfile(data).unwrap();

      if (result.success) {
        // Success toast shown by middleware
      }
    } catch (error) {
      if (error && typeof error === "object" && "data" in error) {
        const apiErrorData = error.data as {
          error?: string | FormFieldErrors;
        };
        if (apiErrorData.error && isFieldErrors(apiErrorData.error)) {
          applyFormErrors(apiErrorData.error, setError);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input
            placeholder="Your name"
            disabled={isLoading}
            {...field}
          />
        )}
      />
      {errors.name && <p className="text-red-600">{errors.name.message}</p>}

      <Controller
        name="bio"
        control={control}
        render={({ field }) => (
          <Input
            placeholder="Bio"
            disabled={isLoading}
            {...field}
          />
        )}
      />
      {errors.bio && <p className="text-red-600">{errors.bio.message}</p>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
```

---

## Best Practices

### Forms

1. **Always use Zod schemas** for validation - define them in `src/lib/validations/`
2. **Use Controller component** for consistent input handling
3. **Set validation mode to `onBlur`** for better UX
4. **Use the `applyFormErrors` utility** for server-side errors
5. **Always disable inputs during loading** to prevent duplicate submissions
6. **Reset forms after successful submission** using `reset()`
7. **Export TypeScript types** from Zod schemas using `z.infer<>`

### API Routes

1. **Always validate input** with Zod schemas
2. **Use the service layer** for Prisma database calls - never call Prisma directly in routes
3. **Return consistent `ApiResponse<T>` structure** in all responses
4. **Use appropriate HTTP status codes**:
   - `200` - Success (GET, PATCH, DELETE)
   - `201` - Created (POST)
   - `400` - Validation error
   - `401` - Unauthorized
   - `403` - Forbidden
   - `404` - Not found
   - `409` - Conflict (duplicate entry)
   - `500` - Server error
5. **Return field errors in React Hook Form format** for validation failures
6. **Include meaningful messages** - they'll be shown in toasts
7. **Log errors** with `console.error()` for debugging

### RTK Query

1. **Create separate files** for mutations and queries under `src/lib/store/api/[module]/`
2. **Use `injectEndpoints`** to extend the base API
3. **Type responses with `ApiResponse<T>`**
4. **Invalidate appropriate tags** for cache management
5. **Export generated hooks** for use in components

### Error Handling

1. **Field-specific errors** - Display inline under form fields
2. **General errors** - Let middleware show toasts automatically
3. **Success messages** - Include `message` field in API response for automatic toasts
4. **Use type guards** (`isFieldErrors`, `isGeneralError`) to distinguish error types

### Service Layer

1. **Create service files** in `src/services/` for each domain
2. **Export functions** that encapsulate Prisma operations
3. **Keep routes thin** - move business logic to services
4. **Use appropriate Prisma select** to return only needed fields
5. **Handle errors at the route level** - services should throw errors

---

## Architecture Flow

```
┌─────────────────┐
│  Form Component │ ← React Hook Form + Controller
└────────┬────────┘
         │ onSubmit
         ↓
┌─────────────────┐
│  RTK Query      │ ← Mutation/Query
│  Mutation       │
└────────┬────────┘
         │ HTTP Request
         ↓
┌─────────────────┐
│  API Route      │ ← Validate with Zod
│  Handler        │
└────────┬────────┘
         │ Service Call
         ↓
┌─────────────────┐
│  Service Layer  │ ← Prisma Operations
└────────┬────────┘
         │ Response
         ↓
┌─────────────────┐
│  ApiResponse<T> │ ← Consistent Format
└────────┬────────┘
         │
         ├─→ Success + Message → Toast Middleware → Success Toast
         │
         └─→ Field Errors → applyFormErrors() → Inline Errors
             General Error → Toast Middleware → Error Toast
```

---

## Quick Reference

### File Structure
```
src/
├── app/
│   └── api/
│       └── [module]/
│           └── route.ts           # API route handlers
├── components/
│   └── [module]/
│       └── form.tsx               # Form components
├── lib/
│   ├── store/
│   │   └── api/
│   │       └── [module]/
│   │           ├── mutations.ts   # RTK Query mutations
│   │           └── queries.ts     # RTK Query queries
│   ├── utils/
│   │   └── formErrors.ts          # Form error utilities
│   └── validations/
│       └── [module].ts            # Zod schemas
├── services/
│   └── [module].ts                # Prisma service layer
└── types/
    └── api.ts                     # API types
```

### Key Imports

```typescript
// Forms
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyFormErrors } from "@/lib/utils/formErrors";
import { isFieldErrors } from "@/types/api";

// API
import { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

// RTK Query
import { baseApi } from "../index";
```

---

This pattern ensures consistency, type safety, and excellent developer experience across the entire application.

