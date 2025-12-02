import { ADMIN_EMAIL } from "@/constants/env";
import { signUpSchema } from "@/lib/validations/auth";
import { createUser, findUserByEmail } from "@/services/auth";
import { ApiResponse } from "@/types/api";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const validatedData = signUpSchema.parse(body);

    // Block admin email registration
    if (validatedData.email === ADMIN_EMAIL) {
      const response: ApiResponse = {
        success: false,
        error: "Admin accounts cannot be registered",
        message: "This email is reserved for administrative purposes",
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Check if user already exists using service
    const existingUser = await findUserByEmail(validatedData.email);

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: "User with this email already exists",
        message: "Email already in use",
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user using service
    const user = await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: "Account created successfully",
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
    console.error("Signup error:", error);
    const response: ApiResponse = {
      success: false,
      error: "An error occurred during signup",
      message: "Internal server error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
