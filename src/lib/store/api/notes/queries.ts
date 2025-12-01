import { ApiResponse } from "@/types/api";
import { baseApi } from "../index";

export interface Note {
  id: string;
  title: string;
  content: unknown;
  published: boolean;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface CreateNoteInput {
  title: string;
  content?: unknown;
}

interface UpdateNoteInput {
  title?: string;
  content?: unknown;
}

/**
 * Notes queries and mutations
 * Injected into the base API
 */
export const notesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query<Note[], void>({
      query: () => "/notes",
      transformResponse: (response: ApiResponse<Note[]>) => response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Note" as const, id })),
              { type: "Note", id: "LIST" },
            ]
          : [{ type: "Note", id: "LIST" }],
    }),
    getNote: builder.query<Note, string>({
      query: (noteId) => `/notes/${noteId}`,
      transformResponse: (response: ApiResponse<Note>) => {
        if (!response.data) {
          throw new Error("Note not found");
        }
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: "Note", id }],
    }),
    createNote: builder.mutation<Note, CreateNoteInput>({
      query: (data) => ({
        url: "/notes",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Note>) => {
        if (!response.data) {
          throw new Error("Failed to create note");
        }
        return response.data;
      },
      invalidatesTags: [{ type: "Note", id: "LIST" }],
    }),
    updateNote: builder.mutation<
      Note,
      { noteId: string; data: UpdateNoteInput }
    >({
      query: ({ noteId, data }) => ({
        url: `/notes/${noteId}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Note>) => {
        if (!response.data) {
          throw new Error("Failed to update note");
        }
        return response.data;
      },
      // Optimistic update
      async onQueryStarted({ noteId, data }, { dispatch, queryFulfilled }) {
        // Optimistically update the cache
        const patchResult = dispatch(
          notesApi.util.updateQueryData("getNote", noteId, (draft) => {
            Object.assign(draft, data);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { noteId }) => [
        { type: "Note", id: noteId },
        { type: "Note", id: "LIST" },
      ],
    }),
    deleteNote: builder.mutation<void, string>({
      query: (noteId) => ({
        url: `/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, noteId) => [
        { type: "Note", id: noteId },
        { type: "Note", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApi;

