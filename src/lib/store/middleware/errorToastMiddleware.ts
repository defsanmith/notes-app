import { isFulfilled, isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

/**
 * Redux middleware that shows toast notifications for API responses
 * 
 * Behavior:
 * - Shows error toasts for all failed API requests (queries and mutations)
 * - Shows success toasts ONLY for successful mutations (not GET requests)
 * - Success toasts are shown only if the API response includes a 'message' field
 */
export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  // Check if this is a rejected action from RTK Query
  if (isRejectedWithValue(action)) {
    const payload = action.payload as {
      data?: {
        error?: string | Record<string, string>;
        message?: string;
      };
      status?: number;
    };

    // Extract error message
    let errorMessage = "An error occurred";

    if (payload?.data) {
      if (typeof payload.data.error === "string") {
        errorMessage = payload.data.error;
      } else if (payload.data.message) {
        errorMessage = payload.data.message;
      } else if (typeof payload.data.error === "object") {
        // If error is an object with field errors, show the first one
        const errors = Object.values(payload.data.error);
        if (errors.length > 0) {
          errorMessage = errors[0];
        }
      }
    }

    // Show error toast
    toast.error(errorMessage);
  }

  // Check if this is a fulfilled mutation (not query) from RTK Query
  // RTK Query mutations have endpointName in meta and type is not 'query'
  if (
    isFulfilled(action) &&
    action.meta?.arg &&
    typeof action.meta.arg === "object" &&
    "endpointName" in action.meta.arg &&
    "type" in action.meta.arg &&
    action.meta.arg.type === "mutation"
  ) {
    const payload = action.payload as {
      success?: boolean;
      message?: string;
    };

    // Show success toast if message is provided
    if (payload?.message) {
      toast.success(payload.message);
    }
  }

  return next(action);
};

