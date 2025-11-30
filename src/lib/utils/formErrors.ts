import { FormFieldErrors } from "@/types/api";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Apply API field errors to React Hook Form
 * 
 * @param errors - Field errors from API response in RHF format
 * @param setError - setError function from useForm hook
 * 
 * @example
 * ```tsx
 * const { setError } = useForm<SignUpInput>();
 * 
 * try {
 *   await signup(data).unwrap();
 * } catch (error) {
 *   if (error.data?.error && typeof error.data.error === 'object') {
 *     applyFormErrors(error.data.error, setError);
 *   }
 * }
 * ```
 */
export function applyFormErrors<T extends FieldValues>(
  errors: FormFieldErrors,
  setError: UseFormSetError<T>
): void {
  Object.entries(errors).forEach(([fieldName, error]) => {
    setError(fieldName as Path<T>, {
      type: error.type,
      message: error.message,
    });
  });
}

