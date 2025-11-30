/**
 * Form field error type matching React Hook Form's FieldError structure
 */
export interface FormFieldError {
  type: string;
  message: string;
}

/**
 * Collection of form field errors keyed by field name
 * Compatible with React Hook Form's error format
 */
export type FormFieldErrors = Record<string, FormFieldError>;

/**
 * Generic API Response type used across all API route handlers
 * Ensures consistent response structure throughout the application
 * 
 * - For successful responses: success=true, data contains the payload
 * - For field validation errors: success=false, error contains FormFieldErrors
 * - For general errors: success=false, error is a string (handled by middleware toast)
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | FormFieldErrors;
}

/**
 * Helper type for successful API responses
 */
export type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

/**
 * Helper type for error API responses with field errors
 */
export type FieldErrorResponse = {
  success: false;
  error: FormFieldErrors;
  message?: string;
};

/**
 * Helper type for error API responses with general errors
 */
export type GeneralErrorResponse = {
  success: false;
  error: string;
  message?: string;
};

/**
 * Union type for all error responses
 */
export type ErrorResponse = FieldErrorResponse | GeneralErrorResponse;

/**
 * Type guard to check if error is field errors
 */
export function isFieldErrors(
  error: string | FormFieldErrors | undefined
): error is FormFieldErrors {
  return typeof error === "object" && error !== null;
}

/**
 * Type guard to check if error is a general error string
 */
export function isGeneralError(
  error: string | FormFieldErrors | undefined
): error is string {
  return typeof error === "string";
}

