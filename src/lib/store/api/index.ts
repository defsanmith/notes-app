import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Base API slice for RTK Query
 * All endpoints are injected using injectEndpoints in separate files
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  tagTypes: ["User", "Auth", "Note", "Admin"],
  endpoints: () => ({}),
});
