import { SignUpInput } from "@/lib/validations/auth";
import { ApiResponse } from "@/types/api";
import { baseApi } from "../index";

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

/**
 * Auth mutations
 * Injected into the base API
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<ApiResponse<User>, SignUpInput>({
      query: (credentials) => ({
        url: "/signup",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useSignupMutation } = authApi;

