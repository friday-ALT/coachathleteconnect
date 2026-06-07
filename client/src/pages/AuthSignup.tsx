import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { OryzoAuthFrame } from "@/components/oryzo/OryzoAuthFrame";
import { apiRequest } from "@/lib/queryClient";
import { getSignupSuccessPath } from "@/lib/postAuthNavigation";
import type { ActiveRole } from "@/hooks/useRole";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

function parseApiError(err: unknown): string {
  const msg = (err as Error)?.message ?? "";
  const jsonMatch = msg.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const body = JSON.parse(jsonMatch[0]) as { error?: string };
      if (body.error) return body.error;
    } catch {
      /* ignore */
    }
  }
  return msg || "Failed to create account";
}

export default function AuthSignup() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const roleParam = urlParams.get("role") as ActiveRole;
  const loginHref =
    roleParam === "athlete" || roleParam === "coach"
      ? `/auth/login?role=${roleParam}`
      : "/auth/login";
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await apiRequest("POST", "/api/auth/signup", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.requiresVerification) {
        setEmailSent(true);
        setSubmittedEmail(form.getValues("email"));
        return;
      }
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/auth/user"] }),
        queryClient.refetchQueries({ queryKey: ["/api/auth/session"] }),
      ]);
      setLocation(getSignupSuccessPath(roleParam));
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/resend-verification", {
        email: submittedEmail,
      });
      return response.json();
    },
  });

  if (emailSent) {
    return (
      <OryzoAuthFrame title="Verify email" lead="Check your inbox to finish creating your account.">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--helix-green)]/10">
            <Mail className="h-10 w-10 text-[var(--helix-green)]" />
          </div>

          <p className="mb-8 text-[var(--helix-gray-400)] max-w-sm">
            We sent a verification link to <strong className="text-[var(--helix-gray-100)]">{submittedEmail}</strong>
          </p>

          <Alert className="mb-6 max-w-sm">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Click the link in the email to verify your account. The link expires in 24 hours.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-[var(--helix-gray-500)] max-w-sm">
            Didn't receive it?{" "}
            <button
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="text-[var(--helix-green)] font-medium underline hover:no-underline disabled:opacity-50"
            >
              {resendMutation.isPending ? "Sending..." : "Resend email"}
            </button>
          </p>

          {resendMutation.isSuccess && (
            <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-200 max-w-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                Verification email sent!
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={() => setLocation(loginHref)} variant="ghost" className="mt-8">
            Back to Log In
          </Button>
        </div>
      </OryzoAuthFrame>
    );
  }

  return (
    <OryzoAuthFrame
      title="Create account"
      lead={
        roleParam === "coach"
          ? "Sign up as a coach. You can complete your profile after verifying your email."
          : roleParam === "athlete"
            ? "Sign up as an athlete. Find coaches and book sessions once you're in."
            : "Create your CoachConnect account. Pick athlete or coach after you sign in."
      }
    >
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => signupMutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      className="h-12"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="At least 8 characters" 
                      className="h-12"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm your password" 
                      className="h-12"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {signupMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {parseApiError(signupMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base mt-6 rounded-full bg-[var(--helix-green)] hover:bg-[var(--helix-green-dim)] text-[var(--helix-black)]"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={loginHref} className="text-[var(--helix-green)] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
    </OryzoAuthFrame>
  );
}
