import { SignIn } from "@/components/views/auth/sign-in";

export default function SignInPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignIn />
      </div>
    </div>
  );
}
