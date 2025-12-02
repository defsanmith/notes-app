import { baseApi } from "..";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

interface Note {
  id: string;
  title: string;
  content: unknown;
  published: boolean;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface GetAdminNotesParams {
  userId?: string;
  page: number;
  limit: number;
}

interface GetAdminNotesResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
}

interface GetUsersParams {
  search?: string;
  page: number;
  limit: number;
}

interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Admin API endpoints
 * - Get all notes with user information
 * - Get single note (admin read-only)
 * - Get all users with search
 */
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminNotes: builder.query<GetAdminNotesResponse, GetAdminNotesParams>({
      query: ({ userId, page, limit }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (userId) {
          params.append("userId", userId);
        }
        return `/admin/notes?${params.toString()}`;
      },
      transformResponse: (response: { data: GetAdminNotesResponse }) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.notes.map(({ id }) => ({
                type: "Admin" as const,
                id,
              })),
              { type: "Admin", id: "LIST" },
            ]
          : [{ type: "Admin", id: "LIST" }],
    }),
    getAdminNote: builder.query<Note, string>({
      query: (noteId) => `/admin/notes/${noteId}`,
      transformResponse: (response: { data: Note }) => response.data,
      providesTags: (result, error, noteId) => [{ type: "Admin", id: noteId }],
    }),
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: ({ search, page, limit }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (search) {
          params.append("search", search);
        }
        return `/admin/users?${params.toString()}`;
      },
      transformResponse: (response: { data: GetUsersResponse }) =>
        response.data,
      providesTags: [{ type: "Admin", id: "USERS" }],
    }),
  }),
});

export const { useGetAdminNotesQuery, useGetAdminNoteQuery, useGetUsersQuery } =
  adminApi;
